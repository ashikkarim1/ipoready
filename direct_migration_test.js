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

async function test() {
  try {
    // Try creating just the first table
    console.log('Testing cap_table_documents table creation...')
    await sql`
      CREATE TABLE IF NOT EXISTS cap_table_documents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        document_name VARCHAR(255) NOT NULL,
        document_version INT DEFAULT 1,
        file_path VARCHAR(1024),
        file_hash VARCHAR(255),
        uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        parsed_at TIMESTAMP WITH TIME ZONE,
        validation_status VARCHAR(50) DEFAULT 'pending',
        parsing_errors TEXT,
        template_id VARCHAR(255),
        is_fully_diluted BOOLEAN DEFAULT false,
        assumption_snapshot JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Table created successfully')
    
    // Check if it exists
    const result = await sql`
      SELECT EXISTS(
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'cap_table_documents'
      ) as exists
    `
    console.log('Table exists:', result[0].exists)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  }
}

test()
