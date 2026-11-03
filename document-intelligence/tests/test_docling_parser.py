from pathlib import Path

from app.extraction.docling_parser import parse_with_docling


class FakeDocument:
    def export_to_dict(self):
        return {
            "name": "sample.pdf",
            "pages": {"1": {}, "2": {}},
            "body": {"children": ["#/texts/0", "#/texts/1", "#/tables/0"]},
            "texts": [
                {"label": "section_header", "text": "Energy", "prov": [{"page_no": 1}]},
                {"label": "text", "text": "Electricity consumption was 10 MWh.", "prov": [{"page_no": 1}]},
            ],
            "tables": [{"label": "table", "data": {"table_cells": [
                {"start_row_offset_idx": 0, "start_col_offset_idx": 0, "text": "Metric"},
                {"start_row_offset_idx": 0, "start_col_offset_idx": 1, "text": "Value"},
                {"start_row_offset_idx": 1, "start_col_offset_idx": 0, "text": "Water"},
                {"start_row_offset_idx": 1, "start_col_offset_idx": 1, "text": "12 kL"},
            ]}, "prov": [{"page_no": 2}]}],
        }

    def export_to_markdown(self):
        return ""


class FakeResult:
    status = "success"
    document = FakeDocument()


class FakeConverter:
    def convert(self, path, **kwargs):
        assert kwargs["max_num_pages"] == 50
        return FakeResult()


def test_docling_output_retains_sections_table_and_page_provenance(tmp_path: Path):
    source = tmp_path / "report.pdf"
    source.write_bytes(b"%PDF-1.7 fake")
    parsed = parse_with_docling(source, converter_factory=FakeConverter, max_pages=50)
    assert parsed.metadata["page_count"] == 2
    assert parsed.sections[0].text == "Energy"
    assert parsed.sections[1].page_number == 1
    assert parsed.sections[1].section_path == "Energy"
    assert parsed.tables[0].page_number == 2
    assert parsed.tables[0].cells[1] == ["Water", "12 kL"]
    assert not parsed.incomplete


def test_docling_oversized_file_is_rejected_before_conversion(tmp_path: Path):
    source = tmp_path / "report.pdf"
    source.write_bytes(b"x" * 10)
    try:
        parse_with_docling(source, converter_factory=FakeConverter, max_bytes=5)
    except ValueError as error:
        assert "exceeds" in str(error)
    else:
        raise AssertionError("oversized input should fail before Docling")
