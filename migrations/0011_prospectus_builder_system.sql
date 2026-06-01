-- Migration: Prospectus Builder System Tables
-- Created: 2026-06-01
-- Description: Add tables for document extraction, section mapping, and prospectus management

-- Table: prospectus_documents
-- Stores uploaded documents with extraction results
CREATE TABLE prospectus_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(20) NOT NULL,
  file_size_bytes INT,
  s3_key VARCHAR(500),
  extracted_sections JSONB,
  mapping_result JSONB,
  extraction_method VARCHAR(50),
  last_extracted_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prospectus_documents_prospectus_id ON prospectus_documents(prospectus_id);
CREATE INDEX idx_prospectus_documents_uploaded_at ON prospectus_documents(uploaded_at DESC);

-- Table: prospectus_sections
-- Stores 12 sections of prospectus with content
CREATE TABLE prospectus_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL,
  section_name VARCHAR(255) NOT NULL,
  section_order INT NOT NULL,
  required BOOLEAN DEFAULT true,
  content TEXT,
  content_formatted JSONB,
  source_document_id UUID,
  source_section_index INT,
  is_auto_filled BOOLEAN DEFAULT false,
  auto_fill_confidence FLOAT,
  last_updated_by UUID,
  last_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prospectus_sections_prospectus_id ON prospectus_sections(prospectus_id);
CREATE INDEX idx_prospectus_sections_order ON prospectus_sections(prospectus_id, section_order);

-- Table: document_section_mappings
-- Audit trail of source-to-prospectus mappings
CREATE TABLE document_section_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospectus_id UUID NOT NULL,
  prospectus_section_id UUID NOT NULL,
  source_document_id UUID NOT NULL,
  source_section_index INT,
  source_section_name VARCHAR(255),
  confidence_score FLOAT NOT NULL,
  extraction_method VARCHAR(50),
  user_reviewed BOOLEAN DEFAULT false,
  user_approved BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_section_mappings_prospectus_id ON document_section_mappings(prospectus_id);
CREATE INDEX idx_document_section_mappings_source_doc ON document_section_mappings(source_document_id);
