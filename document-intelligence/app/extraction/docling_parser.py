"""Docling-backed parsing with page provenance and incomplete-result reporting."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable


@dataclass(frozen=True)
class ParsedSection:
    text: str
    page_number: int | None
    section_path: str | None
    label: str
    extraction_method: str = "docling"


@dataclass(frozen=True)
class ParsedTable:
    table_id: str
    page_number: int | None
    section_path: str | None
    cells: list[list[str]]


@dataclass(frozen=True)
class ParsedDocument:
    metadata: dict[str, Any]
    sections: list[ParsedSection]
    tables: list[ParsedTable]
    incomplete: bool
    warnings: list[str]


def _page_number(item: dict[str, Any]) -> int | None:
    provenance = item.get("prov") or item.get("provenance") or []
    if isinstance(provenance, dict):
        provenance = [provenance]
    for entry in provenance:
        if not isinstance(entry, dict):
            continue
        page = entry.get("page_no", entry.get("page"))
        if page is not None:
            try:
                return int(page)
            except (TypeError, ValueError):
                pass
    return None


def _cell_text(cell: Any) -> str:
    if isinstance(cell, str):
        return cell
    if isinstance(cell, dict):
        return str(cell.get("text") or cell.get("content") or "")
    return str(cell or "")


def _table_cells(item: dict[str, Any]) -> list[list[str]]:
    data = item.get("data") or item.get("table_data") or {}
    cells = data.get("table_cells", data.get("cells", [])) if isinstance(data, dict) else []
    if cells and isinstance(cells[0], list):
        return [[_cell_text(cell) for cell in row] for row in cells]
    if not cells:
        return []
    max_row = max(int(cell.get("start_row_offset_idx", cell.get("row", 0)) or 0) for cell in cells if isinstance(cell, dict))
    max_col = max(int(cell.get("start_col_offset_idx", cell.get("col", 0)) or 0) for cell in cells if isinstance(cell, dict))
    rows = [["" for _ in range(max_col + 1)] for _ in range(max_row + 1)]
    for cell in cells:
        if not isinstance(cell, dict):
            continue
        row = int(cell.get("start_row_offset_idx", cell.get("row", 0)) or 0)
        col = int(cell.get("start_col_offset_idx", cell.get("col", 0)) or 0)
        rows[row][col] = _cell_text(cell)
    return rows


def parse_with_docling(
    path: Path,
    converter_factory: Callable[[], Any] | None = None,
    max_pages: int = 500,
    max_bytes: int = 100 * 1024 * 1024,
    timeout_seconds: int = 900,
) -> ParsedDocument:
    """Convert a local file. Limits are enforced before invoking Docling.

    A converter factory is injectable to make the serialization layer testable
    without loading OCR models. Conversion exceptions are surfaced to the job
    runner, which records a failed job rather than dropping the document.
    """
    path = Path(path)
    size = path.stat().st_size
    if size > max_bytes:
        raise ValueError(f"Document exceeds configured {max_bytes}-byte limit")
    if converter_factory is None:
        from docling.datamodel.base_models import InputFormat
        from docling.datamodel.pipeline_options import PdfPipelineOptions
        from docling.document_converter import DocumentConverter, PdfFormatOption
        options = PdfPipelineOptions()
        options.do_ocr = True
        options.do_table_structure = True
        options.document_timeout = timeout_seconds
        converter_factory = lambda: DocumentConverter(format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=options),
        })
    result = converter_factory().convert(path, max_num_pages=max_pages, max_file_size=max_bytes)
    status = str(getattr(result, "status", "success")).casefold()
    if "failure" in status or "error" in status:
        raise RuntimeError(f"Docling conversion returned status {status}")
    document = result.document
    payload = document.export_to_dict()
    sections: list[ParsedSection] = []
    tables: list[ParsedTable] = []
    headings: list[tuple[int, str]] = []
    warnings: list[str] = []
    if "partial" in status:
        warnings.append(f"Docling reported partial conversion status: {status}")
    body = payload.get("body") or {}
    texts = payload.get("texts") or []

    def resolve(ref: Any) -> dict[str, Any] | None:
        if isinstance(ref, dict):
            return ref
        if isinstance(ref, str) and ref.startswith("#/"):
            node: Any = payload
            for part in ref[2:].split("/"):
                node = node[int(part)] if isinstance(node, list) else node.get(part) if isinstance(node, dict) else None
            return node if isinstance(node, dict) else None
        return None

    refs = body.get("children", []) if isinstance(body, dict) else []
    for ref in refs:
        item = resolve(ref)
        if not item:
            warnings.append("A document body reference could not be resolved")
            continue
        label = str(item.get("label") or item.get("type") or "text").casefold()
        text = str(item.get("text") or item.get("orig") or item.get("content") or "").strip()
        if "table" in label or item.get("data", {}).get("table_cells"):
            cells = _table_cells(item)
            if cells:
                tables.append(ParsedTable(f"table-{len(tables) + 1}", _page_number(item), " > ".join(title for _, title in headings) or None, cells))
                text = "\n".join(" | ".join(row) for row in cells)
        if "section_header" in label or "heading" in label or label == "title":
            level = int(item.get("level") or item.get("hierarchy_level") or 1)
            headings = [(depth, title) for depth, title in headings if depth < level]
            if text:
                headings.append((level, text))
        if text:
            sections.append(ParsedSection(text, _page_number(item), " > ".join(title for _, title in headings) or None, label))

    if not sections:
        markdown = document.export_to_markdown().strip()
        if markdown:
            sections.append(ParsedSection(markdown, None, None, "document_markdown"))
            warnings.append("Structured content items were unavailable; retained full-document Markdown")
    if not sections:
        warnings.append("Docling returned no extractable text or table content")
    pages = payload.get("pages") or {}
    metadata = payload.get("name") or payload.get("origin") or {}
    return ParsedDocument(
        metadata={"origin": metadata, "page_count": len(pages), "docling_version": payload.get("version")},
        sections=sections, tables=tables, incomplete=bool(warnings), warnings=warnings,
    )
