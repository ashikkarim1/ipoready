/**
 * Cap Table Upload API
 * POST /api/cap-table/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { ExcelCapTableParser } from '@/lib/cap-table/excel-parser';
import { CapTableValidator, CapTableData } from '@/lib/cap-table/validator';
import { ParserError, ParsedHolding, ParsedShareClass } from '@/lib/cap-table/parser';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import path from 'path';
import { recordCapTableMetrics } from '@/lib/monitoring/cap-table-metrics';

export const dynamic = 'force-dynamic'
// Security: Define allowed file types for cap table uploads
const ALLOWED_MIME_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_FILE_EXTENSIONS = ['.xls', '.xlsx'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Security: Validate file before processing
function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only Excel files (.xls, .xlsx) are allowed. Received: ${file.type}`,
    };
  }

  // Check file extension
  const fileExtension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file extension. Only ${ALLOWED_FILE_EXTENSIONS.join(', ')} files are allowed.`,
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  const uploadStart = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: 'Missing file or company ID' },
        { status: 400 }
      );
    }

    // Security: Validate file before processing
    const fileValidation = validateFileUpload(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid file', details: fileValidation.error },
        { status: 400 }
      );
    }

    // Record upload attempt
    await recordCapTableMetrics({
      action: 'upload',
      status: 'success',
      latencyMs: 0,
      companyId,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash('md5').update(buffer).digest('hex');
    const tempFilePath = path.join('/tmp', `cap-table-${randomUUID()}.xlsx`);

    writeFileSync(tempFilePath, buffer);

    try {
      const parseStart = Date.now();
      const parser = new ExcelCapTableParser(tempFilePath);
      await parser.initialize();
      const parseResult = await parser.parse();
      const parseLatencyMs = Date.now() - parseStart;

      const criticalErrors = parseResult.errors.filter(
        (e: ParserError) => e.severity === 'critical'
      );
      if (criticalErrors.length > 0) {
        // Record parse failure
        await recordCapTableMetrics({
          action: 'parse',
          status: 'error',
          latencyMs: parseLatencyMs,
          companyId,
        });
        return NextResponse.json(
          {
            error: 'Failed to parse cap table',
            details: criticalErrors.map((e: ParserError) => e.message),
          },
          { status: 400 }
        );
      }

      // Record parse success
      await recordCapTableMetrics({
        action: 'parse',
        status: 'success',
        latencyMs: parseLatencyMs,
        companyId,
      });

      const validator = new CapTableValidator();
      const validationStart = Date.now();
      const validationReport = await validator.validate({
        documentName: file.name,
        holdings: parseResult.holdings.map((h: ParsedHolding) => ({
          shareholder: h.shareholder_name,
          shareClass: h.share_class_name,
          quantity: h.quantity,
          quantityIssued: h.quantity_issued,
        })),
        shareClasses: parseResult.shareClasses.map((sc: ParsedShareClass) => ({
          name: sc.class_name,
          preferenceOrder: sc.preference_order,
        })),
      });
      const validationLatencyMs = Date.now() - validationStart;

      // Record validation results
      if (!validationReport.isValid) {
        const errorResults = validationReport.results.filter((r) => r.severity === 'error' && !r.isValid);
        const errorsByRule = errorResults.reduce((acc: Record<string, number>, err: any) => {
          const rule = err.rule || 'unknown';
          acc[rule] = (acc[rule] || 0) + 1;
          return acc;
        }, {});

        for (const [rule] of Object.entries(errorsByRule)) {
          await recordCapTableMetrics({
            action: 'validate',
            status: 'error',
            latencyMs: validationLatencyMs,
            companyId,
            validationErrorRuleType: rule,
          });
        }
      }

      const docResult = await sql`
        INSERT INTO cap_table_documents (company_id, document_name, file_hash, uploaded_by, validation_status)
        VALUES (${companyId}, ${file.name}, ${fileHash}, ${session?.user?.id}, ${validationReport.isValid ? 'valid' : 'warning'})
        RETURNING id
      `;

      const docId = docResult[0].id;

      return NextResponse.json({
        success: true,
        documentId: docId,
        validationStatus: validationReport.isValid ? 'valid' : 'warning',
        validationResults: validationReport,
      });
    } finally {
      if (existsSync(tempFilePath)) unlinkSync(tempFilePath);
    }
  } catch (error) {
    console.error('Cap table upload error:', error);

    // Record upload error
    const errorLatencyMs = Date.now() - uploadStart;
    await recordCapTableMetrics({
      action: 'upload',
      status: 'error',
      latencyMs: errorLatencyMs,
    });

    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Upload failed', message: errorMsg },
      { status: 500 }
    );
  }
}
