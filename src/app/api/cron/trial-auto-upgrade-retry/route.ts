import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import {
  processPendingRetries,
  getQueueStatus,
} from '@/lib/trial-auto-upgrade';

export const dynamic = 'force-dynamic';

/**
 * CRON: Process pending trial auto-upgrade retries
 * 
 * Runs every 5 minutes to:
 * 1. Process all pending retries that are due (next_retry_at <= now)
 * 2. Escalate retries that have failed 3+ times to support
 * 3. Return queue status and processing stats
 * 
 * Security:
 * - Verifies CRON_SECRET header to prevent unauthorized triggers
 * - Logs all processing attempts
 * - Returns error immediately on auth failure
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.error('[CRON] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (cronSecret !== expectedSecret) {
      console.error('[CRON] Invalid cron secret provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting trial auto-upgrade retry processing');

    // Process all pending retries
    const results = await processPendingRetries();

    // Get updated queue status
    const queueStatus = await getQueueStatus();

    // Log processing completion
    const stats = {
      timestamp: new Date().toISOString(),
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      escalated: (results as any).escalated || 0,
      queueStatus: {
        pending: (queueStatus as any).pending || 0,
        in_progress: (queueStatus as any).in_progress || (queueStatus as any).retrying || 0,
        succeeded: (queueStatus as any).succeeded || 0,
        failed: (queueStatus as any).failed || 0,
        escalated: (queueStatus as any).escalated || 0,
        total: (queueStatus as any).total || 0,
      },
    };

    // Log to security events table
    await sql`
      INSERT INTO security_events (
        event_type,
        severity,
        message,
        details,
        created_at
      ) VALUES (
        'cron_trial_retry_processing',
        'info',
        ${'Trial auto-upgrade retry processing completed'},
        ${JSON.stringify(stats)},
        NOW()
      )
    `;

    console.log('[CRON] Processing complete:', stats);

    return NextResponse.json({
      success: true,
      message: 'Trial auto-upgrade retry processing completed',
      ...stats,
    });
  } catch (error) {
    console.error('[CRON] Error processing retries:', error);

    // Log error to security events
    try {
      await sql`
        INSERT INTO security_events (
          event_type,
          severity,
          message,
          details,
          created_at
        ) VALUES (
          'cron_trial_retry_error',
          'error',
          'Error processing trial auto-upgrade retries',
          ${JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          })},
          NOW()
        )
      `;
    } catch (logError) {
      console.error('[CRON] Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - allows manual triggering for debugging
 * Still requires CRON_SECRET
 */
export async function GET(request: NextRequest) {
  return POST(request);
}
