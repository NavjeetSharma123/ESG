-- New isolated schema. No changes to questionnaires or report-generation data.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS document_extraction_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  content_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  sha256 char(64) NOT NULL,
  storage_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','completed_with_warnings','failed')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  attempt_count integer NOT NULL DEFAULT 0,
  error_message text,
  warning_messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (organization_id, sha256)
);
CREATE INDEX IF NOT EXISTS extraction_jobs_queue_idx ON document_extraction_jobs(status, created_at) WHERE status IN ('queued','processing');
CREATE INDEX IF NOT EXISTS extraction_jobs_org_idx ON document_extraction_jobs(organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS extracted_document_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES document_extraction_jobs(id) ON DELETE CASCADE,
  ordinal integer NOT NULL,
  text text NOT NULL,
  page_number integer,
  section_path text,
  label text NOT NULL,
  extraction_method text NOT NULL DEFAULT 'docling',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, ordinal)
);
CREATE INDEX IF NOT EXISTS extracted_sections_doc_page_idx ON extracted_document_sections(document_id, page_number);

CREATE TABLE IF NOT EXISTS extracted_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES document_extraction_jobs(id) ON DELETE CASCADE,
  ordinal integer NOT NULL,
  page_number integer,
  section_path text,
  cells jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, ordinal)
);
CREATE INDEX IF NOT EXISTS extracted_tables_doc_page_idx ON extracted_tables(document_id, page_number);

CREATE TABLE IF NOT EXISTS extracted_esg_datapoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES document_extraction_jobs(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('environmental','social','governance')),
  name text NOT NULL,
  original_text text NOT NULL,
  extracted_value text,
  unit text,
  reporting_period text,
  source_page integer,
  source_section text,
  source_table_id uuid REFERENCES extracted_tables(id) ON DELETE SET NULL,
  extraction_method text NOT NULL,
  validation_status text NOT NULL DEFAULT 'unvalidated',
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','needs_review','approved','rejected')),
  reviewer_id uuid REFERENCES register(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  content_hash char(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, content_hash)
);
CREATE INDEX IF NOT EXISTS datapoints_org_review_idx ON extracted_esg_datapoints(organization_id, review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS datapoints_doc_page_idx ON extracted_esg_datapoints(document_id, source_page);

CREATE TABLE IF NOT EXISTS framework_data_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  datapoint_id uuid NOT NULL REFERENCES extracted_esg_datapoints(id) ON DELETE CASCADE,
  framework text NOT NULL,
  framework_question_id text NOT NULL,
  mapping_rule text NOT NULL,
  mapping_status text NOT NULL CHECK (mapping_status IN ('evidence_found','potentially_relevant','requires_review','insufficient_evidence','no_evidence_found')),
  supporting_evidence text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  reviewer_id uuid REFERENCES register(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(datapoint_id, framework, framework_question_id)
);
CREATE INDEX IF NOT EXISTS mappings_org_framework_idx ON framework_data_mappings(organization_id, framework, framework_question_id);

CREATE TABLE IF NOT EXISTS extraction_validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  datapoint_id uuid REFERENCES extracted_esg_datapoints(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES document_extraction_jobs(id) ON DELETE CASCADE,
  validation_type text NOT NULL,
  status text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS esg_evidence_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES document_extraction_jobs(id) ON DELETE CASCADE,
  datapoint_id uuid REFERENCES extracted_esg_datapoints(id) ON DELETE CASCADE,
  page_number integer,
  section_id uuid REFERENCES extracted_document_sections(id) ON DELETE SET NULL,
  table_id uuid REFERENCES extracted_tables(id) ON DELETE SET NULL,
  excerpt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS evidence_doc_page_idx ON esg_evidence_references(document_id, page_number);

CREATE TABLE IF NOT EXISTS document_intelligence_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES register(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES register(id) ON DELETE SET NULL,
  document_id uuid REFERENCES document_extraction_jobs(id) ON DELETE SET NULL,
  datapoint_id uuid REFERENCES extracted_esg_datapoints(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- API transactions set app.organization_id after verifying the user's identity.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['document_extraction_jobs','extracted_document_sections','extracted_tables','extracted_esg_datapoints','framework_data_mappings','extraction_validation_results','esg_evidence_references','document_intelligence_audit_log'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (organization_id::text = current_setting(''app.organization_id'', true) OR current_setting(''app.is_worker'', true) = ''true'') WITH CHECK (organization_id::text = current_setting(''app.organization_id'', true) OR current_setting(''app.is_worker'', true) = ''true'')', t);
  END LOOP;
END $$;
