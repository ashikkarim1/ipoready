// Load environment variables for tests
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Run database migrations before tests
beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Check .env.local file.')
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Create migration tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Run all migration files
    const migrationsDir = path.resolve(process.cwd(), 'migrations')
    if (fs.existsSync(migrationsDir)) {
      const files = fs
        .readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()

      for (const file of files) {
        try {
          // Check if migration already ran
          const result = await sql`
            SELECT * FROM migrations WHERE name = ${file}
          `

          if (result.length > 0) {
            continue
          }

          // Read and execute migration
          const filePath = path.join(migrationsDir, file)
          const content = fs.readFileSync(filePath, 'utf8')

          // Execute the entire SQL file
          await sql.unsafe(content)

          // Mark migration as complete
          await sql`
            INSERT INTO migrations (name) VALUES (${file})
          `
        } catch (error) {
          console.error(`❌ Migration ${file} failed:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Failed to run migrations:', error)
  }
}, 30000) // 30 second timeout for migrations

// Suppress console errors for tests (optional, helps with cleaner output)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('useLayoutEffect') ||
       args[0].includes('Not implemented'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
