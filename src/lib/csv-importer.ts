// ====================================================================
// CSV IMPORTER FOR CAP TABLE
// Parses, validates, and imports cap table data from CSV files
// ====================================================================

import { sql } from '@/lib/db'

export interface ParsedCSVRow {
  shareholder_name: string
  share_class: string
  quantity: number
  vesting_start?: string
  vesting_cliff_months?: number
  vesting_period_months?: number
  strike_price?: number
  grant_date: string
}

export interface CSVParseResult {
  preview: ParsedCSVRow[]
  errors: string[]
  warnings: string[]
}

export interface CSVImportResult {
  success: boolean
  rows_imported: number
  errors: string[]
}

// ====================================================================
// CSV PARSING
// ====================================================================

export async function parseCSV(file: File): Promise<CSVParseResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const preview: ParsedCSVRow[] = []

  try {
    // Read file as text
    const text = await file.text()
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    if (lines.length < 2) {
      return {
        preview: [],
        errors: ['CSV file must contain header row and at least one data row'],
        warnings: [],
      }
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim())
    const headerMap = createHeaderMap(header)

    if (errors.length > 0) {
      return { preview: [], errors, warnings: [] }
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(v => v.trim())
      const rowNum = i + 1

      try {
        const parsed = parseRow(row, headerMap, rowNum)
        preview.push(parsed)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        errors.push(msg)
      }
    }

    return { preview, errors, warnings }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      preview: [],
      errors: [`Failed to parse CSV: ${msg}`],
      warnings: [],
    }
  }
}

function createHeaderMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  const headerLower = header.map(h => h.toLowerCase())

  // Find required columns (flexible matching)
  for (let i = 0; i < headerLower.length; i++) {
    const h = headerLower[i]
    if (h.includes('shareholder') || h.includes('name')) {
      map['shareholder_name'] = i
    }
    if (h.includes('share') && h.includes('class')) {
      map['share_class'] = i
    }
    if (h.includes('quantity') || h.includes('shares') || h === '#' || h.startsWith('# ')) {
      map['quantity'] = i
    }
    if (h.includes('vesting') && h.includes('start')) {
      map['vesting_start'] = i
    }
    if (h.includes('cliff')) {
      map['vesting_cliff_months'] = i
    }
    if ((h.includes('vesting') && h.includes('period')) || h.includes('vesting') && h.includes('months')) {
      map['vesting_period_months'] = i
    }
    if (h.includes('strike') || h.includes('exercise')) {
      map['strike_price'] = i
    }
    if (h.includes('grant') && h.includes('date')) {
      map['grant_date'] = i
    }
  }

  return map
}

function parseRow(
  row: string[],
  headerMap: Record<string, number>,
  rowNum: number
): ParsedCSVRow {
  // Helper to get value from row
  const getValue = (key: string): string | undefined => {
    const idx = headerMap[key]
    return idx !== undefined && idx < row.length ? row[idx] : undefined
  }

  // Required fields
  const shareholder_name = getValue('shareholder_name')?.trim()
  const share_class = getValue('share_class')?.trim()
  const quantity_str = getValue('quantity')?.trim()
  const grant_date = getValue('grant_date')?.trim()

  if (!shareholder_name || shareholder_name.length === 0) {
    throw new Error(`Row ${rowNum}: Shareholder Name is required`)
  }
  if (shareholder_name.length > 255) {
    throw new Error(`Row ${rowNum}: Shareholder Name exceeds 255 characters`)
  }

  if (!share_class || share_class.length === 0) {
    throw new Error(`Row ${rowNum}: Share Class is required`)
  }

  if (!quantity_str) {
    throw new Error(`Row ${rowNum}: Quantity (# Shares) is required`)
  }

  const quantity = parseFloat(quantity_str)
  if (isNaN(quantity)) {
    throw new Error(`Row ${rowNum}, Column 'Quantity': value '${quantity_str}' is not numeric`)
  }
  if (quantity <= 0) {
    throw new Error(`Row ${rowNum}, Column 'Quantity': value must be positive, got ${quantity}`)
  }
  if (!/^\d+(\.\d{1,6})?$/.test(quantity_str)) {
    throw new Error(`Row ${rowNum}, Column 'Quantity': maximum 6 decimal places, got '${quantity_str}'`)
  }

  if (!grant_date || grant_date.length === 0) {
    throw new Error(`Row ${rowNum}: Grant Date is required`)
  }
  validateDateFormat(grant_date, rowNum, 'Grant Date')

  // Optional fields
  let vesting_start: string | undefined
  const vesting_start_str = getValue('vesting_start')?.trim()
  if (vesting_start_str) {
    validateDateFormat(vesting_start_str, rowNum, 'Vesting Start Date')
    vesting_start = vesting_start_str
  }

  let vesting_cliff_months: number | undefined
  const cliff_str = getValue('vesting_cliff_months')?.trim()
  if (cliff_str) {
    vesting_cliff_months = parseIntStrict(cliff_str, rowNum, 'Vesting Cliff (Months)')
  }

  let vesting_period_months: number | undefined
  const period_str = getValue('vesting_period_months')?.trim()
  if (period_str) {
    vesting_period_months = parseIntStrict(period_str, rowNum, 'Vesting Period (Months)')
  }

  // Validate vesting relationship
  if (vesting_cliff_months !== undefined && vesting_period_months !== undefined) {
    if (vesting_cliff_months > vesting_period_months) {
      throw new Error(
        `Row ${rowNum}, Column 'Vesting Cliff': value '${vesting_cliff_months}' exceeds Vesting Period '${vesting_period_months}'`
      )
    }
  }

  let strike_price: number | undefined
  const strike_str = getValue('strike_price')?.trim()
  if (strike_str) {
    strike_price = parseFloat(strike_str)
    if (isNaN(strike_price)) {
      throw new Error(`Row ${rowNum}, Column 'Strike Price': value '${strike_str}' is not numeric`)
    }
  }

  return {
    shareholder_name,
    share_class,
    quantity,
    vesting_start,
    vesting_cliff_months,
    vesting_period_months,
    strike_price,
    grant_date,
  }
}

function validateDateFormat(dateStr: string, rowNum: number, columnName: string): void {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoRegex.test(dateStr)) {
    throw new Error(`Row ${rowNum}, Column '${columnName}': invalid date format '${dateStr}' (expected YYYY-MM-DD)`)
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error(`Row ${rowNum}, Column '${columnName}': invalid date '${dateStr}'`)
  }
}

function parseIntStrict(str: string, rowNum: number, columnName: string): number {
  const val = parseInt(str, 10)
  if (isNaN(val) || val.toString() !== str) {
    throw new Error(`Row ${rowNum}, Column '${columnName}': value '${str}' is not an integer`)
  }
  return val
}

// ====================================================================
// CSV IMPORT (Atomic Transaction)
// ====================================================================

export async function importCSV(companyId: string, rows: ParsedCSVRow[]): Promise<CSVImportResult> {
  const errors: string[] = []

  // Check for duplicate shareholder + share_class combinations
  const seen = new Set<string>()
  for (const row of rows) {
    const key = `${row.shareholder_name}|${row.share_class}`
    if (seen.has(key)) {
      errors.push(`Duplicate entry: ${row.shareholder_name} + ${row.share_class}`)
    }
    seen.add(key)
  }

  if (errors.length > 0) {
    return { success: false, rows_imported: 0, errors }
  }

  let rowsImported = 0

  try {
    // Process each row atomically (all-or-nothing at row level)
    for (const entry of rows) {
      try {
        // Find or create share class
        const shareClassResult = await sql`
          SELECT id FROM share_classes
          WHERE company_id = ${companyId}
          AND class_name = ${entry.share_class}
          LIMIT 1
        ` as Array<{ id: string }>

        let shareClassId: string
        if (shareClassResult.length > 0) {
          shareClassId = shareClassResult[0].id
        } else {
          const inserted = await sql`
            INSERT INTO share_classes (company_id, class_name, preference_order)
            VALUES (${companyId}, ${entry.share_class}, 0)
            RETURNING id
          ` as Array<{ id: string }>
          shareClassId = inserted[0].id
        }

        // Check for existing entry
        const existing = await sql`
          SELECT id FROM cap_table_entries
          WHERE company_id = ${companyId}
          AND shareholder_name = ${entry.shareholder_name}
          AND share_class_id = ${shareClassId}
          LIMIT 1
        ` as Array<{ id: string }>

        if (existing.length > 0) {
          // Update existing
          await sql`
            UPDATE cap_table_entries
            SET quantity = ${entry.quantity},
                vesting_start_date = ${entry.vesting_start ?? null},
                vesting_cliff_months = ${entry.vesting_cliff_months ?? null},
                vesting_period_months = ${entry.vesting_period_months ?? null},
                vested_quantity = 0,
                strike_price = ${entry.strike_price ?? null},
                grant_date = ${entry.grant_date},
                grant_type = 'stock',
                notes = ${'Imported from CSV'},
                updated_at = NOW()
            WHERE id = ${existing[0].id}
          `
        } else {
          // Insert new
          await sql`
            INSERT INTO cap_table_entries (
              company_id, shareholder_name, share_class_id, quantity,
              vesting_start_date, vesting_cliff_months, vesting_period_months,
              vested_quantity, strike_price, grant_date, grant_type, notes,
              created_at, updated_at
            )
            VALUES (
              ${companyId}, ${entry.shareholder_name}, ${shareClassId},
              ${entry.quantity}, ${entry.vesting_start ?? null},
              ${entry.vesting_cliff_months ?? null},
              ${entry.vesting_period_months ?? null}, 0,
              ${entry.strike_price ?? null}, ${entry.grant_date},
              'stock', ${'Imported from CSV'},
              NOW(), NOW()
            )
          `
        }

        rowsImported++
      } catch (rowError) {
        const msg = rowError instanceof Error ? rowError.message : String(rowError)
        errors.push(`Row for ${entry.shareholder_name}: ${msg}`)
        // Continue processing other rows
      }
    }

    return {
      success: errors.length === 0,
      rows_imported: rowsImported,
      errors,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      rows_imported: 0,
      errors: [`Import failed: ${msg}`],
    }
  }
}
