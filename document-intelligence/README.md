# Sustanica Document Intelligence

An isolated FastAPI + Docling service for deterministic ESG candidate
extraction. It writes only to the new tables in `migrations/001_document_intelligence.sql`;
it never writes answers to `questionnaires` or invokes report generation.
No LLM provider or external LLM API is used.

## Existing-app boundary

The current React app uses a custom `register`-table login and stores a local
session. It does not receive a Supabase Auth access token. The API therefore
requires a verified Supabase JWT and checks that its `sub` is the same UUID as
the active `register.id`. Until the application authentication is connected to
Supabase Auth (or a separately reviewed token bridge is added), the existing
browser session cannot call these APIs. The questionnaire and report modules
remain untouched. This is an explicit integration limitation, not an insecure
fallback to a client-supplied organization ID.

## Setup

Requires Python 3.11+, PostgreSQL/Supabase, and a persistent private storage
volume for the service. Copy `.env.example` to `.env` and configure:

- `DI_DATABASE_URL`: server-side PostgreSQL connection string with permission to
  apply the migration and access `register`.
- `DI_SUPABASE_URL`: used to fetch signing keys for Supabase Auth JWTs.
- `DI_JWT_SECRET`: optional legacy HS256 Supabase JWT signing secret when the
  project uses symmetric signing. Keep it server-side only.
- `DI_STORAGE_ROOT`: private writable volume, outside the static web root.
- Upload/page/time limits and CORS origins as shown in `.env.example`.

Apply the migration using the project's PostgreSQL migration workflow or:

```powershell
psql $env:DI_DATABASE_URL -f migrations/001_document_intelligence.sql
```

Install and run the API and worker in separate processes:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[test]"
uvicorn app.main:app --host 127.0.0.1 --port 8000
python -m app.extraction.worker
```

Docling OCR and table structure are explicitly enabled for PDFs. Install and
verify a supported OCR runtime according to the [Docling installation guide](https://docling-project.github.io/docling/getting_started/installation/).
The worker limits file size and pages, records incomplete output, and retries
failed jobs. Keep the worker on a persistent host; local disk must be private
and shared by API and worker processes.

## API

All endpoints except `/health` require `Authorization: Bearer <Supabase access token>`.

- `POST /documents` uploads a validated file and queues an idempotent job.
- `GET /documents`, `GET /documents/{id}` list documents and report progress.
- `GET /documents/{id}/file` streams the retained original; append `#page=N` in
  the browser to navigate to a source page.
- `GET /documents/{id}/sections`, `/tables`, and `/evidence?page=N` return
  source content with provenance.
- `GET /datapoints` lists candidates.
- `PATCH /datapoints/{id}/review` edits and approves or rejects a candidate.
- `GET /datapoints/{id}/mappings` returns transparent rule matches.
- `PATCH /mappings/{id}/review` records a human review of a mapping suggestion.

The API's organization is derived from the verified token and `register` row.
No endpoint accepts an organization ID from the caller. Review approval remains
in the extraction tables and does not change questionnaire answers.

## Rule configuration and validation

`config/framework_mappings.json` contains reviewed literal-term rules using
IDs from the existing `public/questions.json`; adjust it only with known IDs.
The current questionnaire has GRI, BRSR, SASB, TCFD, and UNGC IDs. IFRS S2 has
no separate question IDs in the checked-in list, so add mappings only after
the application supplies the right existing IDs. Rules emit `potentially_relevant`,
never compliance or disclosure completion.

Run unit tests with:

```powershell
python -m pytest
```

The tests use controlled Docling-shaped fixtures and deterministic rules. They
do not represent real-world OCR accuracy. A real PDF/image benchmark, PostgreSQL
RLS integration run, API auth test, and multi-tenant deployment test remain
deployment acceptance tasks.
