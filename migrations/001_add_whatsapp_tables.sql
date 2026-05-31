-- WhatsApp Notification System Tables
-- Run this migration to set up WhatsApp infrastructure

-- whatsapp_logs: track all outbound WhatsApp messages
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'failed'
  twilio_msg_id VARCHAR(100),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_logs_phone ON whatsapp_logs(phone_number);
CREATE INDEX idx_whatsapp_logs_user ON whatsapp_logs(user_id);
CREATE INDEX idx_whatsapp_logs_company ON whatsapp_logs(company_id);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX idx_whatsapp_logs_twilio_id ON whatsapp_logs(twilio_msg_id);
CREATE INDEX idx_whatsapp_logs_created ON whatsapp_logs(created_at DESC);

-- whatsapp_queue: queue for outbound messages with priority and retry logic
CREATE TABLE IF NOT EXISTS whatsapp_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  variables JSONB NOT NULL DEFAULT '{}',
  priority VARCHAR(20) NOT NULL DEFAULT 'regular', -- 'urgent' or 'regular'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(255),
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_queue_status ON whatsapp_queue(status);
CREATE INDEX idx_whatsapp_queue_priority ON whatsapp_queue(priority);
CREATE INDEX idx_whatsapp_queue_idempotency ON whatsapp_queue(idempotency_key);
CREATE INDEX idx_whatsapp_queue_created ON whatsapp_queue(created_at);
CREATE INDEX idx_whatsapp_queue_next_retry ON whatsapp_queue(next_retry_at) WHERE status = 'pending';

-- user_phone_numbers: track user's verified phone numbers for WhatsApp
-- Note: Users table already has phone_number and whatsapp_opted_in columns
-- This table is for future expansion (multiple phone numbers per user)
CREATE TABLE IF NOT EXISTS user_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  consent_opt_in BOOLEAN DEFAULT FALSE,
  opt_in_at TIMESTAMP WITH TIME ZONE,
  opt_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

CREATE INDEX idx_user_phone_numbers_user ON user_phone_numbers(user_id);
CREATE INDEX idx_user_phone_numbers_phone ON user_phone_numbers(phone_number);
CREATE INDEX idx_user_phone_numbers_verified ON user_phone_numbers(verified);
CREATE INDEX idx_user_phone_numbers_opt_in ON user_phone_numbers(consent_opt_in);

-- Ensure existing users table has the required columns
-- This is safe to run multiple times as it uses ALTER TABLE IF NOT EXISTS style checks

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'whatsapp_opted_in'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_opted_in BOOLEAN DEFAULT FALSE;
  END IF;
END
$$;

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_whatsapp_logs_updated_at ON whatsapp_logs;
CREATE TRIGGER update_whatsapp_logs_updated_at
  BEFORE UPDATE ON whatsapp_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_whatsapp_queue_updated_at ON whatsapp_queue;
CREATE TRIGGER update_whatsapp_queue_updated_at
  BEFORE UPDATE ON whatsapp_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_phone_numbers_updated_at ON user_phone_numbers;
CREATE TRIGGER update_user_phone_numbers_updated_at
  BEFORE UPDATE ON user_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
