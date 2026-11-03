"""FastAPI application for isolated document ingestion and human review."""

from __future__ import annotations

import hashlib
import json
import logging
import re
import tempfile
import zipfile
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .config import settings
from .db import close_pool, get_pool, open_pool, tenant_transaction
from .security import current_organization

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("document_intelligence.api")

ALLOWED = {".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx", ".csv"}


@asynccontextmanager
async def lifespan(_: FastAPI):
    await open_pool()
    Path(settings.storage_root).resolve().mkdir(parents=True, exist_ok=True)
    yield
    await close_pool()


app = FastAPI(title="Sustanica Document Intelligence", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[item.strip() for item in settings.api_cors_origins.split(",") if item.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)


class ReviewUpdate(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")
    value: str | None = None
    unit: str | None = None
    reporting_period: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=200)


class MappingReview(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")


def _validate_file(path: Path, suffix: str) -> str:
    with path.open("rb") as handle:
        header = handle.read(8192)
    if suffix == ".pdf" and not header.startswith(b"%PDF-"):
        raise HTTPException(415, "File content is not a PDF")
    if suffix == ".png" and not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(415, "File content is not a PNG image")
    if suffix in {".jpg", ".jpeg"} and not header.startswith(b"\xff\xd8\xff"):
        raise HTTPException(415, "File content is not a JPEG image")
    if suffix in {".docx", ".xlsx"}:
        expected = "word/document.xml" if suffix == ".docx" else "xl/workbook.xml"
        try:
            with zipfile.ZipFile(path) as package:
                if expected not in package.namelist():
                    raise HTTPException(415, f"File content is not a valid {suffix[1:].upper()} document")
        except zipfile.BadZipFile as error:
            raise HTTPException(415, "Office document package is invalid") from error
    if suffix == ".csv":
        try:
            header.decode("utf-8-sig")
        except UnicodeDecodeError as error:
            raise HTTPException(415, "CSV must be UTF-8 encoded") from error
    return {
        ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".csv": "text/csv",
    }[suffix]


async def _document(connection, document_id: UUID, organization_id: UUID):
    row = await (await connection.execute(
        "SELECT id,original_filename,content_type,file_size_bytes,status,progress,attempt_count,error_message,warning_messages,metadata,created_at,updated_at,completed_at FROM document_extraction_jobs WHERE id=%s AND organization_id=%s",
        (document_id, organization_id),
    )).fetchone()
    if not row:
        raise HTTPException(404, "Document not found")
    keys = ("id", "filename", "content_type", "size_bytes", "status", "progress", "attempts", "error", "warnings", "metadata", "created_at", "updated_at", "completed_at")
    return dict(zip(keys, row))


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/documents", status_code=202)
async def upload_document(file: UploadFile = File(...), organization_id: UUID = Depends(current_organization)):
    filename = Path(file.filename or "upload").name
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(415, "Supported formats: PDF, PNG, JPG, DOCX, XLSX, CSV")
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", filename)[:180] or f"upload{suffix}"
    size = 0
    digest = hashlib.sha256()
    root = Path(settings.storage_root).resolve()
    temp_path = None
    target_path = None
    try:
        with tempfile.NamedTemporaryFile(prefix="upload-", suffix=suffix, dir=root, delete=False) as temporary:
            temp_path = Path(temporary.name)
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.max_upload_bytes:
                    raise HTTPException(413, f"Maximum upload size is {settings.max_upload_bytes} bytes")
                digest.update(chunk)
                temporary.write(chunk)
        if size == 0:
            raise HTTPException(400, "Uploaded file is empty")
        content_type = _validate_file(temp_path, suffix)
        sha256 = digest.hexdigest()
        pool = get_pool()
        async with tenant_transaction(pool, organization_id) as connection:
            existing = await (await connection.execute(
                "SELECT id,status FROM document_extraction_jobs WHERE organization_id=%s AND sha256=%s",
                (organization_id, sha256),
            )).fetchone()
            if existing:
                return {"id": existing[0], "status": existing[1], "duplicate": True}
            relative_key = Path(str(organization_id)) / f"{sha256}-{uuid4().hex}{suffix}"
            target = (root / relative_key).resolve()
            if root not in target.parents:
                raise HTTPException(400, "Invalid storage path")
            target.parent.mkdir(parents=True, exist_ok=True)
            temp_path.replace(target)
            target_path = target
            row = await (await connection.execute(
                """INSERT INTO document_extraction_jobs(organization_id,original_filename,content_type,file_size_bytes,sha256,storage_key)
                   VALUES(%s,%s,%s,%s,%s,%s) ON CONFLICT(organization_id,sha256) DO NOTHING RETURNING id,status""",
                (organization_id, safe_name, content_type, size, sha256, str(relative_key)),
            )).fetchone()
            if row is None:
                row = await (await connection.execute(
                    "SELECT id,status FROM document_extraction_jobs WHERE organization_id=%s AND sha256=%s",
                    (organization_id, sha256),
                )).fetchone()
                target.unlink(missing_ok=True)
                target_path = None
                return {"id": row[0], "status": row[1], "duplicate": True}
            await connection.execute(
                "INSERT INTO document_intelligence_audit_log(organization_id,document_id,action,details) VALUES(%s,%s,'document_uploaded',%s::jsonb)",
                (organization_id, row[0], json.dumps({"filename": safe_name, "size": size, "sha256": sha256})),
            )
            return {"id": row[0], "status": row[1], "duplicate": False}
    except Exception:
        if target_path is not None:
            target_path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


@app.get("/documents")
async def list_documents(organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        rows = await (await connection.execute(
            "SELECT id,original_filename,content_type,file_size_bytes,status,progress,error_message,warning_messages,created_at,updated_at,completed_at FROM document_extraction_jobs WHERE organization_id=%s ORDER BY created_at DESC LIMIT 200",
            (organization_id,),
        )).fetchall()
    return [{"id": row[0], "filename": row[1], "content_type": row[2], "size_bytes": row[3], "status": row[4], "progress": row[5], "error": row[6], "warnings": row[7], "created_at": row[8], "updated_at": row[9], "completed_at": row[10]} for row in rows]


@app.get("/documents/{document_id}")
async def document_status(document_id: UUID, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        return await _document(connection, document_id, organization_id)


@app.get("/documents/{document_id}/file")
async def document_file(document_id: UUID, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        await _document(connection, document_id, organization_id)
        row = await (await connection.execute("SELECT storage_key,content_type,original_filename FROM document_extraction_jobs WHERE id=%s AND organization_id=%s", (document_id, organization_id))).fetchone()
    root = Path(settings.storage_root).resolve()
    path = (root / row[0]).resolve()
    if root not in path.parents or not path.is_file():
        raise HTTPException(404, "Original document is unavailable")
    return FileResponse(path, media_type=row[1], filename=row[2], content_disposition_type="inline")


@app.get("/documents/{document_id}/sections")
async def document_sections(document_id: UUID, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        await _document(connection, document_id, organization_id)
        rows = await (await connection.execute("SELECT id,ordinal,text,page_number,section_path,label,extraction_method FROM extracted_document_sections WHERE document_id=%s AND organization_id=%s ORDER BY ordinal", (document_id, organization_id))).fetchall()
    return [{"id": r[0], "ordinal": r[1], "text": r[2], "page": r[3], "section": r[4], "label": r[5], "method": r[6]} for r in rows]


@app.get("/documents/{document_id}/tables")
async def document_tables(document_id: UUID, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        await _document(connection, document_id, organization_id)
        rows = await (await connection.execute("SELECT id,ordinal,page_number,section_path,cells FROM extracted_tables WHERE document_id=%s AND organization_id=%s ORDER BY ordinal", (document_id, organization_id))).fetchall()
    return [{"id": r[0], "ordinal": r[1], "page": r[2], "section": r[3], "cells": r[4]} for r in rows]


@app.get("/documents/{document_id}/evidence")
async def document_evidence(document_id: UUID, page: int | None = None, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        await _document(connection, document_id, organization_id)
        sql = "SELECT id,datapoint_id,page_number,section_id,table_id,excerpt FROM esg_evidence_references WHERE document_id=%s AND organization_id=%s"
        params: tuple = (document_id, organization_id)
        if page is not None:
            sql += " AND page_number=%s"
            params += (page,)
        rows = await (await connection.execute(sql + " ORDER BY page_number,id", params)).fetchall()
    return [{"id": r[0], "datapoint_id": r[1], "page": r[2], "section_id": r[3], "table_id": r[4], "excerpt": r[5]} for r in rows]


@app.get("/datapoints")
async def list_datapoints(document_id: UUID | None = None, review_status: str | None = None, organization_id: UUID = Depends(current_organization)):
    sql = "SELECT id,document_id,category,name,original_text,extracted_value,unit,reporting_period,source_page,source_section,source_table_id,extraction_method,validation_status,review_status,created_at,updated_at FROM extracted_esg_datapoints WHERE organization_id=%s"
    params: tuple = (organization_id,)
    if document_id:
        sql += " AND document_id=%s"
        params += (document_id,)
    if review_status:
        sql += " AND review_status=%s"
        params += (review_status,)
    async with tenant_transaction(get_pool(), organization_id) as connection:
        rows = await (await connection.execute(sql + " ORDER BY created_at DESC LIMIT 1000", params)).fetchall()
    fields = ("id", "document_id", "category", "name", "original_text", "value", "unit", "reporting_period", "source_page", "source_section", "source_table_id", "extraction_method", "validation_status", "review_status", "created_at", "updated_at")
    return [dict(zip(fields, row)) for row in rows]


@app.patch("/datapoints/{datapoint_id}/review")
async def review_datapoint(datapoint_id: UUID, update: ReviewUpdate, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        row = await (await connection.execute("SELECT id,document_id FROM extracted_esg_datapoints WHERE id=%s AND organization_id=%s FOR UPDATE", (datapoint_id, organization_id))).fetchone()
        if not row:
            raise HTTPException(404, "Extracted value not found")
        if update.status == "approved":
            await connection.execute(
                """UPDATE extracted_esg_datapoints SET review_status='approved',reviewer_id=%s,reviewed_at=now(),
                   extracted_value=COALESCE(%s,extracted_value),unit=COALESCE(%s,unit),reporting_period=COALESCE(%s,reporting_period),name=COALESCE(%s,name),updated_at=now()
                   WHERE id=%s AND organization_id=%s""",
                (organization_id, update.value, update.unit, update.reporting_period, update.name, datapoint_id, organization_id),
            )
        else:
            await connection.execute("UPDATE extracted_esg_datapoints SET review_status='rejected',reviewer_id=%s,reviewed_at=now(),updated_at=now() WHERE id=%s AND organization_id=%s", (organization_id, datapoint_id, organization_id))
        await connection.execute(
            "INSERT INTO document_intelligence_audit_log(organization_id,actor_id,document_id,datapoint_id,action,details) VALUES(%s,%s,%s,%s,%s,%s::jsonb)",
            (organization_id, organization_id, row[1], datapoint_id, f"datapoint_{update.status}", update.model_dump_json(exclude_none=True)),
        )
    return {"id": datapoint_id, "status": update.status}


@app.get("/datapoints/{datapoint_id}/mappings")
async def datapoint_mappings(datapoint_id: UUID, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        exists = await (await connection.execute("SELECT 1 FROM extracted_esg_datapoints WHERE id=%s AND organization_id=%s", (datapoint_id, organization_id))).fetchone()
        if not exists:
            raise HTTPException(404, "Extracted value not found")
        rows = await (await connection.execute("SELECT id,framework,framework_question_id,mapping_rule,mapping_status,supporting_evidence,review_status FROM framework_data_mappings WHERE datapoint_id=%s AND organization_id=%s", (datapoint_id, organization_id))).fetchall()
    return [{"id": r[0], "framework": r[1], "question_id": r[2], "rule": r[3], "status": r[4], "evidence": r[5], "review_status": r[6]} for r in rows]


@app.patch("/mappings/{mapping_id}/review")
async def review_mapping(mapping_id: UUID, update: MappingReview, organization_id: UUID = Depends(current_organization)):
    async with tenant_transaction(get_pool(), organization_id) as connection:
        row = await (await connection.execute("SELECT datapoint_id FROM framework_data_mappings WHERE id=%s AND organization_id=%s FOR UPDATE", (mapping_id, organization_id))).fetchone()
        if not row:
            raise HTTPException(404, "Framework mapping not found")
        await connection.execute(
            "UPDATE framework_data_mappings SET review_status=%s,reviewer_id=%s,reviewed_at=now() WHERE id=%s AND organization_id=%s",
            (update.status, organization_id, mapping_id, organization_id),
        )
        await connection.execute(
            "INSERT INTO document_intelligence_audit_log(organization_id,actor_id,datapoint_id,action,details) VALUES(%s,%s,%s,%s,%s::jsonb)",
            (organization_id, organization_id, row[0], f"mapping_{update.status}", update.model_dump_json()),
        )
    return {"id": mapping_id, "review_status": update.status}
