"""Standalone extraction worker; HTTP requests never run document conversion."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from pathlib import Path
from uuid import UUID

from .config import settings
from .db import get_pool, tenant_transaction
from .docling_parser import parse_with_docling
from .mapping import FrameworkRule, map_datapoint
from .normalization import content_fingerprint
from .rules import EvidenceSpan, extract_candidates

logger = logging.getLogger("document_intelligence.worker")
MAPPING_FILE = Path(__file__).resolve().parents[2] / "config" / "framework_mappings.json"


def configured_mappings() -> list[FrameworkRule]:
    if not MAPPING_FILE.exists():
        return []
    return [FrameworkRule(**item) for item in json.loads(MAPPING_FILE.read_text(encoding="utf-8"))]


async def claim_job():
    pool = get_pool()
    async with pool.connection() as connection:
        async with connection.transaction():
            await connection.execute("SELECT set_config('app.is_worker', 'true', true)")
            row = await (await connection.execute(
                """SELECT id, organization_id, storage_key, attempt_count FROM document_extraction_jobs
                   WHERE status = 'queued' OR (status = 'processing' AND updated_at < now() - interval '30 minutes')
                   ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1"""
            )).fetchone()
            if not row:
                return None
            await connection.execute(
                "UPDATE document_extraction_jobs SET status='processing', progress=5, attempt_count=attempt_count+1, updated_at=now() WHERE id=%s",
                (row[0],),
            )
            return {"id": row[0], "organization_id": row[1], "storage_key": row[2], "attempt_count": row[3] + 1}


async def process_job(job: dict) -> None:
    pool = get_pool()
    organization_id = UUID(str(job["organization_id"]))
    document_id = UUID(str(job["id"]))
    root = Path(settings.storage_root).resolve()
    path = (root / job["storage_key"]).resolve()
    if root not in path.parents:
        raise ValueError("Stored document path escaped the private storage root")
    parsed = await asyncio.wait_for(
        asyncio.to_thread(parse_with_docling, path, None, settings.max_document_pages, settings.max_upload_bytes, settings.parser_timeout_seconds),
        timeout=settings.parser_timeout_seconds,
    )
    section_ids: dict[int, UUID] = {}
    table_ids: dict[int, UUID] = {}
    async with tenant_transaction(pool, organization_id) as connection:
        await connection.execute("DELETE FROM extracted_esg_datapoints WHERE document_id=%s", (document_id,))
        await connection.execute("DELETE FROM extracted_document_sections WHERE document_id=%s", (document_id,))
        await connection.execute("DELETE FROM extracted_tables WHERE document_id=%s", (document_id,))
        for index, section in enumerate(parsed.sections):
            row = await (await connection.execute(
                """INSERT INTO extracted_document_sections(organization_id,document_id,ordinal,text,page_number,section_path,label,extraction_method)
                   VALUES(%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (organization_id, document_id, index, section.text, section.page_number, section.section_path, section.label, section.extraction_method),
            )).fetchone()
            if section.page_number is not None:
                section_ids.setdefault(section.page_number, row[0])
        for index, table in enumerate(parsed.tables):
            row = await (await connection.execute(
                """INSERT INTO extracted_tables(organization_id,document_id,ordinal,page_number,section_path,cells)
                   VALUES(%s,%s,%s,%s,%s,%s::jsonb) RETURNING id""",
                (organization_id, document_id, index, table.page_number, table.section_path, json.dumps(table.cells)),
            )).fetchone()
            if table.page_number is not None:
                table_ids.setdefault(table.page_number, row[0])

        spans = [EvidenceSpan(
            text=section.text, page_number=section.page_number, section=section.section_path,
            table_id=str(table_ids[section.page_number]) if section.page_number in table_ids else None,
            extraction_method=section.extraction_method,
        ) for section in parsed.sections]
        points = extract_candidates(spans, organization_id, document_id)
        mapping_rules = configured_mappings()
        for point in points:
            content_hash = content_fingerprint(point.category, point.name, point.source_page, point.original_text)
            row = await (await connection.execute(
                """INSERT INTO extracted_esg_datapoints(organization_id,document_id,category,name,original_text,extracted_value,unit,reporting_period,source_page,source_section,source_table_id,extraction_method,validation_status,review_status,content_hash)
                   VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                   ON CONFLICT(document_id,content_hash) DO NOTHING RETURNING id""",
                (organization_id, document_id, point.category, point.name, point.original_text, point.value, point.unit, point.reporting_period, point.source_page, point.source_section,
                 table_ids.get(point.source_page), point.extraction_method, point.validation_status, point.review_status, content_hash),
            )).fetchone()
            if not row:
                continue
            datapoint_id = row[0]
            await connection.execute(
                "INSERT INTO extraction_validation_results(organization_id,datapoint_id,document_id,validation_type,status,details) VALUES(%s,%s,%s,'deterministic_extraction',%s,%s::jsonb)",
                (organization_id, datapoint_id, document_id, point.validation_status, json.dumps({"review_status": point.review_status, "source_page": point.source_page})),
            )
            if point.source_page in section_ids:
                await connection.execute(
                    "INSERT INTO esg_evidence_references(organization_id,document_id,datapoint_id,page_number,section_id,table_id,excerpt) VALUES(%s,%s,%s,%s,%s,%s,%s)",
                    (organization_id, document_id, datapoint_id, point.source_page, section_ids[point.source_page], table_ids.get(point.source_page), point.original_text),
                )
            for mapping in map_datapoint(point, mapping_rules):
                await connection.execute(
                    """INSERT INTO framework_data_mappings(organization_id,datapoint_id,framework,framework_question_id,mapping_rule,mapping_status,supporting_evidence)
                       VALUES(%s,%s,%s,%s,%s,%s,%s) ON CONFLICT(datapoint_id,framework,framework_question_id) DO NOTHING""",
                    (organization_id, datapoint_id, mapping.framework, mapping.question_id, mapping.rule, mapping.status, mapping.supporting_evidence),
                )
        warnings = parsed.warnings
        await connection.execute(
            """UPDATE document_extraction_jobs SET status=%s,progress=100,warning_messages=%s::jsonb,metadata=%s::jsonb,completed_at=now(),updated_at=now()
               WHERE id=%s""",
            ("completed_with_warnings" if parsed.incomplete else "completed", json.dumps(warnings), json.dumps(parsed.metadata, default=str), document_id),
        )
        await connection.execute(
            "INSERT INTO document_intelligence_audit_log(organization_id,document_id,action,details) VALUES(%s,%s,'extraction_completed',%s::jsonb)",
            (organization_id, document_id, json.dumps({"sections": len(parsed.sections), "tables": len(parsed.tables), "datapoints": len(points), "warnings": warnings})),
        )


async def run_worker(poll_seconds: float = 2.0) -> None:
    while True:
        job = await claim_job()
        if not job:
            await asyncio.sleep(poll_seconds)
            continue
        try:
            await process_job(job)
        except Exception as error:
            logger.exception("Extraction failed for job %s", job["id"])
            pool = get_pool()
            async with pool.connection() as connection:
                async with connection.transaction():
                    await connection.execute("SELECT set_config('app.is_worker', 'true', true)")
                    if job["attempt_count"] < settings.max_attempts:
                        status = "queued"
                    else:
                        status = "failed"
                    await connection.execute(
                        "UPDATE document_extraction_jobs SET status=%s,error_message=%s,updated_at=now(),completed_at=CASE WHEN %s='failed' THEN now() ELSE completed_at END WHERE id=%s",
                        (status, str(error)[:2000], status, job["id"]),
                    )
            if status == "queued":
                await asyncio.sleep(min(2 ** job["attempt_count"], 30))


async def main() -> None:
    from ..db import close_pool, open_pool
    await open_pool()
    try:
        await run_worker()
    finally:
        await close_pool()


if __name__ == "__main__":
    asyncio.run(main())
