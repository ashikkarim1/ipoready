/**
 * Pre-Onboarding Checklist: Schema
 * Manages company onboarding workflows before PACE engagement
 * Includes exchange-specific templates and tracking
 */

-- ============================================================
-- ONBOARDING CHECKLISTS: Main checklist record per company
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  exchange VARCHAR(20) NOT NULL,  -- TSX, NASDAQ, CSE, TSXV, OTC, NYSE
  status VARCHAR(50) DEFAULT 'not_started',  -- not_started, in_progress, completed, skipped
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  completion_percentage INT DEFAULT 0,
  skip_reason TEXT,  -- Reason if checklist was skipped
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_company ON onboarding_checklists(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_status ON onboarding_checklists(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_exchange ON onboarding_checklists(exchange);

-- ============================================================
-- CHECKLIST ITEMS: Individual tasks within a checklist
-- ============================================================

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES onboarding_checklists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),  -- Legal, Financial, Governance, Tax, Operations, etc.
  required BOOLEAN DEFAULT TRUE,
  order_index INT,
  status VARCHAR(50) DEFAULT 'not_started',  -- not_started, in_progress, completed, skipped
  completed_at TIMESTAMP,
  skip_reason TEXT,
  completion_percentage INT DEFAULT 0,  -- 0-100
  guidance_provided BOOLEAN DEFAULT FALSE,
  resource_url VARCHAR(500),
  internal_guidance TEXT,  -- What IPOReady can help with
  external_resources TEXT,  -- JSON array of recommended vendors/resources
  estimated_days INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_company ON checklist_items(company_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_status ON checklist_items(status);
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category);

-- ============================================================
-- ONBOARDING TEMPLATES: Standard templates by exchange
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange VARCHAR(20) NOT NULL UNIQUE,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  items JSONB NOT NULL,  -- Array of template items with guidance
  estimated_completion_days INT,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_templates_exchange ON onboarding_templates(exchange);

-- ============================================================
-- ONBOARDING PROGRESS TRACKING: Email reminders and milestones
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES onboarding_checklists(id) ON DELETE SET NULL,
  event_type VARCHAR(100),  -- started, item_completed, reminder_sent, completed, skipped
  event_data JSONB,  -- Flexible data storage per event
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_logs_company ON onboarding_progress_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_logs_event_type ON onboarding_progress_logs(event_type);

-- ============================================================
-- ONBOARDING EMAIL REMINDERS: Track reminder send history
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES onboarding_checklists(id) ON DELETE SET NULL,
  reminder_type VARCHAR(100),  -- incomplete_items, upcoming_deadline, congratulations
  recipient_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_email_reminders_company ON onboarding_email_reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_email_reminders_sent_at ON onboarding_email_reminders(sent_at);

-- ============================================================
-- Add onboarding status column to companies table
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'not_started';  -- not_started, in_progress, completed, skipped
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_selected_exchange VARCHAR(20);

-- ============================================================
-- INITIAL TEMPLATES: Seed data for standard exchanges
-- ============================================================

INSERT INTO onboarding_templates (exchange, template_name, description, items, estimated_completion_days, version)
VALUES (
  'tsx',
  'TSX Standard Checklist',
  'Pre-IPO onboarding checklist for TSX listings',
  '[
    {"id": 1, "name": "Company Formation & Legal Structure", "category": "Legal", "required": true, "order": 1, "estimatedDays": 5},
    {"id": 2, "name": "Business Registration & Permits", "category": "Legal", "required": true, "order": 2, "estimatedDays": 7},
    {"id": 3, "name": "Bank Account & Basic Financials", "category": "Financial", "required": true, "order": 3, "estimatedDays": 3},
    {"id": 4, "name": "Board of Directors Formation", "category": "Governance", "required": true, "order": 4, "estimatedDays": 10},
    {"id": 5, "name": "Cap Table Cleanup (if applicable)", "category": "Governance", "required": false, "order": 5, "estimatedDays": 14},
    {"id": 6, "name": "Audit Selection", "category": "Financial", "required": true, "order": 6, "estimatedDays": 5},
    {"id": 7, "name": "Legal Counsel Engagement", "category": "Legal", "required": true, "order": 7, "estimatedDays": 3},
    {"id": 8, "name": "Insurance Review", "category": "Operations", "required": true, "order": 8, "estimatedDays": 7},
    {"id": 9, "name": "Tax Planning & Compliance", "category": "Tax", "required": true, "order": 9, "estimatedDays": 5},
    {"id": 10, "name": "Governance Documents", "category": "Governance", "required": true, "order": 10, "estimatedDays": 10}
  ]',
  60,
  1
) ON CONFLICT (exchange) DO NOTHING;

INSERT INTO onboarding_templates (exchange, template_name, description, items, estimated_completion_days, version)
VALUES (
  'nasdaq',
  'NASDAQ Standard Checklist',
  'Pre-IPO onboarding checklist for NASDAQ listings',
  '[
    {"id": 1, "name": "Company Formation & Legal Structure", "category": "Legal", "required": true, "order": 1, "estimatedDays": 5},
    {"id": 2, "name": "Business Registration & Permits", "category": "Legal", "required": true, "order": 2, "estimatedDays": 7},
    {"id": 3, "name": "Bank Account & Basic Financials", "category": "Financial", "required": true, "order": 3, "estimatedDays": 3},
    {"id": 4, "name": "Board of Directors Formation", "category": "Governance", "required": true, "order": 4, "estimatedDays": 10},
    {"id": 5, "name": "Cap Table Cleanup", "category": "Governance", "required": true, "order": 5, "estimatedDays": 14},
    {"id": 6, "name": "Audit Selection", "category": "Financial", "required": true, "order": 6, "estimatedDays": 5},
    {"id": 7, "name": "Legal Counsel Engagement", "category": "Legal", "required": true, "order": 7, "estimatedDays": 3},
    {"id": 8, "name": "Insurance Review", "category": "Operations", "required": true, "order": 8, "estimatedDays": 7},
    {"id": 9, "name": "Tax Planning & Compliance", "category": "Tax", "required": true, "order": 9, "estimatedDays": 5},
    {"id": 10, "name": "Governance Documents", "category": "Governance", "required": true, "order": 10, "estimatedDays": 10},
    {"id": 11, "name": "SOX Compliance Infrastructure", "category": "Compliance", "required": true, "order": 11, "estimatedDays": 20}
  ]',
  75,
  1
) ON CONFLICT (exchange) DO NOTHING;

INSERT INTO onboarding_templates (exchange, template_name, description, items, estimated_completion_days, version)
VALUES (
  'cse',
  'CSE Standard Checklist',
  'Pre-IPO onboarding checklist for CSE listings',
  '[
    {"id": 1, "name": "Company Formation & Legal Structure", "category": "Legal", "required": true, "order": 1, "estimatedDays": 5},
    {"id": 2, "name": "Business Registration & Permits", "category": "Legal", "required": true, "order": 2, "estimatedDays": 7},
    {"id": 3, "name": "Bank Account & Basic Financials", "category": "Financial", "required": true, "order": 3, "estimatedDays": 3},
    {"id": 4, "name": "Board of Directors Formation", "category": "Governance", "required": true, "order": 4, "estimatedDays": 10},
    {"id": 5, "name": "Cap Table Cleanup (if applicable)", "category": "Governance", "required": false, "order": 5, "estimatedDays": 14},
    {"id": 6, "name": "Audit Selection", "category": "Financial", "required": false, "order": 6, "estimatedDays": 5},
    {"id": 7, "name": "Legal Counsel Engagement", "category": "Legal", "required": true, "order": 7, "estimatedDays": 3},
    {"id": 8, "name": "Insurance Review", "category": "Operations", "required": true, "order": 8, "estimatedDays": 7},
    {"id": 9, "name": "Tax Planning & Compliance", "category": "Tax", "required": true, "order": 9, "estimatedDays": 5},
    {"id": 10, "name": "Governance Documents", "category": "Governance", "required": true, "order": 10, "estimatedDays": 10}
  ]',
  55,
  1
) ON CONFLICT (exchange) DO NOTHING;

INSERT INTO onboarding_templates (exchange, template_name, description, items, estimated_completion_days, version)
VALUES (
  'tsxv',
  'TSXV Standard Checklist',
  'Pre-IPO onboarding checklist for TSXV listings',
  '[
    {"id": 1, "name": "Company Formation & Legal Structure", "category": "Legal", "required": true, "order": 1, "estimatedDays": 5},
    {"id": 2, "name": "Business Registration & Permits", "category": "Legal", "required": true, "order": 2, "estimatedDays": 7},
    {"id": 3, "name": "Bank Account & Basic Financials", "category": "Financial", "required": true, "order": 3, "estimatedDays": 3},
    {"id": 4, "name": "Board of Directors Formation", "category": "Governance", "required": true, "order": 4, "estimatedDays": 10},
    {"id": 5, "name": "Cap Table Cleanup (if applicable)", "category": "Governance", "required": false, "order": 5, "estimatedDays": 14},
    {"id": 6, "name": "Audit Selection", "category": "Financial", "required": false, "order": 6, "estimatedDays": 5},
    {"id": 7, "name": "Legal Counsel Engagement", "category": "Legal", "required": true, "order": 7, "estimatedDays": 3},
    {"id": 8, "name": "Insurance Review", "category": "Operations", "required": true, "order": 8, "estimatedDays": 7},
    {"id": 9, "name": "Tax Planning & Compliance", "category": "Tax", "required": true, "order": 9, "estimatedDays": 5},
    {"id": 10, "name": "Governance Documents", "category": "Governance", "required": true, "order": 10, "estimatedDays": 10}
  ]',
  50,
  1
) ON CONFLICT (exchange) DO NOTHING;

INSERT INTO onboarding_templates (exchange, template_name, description, items, estimated_completion_days, version)
VALUES (
  'otc',
  'OTC Standard Checklist',
  'Pre-IPO onboarding checklist for OTC listings',
  '[
    {"id": 1, "name": "Company Formation & Legal Structure", "category": "Legal", "required": true, "order": 1, "estimatedDays": 5},
    {"id": 2, "name": "Business Registration & Permits", "category": "Legal", "required": true, "order": 2, "estimatedDays": 7},
    {"id": 3, "name": "Bank Account & Basic Financials", "category": "Financial", "required": true, "order": 3, "estimatedDays": 3},
    {"id": 4, "name": "Board of Directors Formation", "category": "Governance", "required": false, "order": 4, "estimatedDays": 10},
    {"id": 5, "name": "Cap Table Cleanup (if applicable)", "category": "Governance", "required": false, "order": 5, "estimatedDays": 14},
    {"id": 6, "name": "Audit Selection", "category": "Financial", "required": false, "order": 6, "estimatedDays": 5},
    {"id": 7, "name": "Legal Counsel Engagement", "category": "Legal", "required": true, "order": 7, "estimatedDays": 3},
    {"id": 8, "name": "Insurance Review", "category": "Operations", "required": false, "order": 8, "estimatedDays": 7},
    {"id": 9, "name": "Tax Planning & Compliance", "category": "Tax", "required": true, "order": 9, "estimatedDays": 5},
    {"id": 10, "name": "Governance Documents", "category": "Governance", "required": false, "order": 10, "estimatedDays": 10}
  ]',
  40,
  1
) ON CONFLICT (exchange) DO NOTHING;
