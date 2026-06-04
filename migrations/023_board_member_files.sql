/**
 * Board Member Files & Synchronization Schema
 *
 * Comprehensive system for managing board member documentation including:
 * - Resume storage and versioning
 * - LinkedIn profile verification with extracted data
 * - Prospectus synchronization tracking
 *
 * Tables:
 * - director_resumes: Resume uploads and file management for board members
 * - director_linkedin_verification: LinkedIn profile verification and data extraction
 * - director_prospectus_sync: Prospectus section sync status and tracking
 *
 * References: professionals table (board members are stored as professionals)
 */

-- ====================================================================
-- TABLE: DIRECTOR_RESUMES
-- ====================================================================
-- Store and manage resume uploads for board members and directors
-- Supports versioning and file tracking for compliance and prospectus updates

CREATE TABLE IF NOT EXISTS director_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign key relationship
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,

  -- File information
  file_path TEXT,                               -- Cloud storage path (S3, GCS, etc)
  file_url TEXT,                                -- Accessible URL for the file
  file_name VARCHAR(255) NOT NULL,              -- Original filename
  file_size INT NOT NULL,                       -- File size in bytes
  file_mime_type VARCHAR(100),                  -- MIME type (application/pdf, etc)
  file_hash VARCHAR(64),                        -- SHA256 hash for deduplication

  -- Version tracking
  version INT DEFAULT 1,                        -- Resume version number
  is_current BOOLEAN DEFAULT TRUE,              -- Flag for current resume

  -- Submission and verification
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Verification details
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'needs_review'
  verification_notes TEXT,

  -- Quality checks
  is_readable BOOLEAN,                          -- OCR/text extraction success
  text_extract TEXT,                            -- Extracted text content for search/validation
  page_count INT,                               -- Number of pages

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_current_resume_per_professional
    UNIQUE (professional_id, is_current)
    WHERE is_current = TRUE
);

CREATE INDEX idx_director_resumes_professional_id ON director_resumes(professional_id);
CREATE INDEX idx_director_resumes_verified_at ON director_resumes(verified_at);
CREATE INDEX idx_director_resumes_verification_status ON director_resumes(verification_status);
CREATE INDEX idx_director_resumes_is_current ON director_resumes(professional_id, is_current);
CREATE INDEX idx_director_resumes_uploaded_at ON director_resumes(uploaded_at);
CREATE INDEX idx_director_resumes_file_hash ON director_resumes(file_hash);

DROP TRIGGER IF EXISTS trigger_director_resumes_updated_at ON director_resumes;
CREATE TRIGGER trigger_director_resumes_updated_at
  BEFORE UPDATE ON director_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE: DIRECTOR_LINKEDIN_VERIFICATION
-- ====================================================================
-- Track LinkedIn profile verification and extracted professional data
-- Stores both verification metadata and extracted information for audit trail

CREATE TABLE IF NOT EXISTS director_linkedin_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign key relationship
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,

  -- LinkedIn profile information
  linkedin_url TEXT NOT NULL,
  linkedin_profile_id VARCHAR(255),             -- LinkedIn member ID if available

  -- Verification status and timing
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'failed', 'expired'
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method VARCHAR(100),             -- 'manual', 'automated_scrape', 'linkedin_api', 'oauth'
  verification_provider VARCHAR(100),           -- Third-party service used (e.g., 'clearbit', 'apollo', 'manual_review')

  -- Extracted professional data
  extracted_education JSONB DEFAULT '[]'::JSONB, -- Array of {school, degree, field_of_study, start_date, end_date, description}
  extracted_experience JSONB DEFAULT '[]'::JSONB, -- Array of {title, company, location, start_date, end_date, description}
  extracted_certifications JSONB DEFAULT '[]'::JSONB, -- Array of {name, issuer, issued_date, expiration_date, credential_id}
  extracted_skills TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of verified skills

  -- Data quality metrics
  confidence_score DECIMAL(3,2) DEFAULT 1.00,  -- 0.00-1.00 confidence in extracted data
  data_completeness_score DECIMAL(3,2),        -- % of fields extracted successfully

  -- Profile snapshot
  profile_headline VARCHAR(255),                -- LinkedIn headline
  profile_summary TEXT,                         -- LinkedIn about/summary section
  profile_url_last_checked TIMESTAMP WITH TIME ZONE,

  -- Audit and compliance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Constraints and uniqueness
  CONSTRAINT unique_professional_linkedin_verification
    UNIQUE (professional_id, linkedin_url)
);

CREATE INDEX idx_director_linkedin_verification_professional_id ON director_linkedin_verification(professional_id);
CREATE INDEX idx_director_linkedin_verification_verified_at ON director_linkedin_verification(verified_at);
CREATE INDEX idx_director_linkedin_verification_verification_status ON director_linkedin_verification(verification_status);
CREATE INDEX idx_director_linkedin_verification_confidence_score ON director_linkedin_verification(confidence_score);
CREATE INDEX idx_director_linkedin_verification_linkedin_profile_id ON director_linkedin_verification(linkedin_profile_id);

DROP TRIGGER IF EXISTS trigger_director_linkedin_verification_updated_at ON director_linkedin_verification;
CREATE TRIGGER trigger_director_linkedin_verification_updated_at
  BEFORE UPDATE ON director_linkedin_verification
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- TABLE: DIRECTOR_PROSPECTUS_SYNC
-- ====================================================================
-- Track synchronization status between board member data and prospectus sections
-- Manages which sections contain board member info and sync status with source data

CREATE TABLE IF NOT EXISTS director_prospectus_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign key relationships
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  prospectus_document_id UUID REFERENCES prospectus_documents(id) ON DELETE CASCADE,
  prospectus_section_id UUID REFERENCES prospectus_sections(id) ON DELETE CASCADE,

  -- Sync identification
  sync_key VARCHAR(100) NOT NULL,               -- Unique identifier for sync mapping (e.g., 'board_member_3', 'audit_committee_chair')
  section_type VARCHAR(100),                    -- Type of section (e.g., 'board_of_directors', 'management_team', 'audit_committee')

  -- Sync status
  sync_status VARCHAR(50) DEFAULT 'pending',    -- 'pending', 'synced', 'needs_update', 'out_of_sync', 'error'
  sync_confidence DECIMAL(3,2) DEFAULT 0.0,     -- Confidence level 0.00-1.00 of sync accuracy

  -- Sync timing
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_sync_initiated_at TIMESTAMP WITH TIME ZONE,
  next_sync_scheduled_at TIMESTAMP WITH TIME ZONE,

  -- Change detection
  data_version INT DEFAULT 1,                   -- Version of source data when last synced
  prospectus_version INT DEFAULT 1,             -- Prospectus version when synced
  is_stale BOOLEAN DEFAULT FALSE,               -- True if source data changed since sync
  stale_since TIMESTAMP WITH TIME ZONE,        -- When it became stale

  -- Field mapping
  synced_fields JSONB DEFAULT '{}'::JSONB,     -- {"field_name": "prospectus_field_path", ...}
  sync_excludes TEXT[] DEFAULT ARRAY[]::TEXT[], -- Fields excluded from sync

  -- Sync history
  sync_attempt_count INT DEFAULT 0,
  last_sync_error TEXT,
  last_sync_error_at TIMESTAMP WITH TIME ZONE,

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT unique_professional_section_sync
    UNIQUE (professional_id, prospectus_document_id, section_type)
);

CREATE INDEX idx_director_prospectus_sync_professional_id ON director_prospectus_sync(professional_id);
CREATE INDEX idx_director_prospectus_sync_prospectus_document_id ON director_prospectus_sync(prospectus_document_id);
CREATE INDEX idx_director_prospectus_sync_prospectus_section_id ON director_prospectus_sync(prospectus_section_id);
CREATE INDEX idx_director_prospectus_sync_sync_status ON director_prospectus_sync(sync_status);
CREATE INDEX idx_director_prospectus_sync_is_stale ON director_prospectus_sync(is_stale);
CREATE INDEX idx_director_prospectus_sync_last_synced_at ON director_prospectus_sync(last_synced_at);
CREATE INDEX idx_director_prospectus_sync_section_type ON director_prospectus_sync(section_type);
CREATE INDEX idx_director_prospectus_sync_stale_since ON director_prospectus_sync(stale_since);

DROP TRIGGER IF EXISTS trigger_director_prospectus_sync_updated_at ON director_prospectus_sync;
CREATE TRIGGER trigger_director_prospectus_sync_updated_at
  BEFORE UPDATE ON director_prospectus_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_table_updated_at();

-- ====================================================================
-- INDEXES FOR PERFORMANCE AND COMMON QUERIES
-- ====================================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_director_resumes_professional_verified
  ON director_resumes(professional_id, verification_status, is_current);

CREATE INDEX idx_director_linkedin_verification_professional_status
  ON director_linkedin_verification(professional_id, verification_status);

CREATE INDEX idx_director_prospectus_sync_document_status
  ON director_prospectus_sync(prospectus_document_id, sync_status);

-- Indexes for bulk operations and cleanup
CREATE INDEX idx_director_prospectus_sync_stale_needs_update
  ON director_prospectus_sync(is_stale)
  WHERE sync_status IN ('pending', 'needs_update', 'error');

CREATE INDEX idx_director_resumes_pending_verification
  ON director_resumes(verification_status, uploaded_at)
  WHERE verification_status = 'pending';
