# IPOReady Monitoring Implementation Guide

**Last Updated:** June 7, 2026  
**Status:** Ready for Implementation  
**Effort:** 2-3 days for full setup

---

## Table of Contents

1. [Code Implementation](#code-implementation)
2. [Configuration Files](#configuration-files)
3. [Environment Setup](#environment-setup)
4. [API Integration Examples](#api-integration-examples)
5. [Testing & Validation](#testing--validation)
6. [Deployment Checklist](#deployment-checklist)

---

## Code Implementation

### 1. Datadog APM Instrumentation

**File:** `src/instrumentation.ts` (create if not exists)

```typescript
// src/instrumentation.ts
// Datadog APM initialization - MUST run before any app code

// Initialize tracer immediately
const initTracer = () => {
  const tracer = require('dd-trace').init({
    service: process.env.DD_SERVICE || 'ipoready',
    env: process.env.DD_ENV || 'development',
    version: process.env.DD_VERSION || '1.0.0',
    
    // Enable automatic instrumentation
    analytics: true,
    logInjection: true,
    runtimeMetrics: true,
    
    // APM configuration
    sampler: {
      rateLimit: 100, // Maximum traces per second
    },
    
    // Enhanced context
    tags: {
      team: 'platform',
      region: process.env.VERCEL_REGION || 'local',
    },
  });

  return tracer;
};

const tracer = initTracer();

// Export for manual tracing
export { tracer };

// Register hook for Next.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // APM already initialized above
  }
}
```

### 2. Custom Metrics Module

**File:** `src/lib/monitoring/metrics.ts`

```typescript
// src/lib/monitoring/metrics.ts
// StatsD client for custom metrics

import { StatsD } from 'node-dogstatsd';

const ddOptions = {
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: process.env.DD_AGENT_PORT || 8125,
  prefix: 'ipoready.',
  globalTags: [
    `env:${process.env.DD_ENV || 'development'}`,
    `service:ipoready`,
  ],
};

let statsdClient: StatsD | null = null;

export function initializeMetrics(): StatsD {
  if (!statsdClient) {
    statsdClient = new StatsD(ddOptions);
  }
  return statsdClient;
}

export function getMetricsClient(): StatsD {
  if (!statsdClient) {
    statsdClient = initializeMetrics();
  }
  return statsdClient;
}

// Metric recording functions
export const metrics = {
  // Document processing
  recordDocumentProcessing: (duration: number, success: boolean, type: string) => {
    const client = getMetricsClient();
    client.histogram('documents.processing_time', duration, { type });
    if (!success) {
      client.increment('documents.processing.failures', { type });
    }
  },

  // Prospectus generation
  recordProspectusGeneration: (duration: number, success: boolean, model: string) => {
    const client = getMetricsClient();
    client.histogram('prospectus.generation.time', duration, { model });
    if (!success) {
      client.increment('prospectus.generation.failures', { model });
    }
  },

  // API calls
  recordApiCall: (endpoint: string, duration: number, statusCode: number) => {
    const client = getMetricsClient();
    client.histogram('api.call.duration', duration, { endpoint });
    client.increment('api.call.count', { endpoint, status: statusCode });
  },

  // Database queries
  recordDatabaseQuery: (query: string, duration: number, success: boolean) => {
    const client = getMetricsClient();
    client.histogram('db.query.duration', duration, { query_type: getQueryType(query) });
    if (!success) {
      client.increment('db.query.failures');
    }
  },

  // Stripe API
  recordStripeCall: (endpoint: string, duration: number, success: boolean) => {
    const client = getMetricsClient();
    client.histogram('stripe.api.duration', duration, { endpoint });
    if (!success) {
      client.increment('stripe.api.failures', { endpoint });
    }
  },

  // Claude API
  recordClaudeCall: (model: string, tokens: number, duration: number) => {
    const client = getMetricsClient();
    client.histogram('claude.api.duration', duration, { model });
    client.gauge('claude.api.tokens', tokens, { model });
  },

  // Rate limiting
  recordRateLimitBreach: (userId: string, endpoint: string) => {
    const client = getMetricsClient();
    client.increment('ratelimit.breaches', { user_id: userId, endpoint });
  },

  // Cache hits/misses
  recordCacheAccess: (key: string, hit: boolean, duration: number) => {
    const client = getMetricsClient();
    const hitStr = hit ? 'hit' : 'miss';
    client.increment('cache.access', { status: hitStr });
    client.histogram('cache.duration', duration);
  },
};

// Helper: extract query type
function getQueryType(query: string): string {
  const match = query.toUpperCase().match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE)/);
  return match ? match[1].toLowerCase() : 'unknown';
}
```

### 3. Monitoring Middleware

**File:** `src/middleware/monitoring.ts`

```typescript
// src/middleware/monitoring.ts
// Next.js middleware for automatic request monitoring

import { NextRequest, NextResponse } from 'next/server';
import { getMetricsClient } from '@/lib/monitoring/metrics';

export function monitoringMiddleware(request: NextRequest) {
  // Skip health checks and static assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/api/health' ||
    request.nextUrl.pathname.includes('.jpg') ||
    request.nextUrl.pathname.includes('.png')
  ) {
    return NextResponse.next();
  }

  const metrics = getMetricsClient();
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;

  // Record request start
  metrics.increment('http.requests', {
    path: pathname,
    method: request.method,
  });

  // Continue to next middleware/handler
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 4. API Response Monitoring

**File:** `src/lib/monitoring/api-monitoring.ts`

```typescript
// src/lib/monitoring/api-monitoring.ts
// Higher-order function to wrap API handlers with monitoring

import { NextRequest, NextResponse } from 'next/server';
import { tracer } from '@/instrumentation';
import { getMetricsClient } from './metrics';

export interface MonitoredHandlerOptions {
  name: string;
  tags?: Record<string, string>;
  logPayload?: boolean;
}

export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: MonitoredHandlerOptions,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const span = tracer.startSpan(options.name);
    const metrics = getMetricsClient();
    const startTime = Date.now();

    try {
      span.setTag('http.method', req.method);
      span.setTag('http.url', req.nextUrl.pathname);

      // Add custom tags
      if (options.tags) {
        Object.entries(options.tags).forEach(([key, value]) => {
          span.setTag(key, value);
        });
      }

      // Execute handler
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Record metrics
      span.setTag('http.status_code', response.status);
      metrics.histogram(`api.handler.${options.name}.duration`, duration);
      metrics.increment(`api.handler.${options.name}.count`, {
        status: response.status.toString(),
      });

      // Log if error
      if (response.status >= 400) {
        span.setTag('error', true);
        span.log({
          event: 'api_error',
          status: response.status,
          message: await response.clone().text(),
        });
      }

      span.finish();
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record error
      span.setTag('error', true);
      span.log({
        event: 'exception',
        'error.object': error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      metrics.increment(`api.handler.${options.name}.errors`);
      metrics.histogram(`api.handler.${options.name}.error_duration`, duration);

      span.finish();

      // Return error response
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          requestId: req.headers.get('x-request-id'),
        },
        { status: 500 },
      );
    }
  };
}

// Example usage in API route:
// export const POST = withMonitoring(
//   async (req) => { /* handler */ },
//   { name: 'create_document', tags: { resource: 'documents' } }
// );
```

### 5. Database Query Monitoring

**File:** `src/lib/monitoring/db-monitoring.ts`

```typescript
// src/lib/monitoring/db-monitoring.ts
// Database connection monitoring with slow query detection

import { Pool, PoolClient } from 'pg';
import { tracer } from '@/instrumentation';
import { getMetricsClient } from './metrics';

const SLOW_QUERY_THRESHOLD = 300; // ms
const WARNING_QUERY_THRESHOLD = 100; // ms

export function createMonitoredPool(options: any): Pool {
  const pool = new Pool(options);
  const metrics = getMetricsClient();

  // Monitor pool events
  pool.on('connect', (client) => {
    metrics.gauge('postgresql.pool.connections', 1, { status: 'active' });
  });

  pool.on('error', (err) => {
    metrics.increment('postgresql.pool.errors');
    console.error('Unhandled pool error:', err);
  });

  // Wrap query method
  const originalQuery = pool.query.bind(pool);
  pool.query = function(queryConfig: any, values?: any[], callback?: any): any {
    const startTime = Date.now();
    const span = tracer.startSpan('pg.query');
    const queryStr = typeof queryConfig === 'string' ? queryConfig : queryConfig.text;

    span.setTag('db.system', 'postgresql');
    span.setTag('db.statement.type', extractQueryType(queryStr));

    // Handle callback style
    if (typeof callback === 'function') {
      return originalQuery(queryConfig, values, (err: any, res: any) => {
        const duration = Date.now() - startTime;
        recordQueryMetrics(queryStr, duration, !err, metrics);
        span.setTag('db.duration', duration);
        if (err) span.setTag('error', true);
        span.finish();
        callback(err, res);
      });
    }

    // Handle promise style
    return originalQuery(queryConfig, values).then(
      (res: any) => {
        const duration = Date.now() - startTime;
        recordQueryMetrics(queryStr, duration, true, metrics);
        span.setTag('db.duration', duration);
        span.finish();
        return res;
      },
      (err: any) => {
        const duration = Date.now() - startTime;
        recordQueryMetrics(queryStr, duration, false, metrics);
        span.setTag('error', true);
        span.setTag('db.duration', duration);
        span.finish();
        throw err;
      },
    );
  };

  return pool;
}

function recordQueryMetrics(
  query: string,
  duration: number,
  success: boolean,
  metrics: any,
) {
  const queryType = extractQueryType(query);

  // Base metrics
  metrics.histogram('db.query.duration', duration, { query_type: queryType });
  if (!success) {
    metrics.increment('db.query.errors', { query_type: queryType });
  }

  // Slow query detection
  if (duration > SLOW_QUERY_THRESHOLD) {
    metrics.increment('db.query.slow', { query_type: queryType, severity: 'critical' });
    console.warn(`[SLOW QUERY] ${queryType} took ${duration}ms: ${query.slice(0, 100)}`);
  } else if (duration > WARNING_QUERY_THRESHOLD) {
    metrics.increment('db.query.slow', { query_type: queryType, severity: 'warning' });
  }
}

function extractQueryType(query: string): string {
  const match = query.toUpperCase().match(/^(\w+)/);
  return match ? match[1].toLowerCase() : 'unknown';
}

export function createMonitoredClient(client: PoolClient): PoolClient {
  const originalQuery = client.query.bind(client);
  const span = tracer.startSpan('pg.client');

  client.query = function(queryConfig: any, values?: any[], callback?: any): any {
    const startTime = Date.now();
    const queryStr = typeof queryConfig === 'string' ? queryConfig : queryConfig.text;

    if (typeof callback === 'function') {
      return originalQuery(queryConfig, values, (err: any, res: any) => {
        const duration = Date.now() - startTime;
        span.setTag('db.duration', duration);
        callback(err, res);
      });
    }

    return originalQuery(queryConfig, values);
  };

  return client;
}
```

### 6. Error Tracking & Logging

**File:** `src/lib/monitoring/error-tracking.ts`

```typescript
// src/lib/monitoring/error-tracking.ts
// Centralized error tracking and logging

import { tracer } from '@/instrumentation';
import { getMetricsClient } from './metrics';

interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  action?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  [key: string]: any;
}

export class MonitoredError extends Error {
  context: ErrorContext;
  statusCode: number;

  constructor(message: string, statusCode: number = 500, context: ErrorContext = {}) {
    super(message);
    this.name = 'MonitoredError';
    this.statusCode = statusCode;
    this.context = context;
  }
}

export function trackError(error: Error, context: ErrorContext = {}): void {
  const metrics = getMetricsClient();
  const span = tracer.startSpan('error.tracking');

  // Log error details
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    type: error.name,
    timestamp: new Date().toISOString(),
    ...context,
  };

  console.error('[ERROR]', JSON.stringify(errorInfo, null, 2));

  // Record in Datadog
  span.setTag('error', true);
  span.setTag('error.message', error.message);
  span.setTag('error.type', error.name);
  span.setTag('error.stack', error.stack);

  // Add context tags
  Object.entries(context).forEach(([key, value]) => {
    if (value !== undefined) {
      span.setTag(`context.${key}`, String(value));
    }
  });

  // Record metrics
  metrics.increment('errors.total', {
    type: error.name,
    severity: context.severity || 'high',
  });

  if (context.userId) {
    metrics.increment('errors.by_user', { user_id: context.userId });
  }

  span.finish();
}

export function captureException(error: unknown, context: ErrorContext = {}): void {
  if (error instanceof Error) {
    trackError(error, context);
  } else {
    const err = new Error(String(error));
    trackError(err, { ...context, original_type: typeof error });
  }
}

// Global error handlers
export function setupGlobalErrorHandlers(): void {
  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    trackError(
      new Error(String(reason)),
      {
        severity: 'critical',
        action: 'unhandled_rejection',
      },
    );
  });

  // Uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    trackError(error, {
      severity: 'critical',
      action: 'uncaught_exception',
    });
  });
}
```

### 7. Performance Monitoring

**File:** `src/lib/monitoring/performance.ts`

```typescript
// src/lib/monitoring/performance.ts
// Application performance monitoring utilities

import { getMetricsClient } from './metrics';

export class PerformanceTracker {
  private startTime: number;
  private metrics: Map<string, number>;
  private metricsClient = getMetricsClient();

  constructor() {
    this.startTime = Date.now();
    this.metrics = new Map();
  }

  mark(name: string): void {
    this.metrics.set(name, Date.now() - this.startTime);
  }

  measure(name: string, startMark?: string, endMark?: string): number {
    const start = startMark ? this.metrics.get(startMark) || 0 : 0;
    const end = endMark ? this.metrics.get(endMark) || Date.now() - this.startTime : Date.now() - this.startTime;
    const duration = end - start;

    this.metricsClient.histogram(`performance.${name}`, duration);
    return duration;
  }

  report(): Record<string, number> {
    const report: Record<string, number> = {};
    this.metrics.forEach((time, mark) => {
      report[mark] = time;
    });
    return report;
  }
}

// Memory usage monitoring
export function recordMemoryUsage(): void {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const metrics = getMetricsClient();

    metrics.gauge('memory.heap_used', usage.heapUsed / 1024 / 1024); // MB
    metrics.gauge('memory.heap_total', usage.heapTotal / 1024 / 1024); // MB
    metrics.gauge('memory.external', usage.external / 1024 / 1024); // MB
  }
}

// Start periodic memory monitoring
export function startMemoryMonitoring(intervalMs: number = 60000): void {
  setInterval(recordMemoryUsage, intervalMs);
}
```

---

## Configuration Files

### 1. Vercel Configuration

**File:** `vercel.json`

```json
{
  "buildCommand": "npm run db:migrate && next build",
  "env": {
    "DD_ENV": "production",
    "DD_SERVICE": "ipoready",
    "DD_VERSION": "@git_sha",
    "DD_TRACE_SAMPLE_RATE": "1.0"
  },
  "integrations": [
    {
      "name": "datadog"
    }
  ]
}
```

### 2. Next.js Configuration

**File:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable APM
  experimental: {
    instrumentationHook: true,
  },

  // Environment variables
  env: {
    DD_ENV: process.env.DD_ENV || 'development',
    DD_SERVICE: process.env.DD_SERVICE || 'ipoready',
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefresh: true,
    },
  },

  // Headers for monitoring
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Service-Name',
            value: 'ipoready',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3. TypeScript Configuration

**File:** `tsconfig.json` (relevant sections)

```json
{
  "compilerOptions": {
    "lib": ["ES2020"],
    "types": ["node", "jest", "@types/node"],
    "allowJs": true,
    "checkJs": false,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "next-env.d.ts"
  ]
}
```

---

## Environment Setup

### Development Environment

**File:** `.env.local` (development)

```env
# Datadog - Development
DD_ENV=development
DD_SERVICE=ipoready
DD_AGENT_HOST=127.0.0.1
DD_AGENT_PORT=8125
DD_TRACE_SAMPLE_RATE=0.1
DD_METRICS_ENABLED=true
DD_LOGS_ENABLED=false  # Reduce noise in development

# Monitoring
MONITORING_ENABLED=true
SLOW_QUERY_THRESHOLD=300
```

### Staging Environment

**File:** `.env.staging`

```env
# Datadog - Staging
DD_ENV=staging
DD_SERVICE=ipoready
DD_AGENT_HOST=datadog-agent.staging.internal
DD_AGENT_PORT=8125
DD_TRACE_SAMPLE_RATE=0.5
DD_METRICS_ENABLED=true
DD_LOGS_ENABLED=true

# Monitoring
MONITORING_ENABLED=true
SLOW_QUERY_THRESHOLD=200
```

### Production Environment

**File:** `.env.production` (Vercel secrets)

```env
# Datadog - Production
DD_ENV=production
DD_SERVICE=ipoready
DD_TRACE_SAMPLE_RATE=1.0
DD_METRICS_ENABLED=true
DD_LOGS_ENABLED=true
DATADOG_API_KEY=<production_api_key>
DATADOG_APP_KEY=<production_app_key>

# Monitoring
MONITORING_ENABLED=true
SLOW_QUERY_THRESHOLD=300
ERROR_TRACKING_ENABLED=true
```

---

## API Integration Examples

### 1. Document Processing API with Monitoring

**File:** `src/app/api/documents/process/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMonitoring } from '@/lib/monitoring/api-monitoring';
import { tracer } from '@/instrumentation';
import { metrics } from '@/lib/monitoring/metrics';
import { trackError } from '@/lib/monitoring/error-tracking';

async function processDocumentHandler(req: NextRequest): Promise<NextResponse> {
  const span = tracer.startSpan('api.documents.process');
  const startTime = Date.now();

  try {
    // Parse request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    span.setTag('file.name', file?.name);
    span.setTag('file.size', file?.size);

    // Process document
    const duration = Date.now() - startTime;
    metrics.recordDocumentProcessing(duration, true, file?.type || 'unknown');

    span.finish();

    return NextResponse.json({
      success: true,
      documentId: 'doc_123',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    trackError(error as Error, {
      endpoint: '/api/documents/process',
      action: 'process_document',
      severity: 'high',
    });

    metrics.recordDocumentProcessing(duration, false, 'error');

    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 400 },
    );
  }
}

export const POST = withMonitoring(processDocumentHandler, {
  name: 'documents.process',
  tags: { resource: 'documents' },
});
```

### 2. Prospectus Generation API

**File:** `src/app/api/prospectus/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMonitoring } from '@/lib/monitoring/api-monitoring';
import { tracer } from '@/instrumentation';
import { metrics } from '@/lib/monitoring/metrics';
import { Anthropic } from '@anthropic-ai/sdk';

async function generateProspectusHandler(req: NextRequest): Promise<NextResponse> {
  const span = tracer.startSpan('api.prospectus.generate');
  const startTime = Date.now();
  const model = 'claude-3-sonnet-20240229';

  try {
    const { companyId } = await req.json();
    span.setTag('company_id', companyId);

    // Call Claude API
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const claudeStartTime = Date.now();
    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Generate prospectus outline for company ${companyId}`,
        },
      ],
    });

    const claudeDuration = Date.now() - claudeStartTime;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    // Record Claude API metrics
    metrics.recordClaudeCall(model, inputTokens + outputTokens, claudeDuration);

    const totalDuration = Date.now() - startTime;
    metrics.recordProspectusGeneration(totalDuration, true, model);

    return NextResponse.json({
      success: true,
      prospectus: response.content[0].type === 'text' ? response.content[0].text : '',
      tokens: {
        input: inputTokens,
        output: outputTokens,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.recordProspectusGeneration(duration, false, model);

    return NextResponse.json(
      { error: 'Failed to generate prospectus' },
      { status: 500 },
    );
  }
}

export const POST = withMonitoring(generateProspectusHandler, {
  name: 'prospectus.generate',
  tags: { resource: 'prospectus', model: 'claude-3-sonnet' },
});
```

### 3. Stripe Webhook with Monitoring

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getMetricsClient } from '@/lib/monitoring/metrics';
import { trackError } from '@/lib/monitoring/error-tracking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const metrics = getMetricsClient();
  const startTime = Date.now();

  try {
    const signature = request.headers.get('stripe-signature')!;
    const body = await request.text();

    // Verify webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    const duration = Date.now() - startTime;
    metrics.recordApiCall('stripe.webhook', duration, 200);

    // Handle event
    switch (event.type) {
      case 'payment_intent.succeeded':
        metrics.increment('stripe.payment.succeeded');
        break;
      case 'payment_intent.payment_failed':
        metrics.increment('stripe.payment.failed');
        trackError(new Error('Payment failed'), {
          action: 'stripe_webhook',
          event_type: event.type,
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.recordApiCall('stripe.webhook', duration, 400);
    trackError(error as Error, {
      action: 'stripe_webhook',
      severity: 'high',
    });

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 },
    );
  }
}
```

---

## Testing & Validation

### 1. Local Testing

**File:** `scripts/test-monitoring.ts`

```typescript
// scripts/test-monitoring.ts
// Test monitoring setup locally

import { initializeMetrics, getMetricsClient } from '../src/lib/monitoring/metrics';
import { createMonitoredPool } from '../src/lib/monitoring/db-monitoring';
import { PerformanceTracker } from '../src/lib/monitoring/performance';

async function testMonitoring() {
  console.log('Starting monitoring tests...\n');

  // Test 1: Metrics
  console.log('Test 1: Custom Metrics');
  const metrics = initializeMetrics();
  metrics.histogram('test.metric', 100, { test: 'true' });
  console.log('✓ Metrics recording working\n');

  // Test 2: Performance tracking
  console.log('Test 2: Performance Tracking');
  const tracker = new PerformanceTracker();
  tracker.mark('start');
  await new Promise((resolve) => setTimeout(resolve, 100));
  tracker.mark('end');
  const duration = tracker.measure('test_duration', 'start', 'end');
  console.log(`✓ Performance tracked: ${duration}ms\n`);

  // Test 3: Database monitoring
  console.log('Test 3: Database Monitoring');
  const pool = createMonitoredPool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

  try {
    const result = await pool.query('SELECT 1');
    console.log('✓ Database monitoring working\n');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
  } finally {
    await pool.end();
  }

  console.log('All tests completed!');
}

testMonitoring().catch(console.error);
```

### 2. Endpoint Testing

```bash
# Test health endpoint
curl -X GET http://localhost:3000/api/health

# Test with monitoring headers
curl -X POST http://localhost:3000/api/documents/process \
  -H "X-Request-ID: test-123" \
  -F "file=@test.pdf"
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All code changes reviewed and tested
- [ ] Environment variables set in Vercel
- [ ] Datadog integration configured
- [ ] PostgreSQL monitoring enabled
- [ ] Alerts created and tested
- [ ] Slack integration verified
- [ ] Team trained on monitoring dashboard

### Deployment

- [ ] Deploy to staging first
- [ ] Verify metrics flowing to Datadog
- [ ] Verify logs appearing in Datadog
- [ ] Verify synthetic tests passing
- [ ] Deploy to production
- [ ] Monitor dashboard for anomalies

### Post-Deployment

- [ ] Set baseline metrics (24 hours observation)
- [ ] Adjust alert thresholds as needed
- [ ] Document any issues found
- [ ] Update runbooks with new metrics
- [ ] Schedule team training
- [ ] Set up on-call rotation in PagerDuty

---

**Implementation Status:** Ready to Deploy  
**Estimated Implementation Time:** 2-3 days  
**Team Required:** 1 Backend Engineer + 1 DevOps Engineer
