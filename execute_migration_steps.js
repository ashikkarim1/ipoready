const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load environment from .env.local
const envPath = path.join(__dirname, '.env.local')
const env = fs.readFileSync(envPath, 'utf8')
env.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').trim()
    if (key && !process.env[key]) {
      process.env[key] = value
    }
  }
})

const sql = neon(process.env.DATABASE_URL)

async function runMigrations() {
  try {
    console.log('📦 Creating Cap Table Tables...\n')
    
    // Create each critical table
    const statements = [
      { name: 'share_classes_v2', sql: `
        CREATE TABLE IF NOT EXISTS share_classes_v2 (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          class_name VARCHAR(50) NOT NULL,
          class_code VARCHAR(10),
          preference_order INT NOT NULL,
          liquidation_preference_multiplier DECIMAL(5,2),
          participating BOOLEAN DEFAULT false,
          conversion_ratio DECIMAL(10,4) DEFAULT 1.0,
          voting_rights DECIMAL(5,2) DEFAULT 1.0,
          dividend_per_share DECIMAL(15,4),
          liquidation_per_share DECIMAL(15,4),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(cap_table_document_id, class_name)
        )
      `},
      { name: 'shareholders', sql: `
        CREATE TABLE IF NOT EXISTS shareholders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          shareholder_name VARCHAR(255) NOT NULL,
          shareholder_type VARCHAR(50),
          entity_type VARCHAR(50),
          identifier VARCHAR(255),
          country_incorporation VARCHAR(2),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'holdings', sql: `
        CREATE TABLE IF NOT EXISTS holdings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          shareholder_id UUID NOT NULL REFERENCES shareholders(id) ON DELETE CASCADE,
          share_class_id UUID NOT NULL REFERENCES share_classes_v2(id) ON DELETE CASCADE,
          quantity_issued DECIMAL(18,4) NOT NULL,
          vested_quantity DECIMAL(18,4) DEFAULT 0,
          unvested_quantity DECIMAL(18,4) DEFAULT 0,
          option_exercise_price DECIMAL(15,4),
          warrant_exercise_price DECIMAL(15,4),
          acquisition_cost DECIMAL(15,4),
          investment_date DATE,
          is_vesting_schedule BOOLEAN DEFAULT false,
          is_option BOOLEAN DEFAULT false,
          is_warrant BOOLEAN DEFAULT false,
          ownership_percentage DECIMAL(7,4),
          ownership_percentage_fd DECIMAL(7,4),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'vesting_schedules', sql: `
        CREATE TABLE IF NOT EXISTS vesting_schedules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          vesting_start_date DATE NOT NULL,
          cliff_date DATE,
          cliff_percentage DECIMAL(5,2) DEFAULT 0,
          vesting_end_date DATE NOT NULL,
          total_shares_vesting DECIMAL(18,4) NOT NULL,
          vesting_frequency VARCHAR(50) DEFAULT 'monthly',
          acceleration_event VARCHAR(255),
          acceleration_percentage DECIMAL(5,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'cap_table_transactions', sql: `
        CREATE TABLE IF NOT EXISTS cap_table_transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          transaction_type VARCHAR(100) NOT NULL,
          transaction_date DATE NOT NULL,
          description TEXT,
          affected_shareholder_id UUID REFERENCES shareholders(id) ON DELETE SET NULL,
          affected_share_class_id UUID REFERENCES share_classes_v2(id) ON DELETE SET NULL,
          quantity_change DECIMAL(18,4),
          price_per_share DECIMAL(15,4),
          total_value DECIMAL(18,4),
          currency VARCHAR(3) DEFAULT 'USD',
          metadata JSONB,
          created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'cap_table_scenarios', sql: `
        CREATE TABLE IF NOT EXISTS cap_table_scenarios (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          scenario_name VARCHAR(255) NOT NULL,
          scenario_type VARCHAR(50),
          dilution_percent DECIMAL(5,2),
          new_shares DECIMAL(18,4),
          new_valuation DECIMAL(18,4),
          price_per_share DECIMAL(15,4),
          ownership_changes JSONB,
          created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'cap_table_validation_rules', sql: `
        CREATE TABLE IF NOT EXISTS cap_table_validation_rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          rule_name VARCHAR(255) NOT NULL,
          rule_category VARCHAR(100) NOT NULL,
          rule_description TEXT,
          severity VARCHAR(20),
          rule_logic_json JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'cap_table_audit_logs', sql: `
        CREATE TABLE IF NOT EXISTS cap_table_audit_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cap_table_document_id UUID NOT NULL REFERENCES cap_table_documents(id) ON DELETE CASCADE,
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          action VARCHAR(100) NOT NULL,
          entity_type VARCHAR(50),
          entity_id UUID,
          old_values JSONB,
          new_values JSONB,
          performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
          resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `},
      { name: 'subscription_state_transitions', sql: `
        CREATE TABLE IF NOT EXISTS subscription_state_transitions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          subscription_id VARCHAR(255),
          from_state VARCHAR(50) NOT NULL,
          to_state VARCHAR(50) NOT NULL,
          trigger VARCHAR(255) NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `},
      { name: 'trial_auto_upgrade_queue', sql: `
        CREATE TABLE IF NOT EXISTS trial_auto_upgrade_queue (
          id UUID PRIMARY KEY,
          company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
          stripe_customer_id VARCHAR(255) NOT NULL,
          trial_end_date DATE NOT NULL,
          retry_count INT DEFAULT 0,
          next_retry_at TIMESTAMP NOT NULL,
          last_error TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `},
      { name: 'webhook_rate_limits', sql: `
        CREATE TABLE IF NOT EXISTS webhook_rate_limits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer_id VARCHAR(255) NOT NULL,
          window_start TIMESTAMP NOT NULL,
          webhook_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(customer_id, window_start)
        )
      `},
      { name: 'security_events', sql: `
        CREATE TABLE IF NOT EXISTS security_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_type VARCHAR(100) NOT NULL,
          company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
          stripe_customer_id VARCHAR(255),
          severity VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `}
    ]
    
    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt.sql)
        console.log(`✅ ${stmt.name.padEnd(40)} CREATED`)
      } catch (e) {
        console.log(`⚠️  ${stmt.name.padEnd(40)} ${e.message.substring(0,50)}...`)
      }
    }
    
    console.log('\n✅ Migration complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

runMigrations()
