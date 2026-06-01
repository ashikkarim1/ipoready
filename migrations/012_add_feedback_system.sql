-- Migration: Add Comprehensive Feedback System
-- Purpose: Support user feedback collection, admin dashboard, and analytics
-- Date: 2026-06-01

-- ============================================================
-- FEEDBACK CATEGORIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO feedback_categories (name, description, color, sort_order)
VALUES 
  ('Feature Request', 'Suggest new features or improvements', 'blue', 1),
  ('Bug Report', 'Report a technical issue or bug', 'red', 2),
  ('UX/UI Feedback', 'Feedback on user experience or interface', 'purple', 3),
  ('Performance', 'Performance or speed issues', 'orange', 4),
  ('Documentation', 'Feedback on documentation or help', 'green', 5),
  ('Other', 'General feedback or comments', 'gray', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- MAIN FEEDBACK TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES feedback_categories(id) ON DELETE SET NULL,
  
  -- Page/context where feedback was submitted
  page VARCHAR(255),                    -- e.g., '/dashboard', '/pace', '/tasks'
  task VARCHAR(255),                    -- Optional: specific task/feature reference
  
  -- Feedback content
  subject VARCHAR(500),                 -- Short subject/title
  feedback_text TEXT NOT NULL,          -- Main feedback content
  rating INT CHECK (rating >= 1 AND rating <= 5),  -- 1-5 satisfaction scale
  
  -- Confusion points (array for tracking what confused users)
  confusion_points TEXT[],
  
  -- Sentiment analysis
  sentiment VARCHAR(50),                -- 'positive', 'neutral', 'negative', 'frustrated'
  
  -- Admin fields
  status VARCHAR(50) DEFAULT 'new',     -- 'new', 'acknowledged', 'in_progress', 'resolved', 'wontfix'
  priority VARCHAR(50),                 -- 'low', 'medium', 'high', 'critical'
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  
  -- Device/context info
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_company_id ON feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category_id ON feedback(category_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_feedback_page ON feedback(page);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_company_created ON feedback(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_created ON feedback(user_id, created_at DESC);

-- ============================================================
-- FEEDBACK ANALYTICS TABLE
-- Track daily/weekly feedback metrics for trending
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Counts
  total_feedback INT DEFAULT 0,
  new_feedback INT DEFAULT 0,
  resolved_feedback INT DEFAULT 0,
  
  -- Ratings
  avg_rating DECIMAL(3,2),
  
  -- Sentiment breakdown
  positive_count INT DEFAULT 0,
  neutral_count INT DEFAULT 0,
  negative_count INT DEFAULT 0,
  frustrated_count INT DEFAULT 0,
  
  -- Top pages with feedback
  top_pages JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_feedback_analytics_company ON feedback_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_analytics_date ON feedback_analytics(metric_date DESC);

-- ============================================================
-- TRIGGER FOR UPDATED_AT COLUMN
-- ============================================================

CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_feedback_updated_at ON feedback;
CREATE TRIGGER trigger_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

DROP TRIGGER IF EXISTS trigger_feedback_analytics_updated_at ON feedback_analytics;
CREATE TRIGGER trigger_feedback_analytics_updated_at
  BEFORE UPDATE ON feedback_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Grant permissions for feedback access
-- (Assumes roles/permissions table exists)
CREATE TABLE IF NOT EXISTS feedback_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(100),
  can_view_all BOOLEAN DEFAULT false,
  can_edit_status BOOLEAN DEFAULT false,
  can_assign BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false
);

INSERT INTO feedback_access_rules (role_name, can_view_all, can_edit_status, can_assign, can_delete)
VALUES
  ('system_admin', true, true, true, true),
  ('company_admin', true, true, true, false),
  ('company_staff', false, false, false, false)
ON CONFLICT DO NOTHING;