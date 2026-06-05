-- Document Upload System Schema
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'empty',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'uploaded',
  uploaded_by UUID,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by UUID,
  verification_notes TEXT
);

CREATE TABLE IF NOT EXISTS document_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_by UUID NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  mandatory_completion_percentage INTEGER DEFAULT 0,
  submission_status VARCHAR(50) DEFAULT 'draft',
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_files_document_id ON document_files(document_id);
CREATE INDEX IF NOT EXISTS idx_document_files_status ON document_files(status);
CREATE INDEX IF NOT EXISTS idx_submissions_company_id ON document_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON document_submissions(submission_status);
