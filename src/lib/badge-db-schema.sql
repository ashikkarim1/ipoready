-- ═══════════════════════════════════════════════════════════════════════════
-- Badge System Database Schema & Queries
-- ═══════════════════════════════════════════════════════════════════════════

-- This file documents the database schema and queries used by the badge system.
-- Adjust table/column names to match your actual database schema.

-- ───────────────────────────────────────────────────────────────────────────
-- REQUIRED TABLES (must exist)
-- ───────────────────────────────────────────────────────────────────────────

-- notifications table
-- Table: public.notifications
-- Columns:
--   id (uuid/text) - Primary key
--   company_id (uuid/text) - Company identifier
--   user_id (uuid/text) - User identifier
--   type (text) - Notification type (task_due, task_completed, milestone, etc)
--   title (text) - Notification title
--   message (text) - Notification message
--   read (boolean) - Read status
--   link (text) - Navigation link
--   created_at (timestamp) - Creation timestamp

-- tasks table
-- Table: public.tasks
-- Columns:
--   id (uuid/text) - Primary key
--   user_id (uuid/text) - Assigned user
--   company_id (uuid/text) - Company identifier
--   status (text) - Task status (not_started, in_progress, review, completed, blocked)
--   due_date (timestamp) - Due date
--   created_at (timestamp) - Creation timestamp
--   completed_at (timestamp) - Completion timestamp

-- documents table
-- Table: public.documents
-- Columns:
--   id (uuid/text) - Primary key
--   company_id (uuid/text) - Company identifier
--   name (text) - Document name
--   status (text) - Document status (pending, uploaded, verified, rejected)
--   uploaded_at (timestamp) - Upload timestamp
--   uploaded_by (uuid/text) - User who uploaded

-- team_members table
-- Table: public.team_members
-- Columns:
--   id (uuid/text) - Primary key
--   user_id (uuid/text) - User identifier
--   company_id (uuid/text) - Company identifier
--   role (text) - User role
--   invited_at (timestamp) - Invite timestamp
--   accepted_at (timestamp) - Acceptance timestamp (NULL if pending)

-- ───────────────────────────────────────────────────────────────────────────
-- BADGE COUNT QUERIES
-- ───────────────────────────────────────────────────────────────────────────

-- ✓ Get unread notification count for user
SELECT COUNT(*) as count
FROM notifications
WHERE user_id = $1 AND read = false;

-- ✓ Get overdue task count
SELECT COUNT(*) as count
FROM tasks
WHERE user_id = $1
  AND status != 'completed'
  AND due_date < NOW();

-- ✓ Get due-soon task count (next 7 days)
SELECT COUNT(*) as count
FROM tasks
WHERE user_id = $1
  AND status != 'completed'
  AND due_date >= NOW()
  AND due_date < NOW() + INTERVAL '7 days';

-- ✓ Get new document count (uploaded in last 7 days)
SELECT COUNT(*) as count
FROM documents
WHERE company_id = $1
  AND uploaded_at > NOW() - INTERVAL '7 days'
  AND status IN ('uploaded', 'verified');

-- ✓ Get pending invite count
SELECT COUNT(*) as count
FROM team_members
WHERE user_id = $1
  AND accepted_at IS NULL;

-- ───────────────────────────────────────────────────────────────────────────
-- HELPER QUERIES
-- ───────────────────────────────────────────────────────────────────────────

-- Get all badge counts in one query
SELECT
  (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false) as unread_notifications,
  (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status != 'completed' AND due_date < NOW()) as overdue_tasks,
  (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status != 'completed' AND due_date >= NOW() AND due_date < NOW() + INTERVAL '7 days') as due_soon_tasks,
  (SELECT COUNT(*) FROM documents WHERE company_id = $2 AND uploaded_at > NOW() - INTERVAL '7 days' AND status IN ('uploaded', 'verified')) as new_documents,
  (SELECT COUNT(*) FROM team_members WHERE user_id = $1 AND accepted_at IS NULL) as pending_invites;

-- Mark notification as read
UPDATE notifications
SET read = true
WHERE id = $1 AND user_id = $2;

-- Mark all notifications as read for user
UPDATE notifications
SET read = true
WHERE user_id = $1 AND read = false;

-- Get unread notifications with details
SELECT
  id,
  type,
  title,
  message,
  link,
  created_at
FROM notifications
WHERE user_id = $1 AND read = false
ORDER BY created_at DESC
LIMIT 20;

-- Get overdue tasks with details
SELECT
  id,
  title,
  due_date,
  priority,
  status
FROM tasks
WHERE user_id = $1
  AND status != 'completed'
  AND due_date < NOW()
ORDER BY due_date ASC;

-- Get due-soon tasks with details
SELECT
  id,
  title,
  due_date,
  priority,
  status
FROM tasks
WHERE user_id = $1
  AND status != 'completed'
  AND due_date >= NOW()
  AND due_date < NOW() + INTERVAL '7 days'
ORDER BY due_date ASC;

-- ───────────────────────────────────────────────────────────────────────────
-- INDEX RECOMMENDATIONS
-- ───────────────────────────────────────────────────────────────────────────

-- For notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- For tasks
CREATE INDEX idx_tasks_user_status_due ON tasks(user_id, status, due_date);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- For documents
CREATE INDEX idx_documents_company_uploaded ON documents(company_id, uploaded_at DESC);
CREATE INDEX idx_documents_status ON documents(status);

-- For team_members
CREATE INDEX idx_team_members_user_accepted ON team_members(user_id, accepted_at);

-- ───────────────────────────────────────────────────────────────────────────
-- PERFORMANCE NOTES
-- ───────────────────────────────────────────────────────────────────────────

-- 1. Indexes should be on columns frequently used in WHERE clauses
-- 2. For badge queries, indexes on (user_id, field) are most beneficial
-- 3. Count queries are very fast, even without indexes (< 1ms on typical datasets)
-- 4. Consider materialized views if badge counts need to be accessed > 10x/second

-- Example Materialized View (PostgreSQL):
/*
CREATE MATERIALIZED VIEW badge_counts_mv AS
SELECT
  u.id as user_id,
  u.company_id,
  COUNT(DISTINCT CASE WHEN n.read = false THEN n.id END) as unread_notifications,
  COUNT(DISTINCT CASE WHEN t.status != 'completed' AND t.due_date < NOW() THEN t.id END) as overdue_tasks,
  COUNT(DISTINCT CASE WHEN t.status != 'completed' AND t.due_date >= NOW() AND t.due_date < NOW() + INTERVAL '7 days' THEN t.id END) as due_soon_tasks,
  COUNT(DISTINCT CASE WHEN d.uploaded_at > NOW() - INTERVAL '7 days' AND d.status IN ('uploaded', 'verified') THEN d.id END) as new_documents,
  COUNT(DISTINCT CASE WHEN tm.accepted_at IS NULL THEN tm.id END) as pending_invites
FROM users u
LEFT JOIN notifications n ON u.id = n.user_id
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN documents d ON u.company_id = d.company_id
LEFT JOIN team_members tm ON u.id = tm.user_id
GROUP BY u.id, u.company_id;

CREATE INDEX idx_badge_counts_mv_user_id ON badge_counts_mv(user_id);
*/

-- Refresh materialized view:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY badge_counts_mv;

-- ───────────────────────────────────────────────────────────────────────────
-- TESTING QUERIES
-- ───────────────────────────────────────────────────────────────────────────

-- Test: Create sample data
INSERT INTO notifications (id, user_id, company_id, type, title, message, read, created_at)
VALUES
  (gen_random_uuid(), 'test-user-1', 'test-company-1', 'task_due', 'Task Due', 'Test notification', false, NOW()),
  (gen_random_uuid(), 'test-user-1', 'test-company-1', 'milestone', 'Milestone', 'Test achievement', false, NOW() - INTERVAL '1 day');

-- Test: Verify counts
SELECT
  (SELECT COUNT(*) FROM notifications WHERE user_id = 'test-user-1' AND read = false) as unread,
  (SELECT COUNT(*) FROM tasks WHERE user_id = 'test-user-1' AND status != 'completed' AND due_date < NOW()) as overdue;

-- ───────────────────────────────────────────────────────────────────────────
-- MIGRATION NOTES
-- ───────────────────────────────────────────────────────────────────────────

-- If adding badge system to existing database:
-- 1. Verify all required columns exist in notifications table
-- 2. Verify read column is boolean type
-- 3. Verify due_date column exists in tasks table
-- 4. Create recommended indexes
-- 5. Test queries with EXPLAIN ANALYZE
-- 6. Monitor query performance in production
