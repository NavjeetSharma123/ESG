# Document Intelligence Architecture

## Existing application

The checked-in application is a React 17 / Create React App frontend in
`esg-reporting-website`. It uses Supabase JS for authentication, the `register`
and `questionnaires` tables, and Supabase Storage. The frontend currently
contains the questionnaire in `ESGReportForm.js`, framework/disclosure helpers
in `src/utils`, and report generation in `src/utils/reportGenerator.js` and
`src/components/reportTemplates/InvestorESGReportPdfTemplate.js`.

There is no Python service, FastAPI application, migration tool, or background
job infrastructure in this repository. The `jevbot` directory is unrelated.
The extraction feature therefore belongs in a new isolated `document-intelligence`
service. It must not change questionnaire storage, answer validation, or report
generation behavior.

## Proposed data flow

1. The signed-in frontend requests an upload from the document-intelligence API.
2. The API verifies the Supabase access token and resolves the user's `register`
   row. That row ID is the current application organization identifier.
3. The API validates extension, MIME type, size, and content signature, hashes
   the bytes, stores the immutable original under an organization-scoped path,
   and creates an idempotent extraction job.
4. A worker claims the job and parses the file with Docling. It persists page
   sections and table structure with original text and provenance.
5. Deterministic Python rules identify candidate ESG datapoints. Every candidate
   retains source text, page, section/table references, extraction method,
   validation state, and review state. Ambiguous or invalid candidates require
   human review.
6. Rule-based framework mappings point only to configured existing question
   IDs. A mapping is never a compliance or questionnaire answer.
7. The UI displays candidates and evidence. A human can edit, approve, or
   reject them. Approval only updates the extraction repository; it never
   writes into or overwrites `questionnaires`.

## Security and operations

- Supabase JWT verification is required for all organization data operations.
- Organization identity comes from the verified user profile, never request
  parameters.
- Original files are retained at private, organization-scoped storage keys.
- PostgreSQL rows include organization IDs and are designed for RLS policies.
- Large parsing work is executed by a separately run worker process; HTTP
  requests only validate, persist, and enqueue.
- No external LLM API is used. Docling parsing/OCR and deterministic rules are
  the only extraction mechanisms.

## Delivery stages

1. Architecture and data-flow documentation.
2. Deterministic normalization, candidate extraction, and transparent mapping.
3. Docling parser, job worker, and extraction tests.
4. PostgreSQL schema and tenant-scoped FastAPI endpoints.
5. Separate frontend document review interface and setup documentation.

Each stage is committed independently. Existing uncommitted questionnaire and
report changes are intentionally excluded from these commits.
