/**
 * Slack Integration Database Schema
 * Run this migration to set up tables for Slack messaging and logging
 */

-- Add Slack fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_user_id VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_linked_at TIMESTAMP;

-- Create slack_logs table
CREATE TABLE IF NOT EXISTS slack_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slack_user_id VARCHAR(20),
  channel VARCHAR(100),
  template_id VARCHAR(100) NOT NULL,
  message_body TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- sent, failed, pending
  slack_ts VARCHAR(50), -- Slack message timestamp
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create slack_queue table
CREATE TABLE IF NOT EXISTS slack_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slack_user_id VARCHAR(20),
  channel VARCHAR(100),
  template_id VARCHAR(100) NOT NULL,
  variables JSONB,
  priority VARCHAR(20) NOT NULL DEFAULT 'regular', -- urgent, regular
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processed, failed
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMP,
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create slack_events table
CREATE TABLE IF NOT EXISTS slack_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_slack_logs_user ON slack_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_slack_logs_slack_user ON slack_logs(slack_user_id);
CREATE INDEX IF NOT EXISTS idx_slack_logs_status ON slack_logs(status);
CREATE INDEX IF NOT EXISTS idx_slack_logs_sent_at ON slack_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_slack_queue_user ON slack_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_slack_queue_status ON slack_queue(status);
CREATE INDEX IF NOT EXISTS idx_slack_queue_created ON slack_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_slack_queue_retry ON slack_queue(next_retry_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_slack_events_type ON slack_events(event_type);
CREATE INDEX IF NOT EXISTS idx_slack_events_processed ON slack_events(processed);
CREATE INDEX IF NOT EXISTS idx_slack_events_received ON slack_events(received_at);

-- Create unique index on users slack_user_id (allowing NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_slack_user_id
ON users(slack_user_id)
WHERE slack_user_id IS NOT NULL;
