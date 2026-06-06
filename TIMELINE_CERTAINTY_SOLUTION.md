# Timeline Certainty Solution - IPO Launch Date Prediction

## Executive Summary

**Problem**: CEO cannot answer "when will we list?" with credibility. Board lacks confidence. Estimates slip 50% of the time. Capital allocation, underwriter alignment, and investor expectations suffer.

**Solution**: Data-driven IPO timeline prediction engine with confidence intervals, sensitivity analysis, and weekly board reporting. Transforms opaque estimates into transparent, actionable forecasts.

**Value Delivered**:
- Board confidence: Clear timeline with uncertainty bands (e.g., "Sept 6, ±1 week, 80% confidence")
- Executive accountability: Flags at-risk phases before slippage occurs
- Strategic planning: "If audit delays 4 weeks, launch shifts to Jan 15"
- Stakeholder alignment: Underwriters, capital partners, and investor relations work from same baseline

**Target Launch**: June 18, 2026 (Post-Unified Documents MVP)

---

## 1. Timeline Prediction Engine: Architecture

### 1.1 Core Concept

The engine ingests:
- Task completion velocity (from PACE™ historical data)
- Critical path analysis (phase dependencies)
- Variance patterns (task overruns, corrections)
- Risk factor adjustments (audit delays, regulatory tightening)

And produces:
- **Base Forecast**: "Sept 6, 2026"
- **Confidence Interval**: ±1 week (80% CI)
- **Risk Adjustments**: "Jan 15 if audit delays 4 weeks"
- **Trend**: "Improving: 2 weeks behind baseline → now 1 week behind"

### 1.2 Database Schema: Timeline Tracking

**New Migration: `025_timeline_prediction_engine.sql`**

```sql
-- ============================================================
-- IPO_TIMELINE_FORECASTS: Core timeline predictions
-- ============================================================

CREATE TABLE IF NOT EXISTS ipo_timeline_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Base forecast
  base_launch_date DATE NOT NULL,
  forecast_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  forecast_confidence_pct INT NOT NULL,  -- 50-95% range
  confidence_interval_days INT NOT NULL,  -- ±N days
  
  -- Velocity metrics
  avg_task_completion_velocity FLOAT,  -- tasks per day
  critical_path_length_days INT,  -- Longest phase sequence
  velocity_trend VARCHAR(50),  -- improving, declining, stable
  
  -- Variance data
  avg_task_variance_pct FLOAT,  -- Historical overrun %
  recovery_velocity FLOAT,  -- How fast team catches up
  
  -- Risk adjustments
  total_risk_adjustment_days INT DEFAULT 0,  -- Sum of all risk adds
  delay_risk_flag BOOLEAN DEFAULT FALSE,  -- T/F: at-risk phases exist
  
  -- Metadata
  calculation_method VARCHAR(100),  -- monte_carlo, critical_path, hybrid
  data_points_used INT,  -- Number of historical tasks in model
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ipo_timeline_forecasts_company 
  ON ipo_timeline_forecasts(company_id);
CREATE INDEX idx_ipo_timeline_forecasts_date 
  ON ipo_timeline_forecasts(base_launch_date);
CREATE INDEX idx_ipo_timeline_forecasts_confidence 
  ON ipo_timeline_forecasts(forecast_confidence_pct DESC);

-- ============================================================
-- TIMELINE_SENSITIVITY_SCENARIOS: What-if analysis
-- ============================================================

CREATE TABLE IF NOT EXISTS timeline_sensitivity_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  forecast_id UUID REFERENCES ipo_timeline_forecasts(id) ON DELETE CASCADE,
  
  -- Scenario definition
  scenario_name VARCHAR(255) NOT NULL,  -- "Audit +4 weeks", "Legal docs on time"
  scenario_type VARCHAR(50) NOT NULL,  -- risk, optimistic, baseline
  description TEXT,
  
  -- Adjustment parameters
  adjustment_target VARCHAR(100),  -- phase_name, activity_type
  adjustment_days INT NOT NULL,
  adjustment_reason TEXT,
  
  -- Calculated outcome
  projected_launch_date DATE NOT NULL,
  days_vs_baseline INT NOT NULL,  -- Positive = slip
  probability_pct INT,  -- 0-100%
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_timeline_sensitivity_scenarios_company 
  ON timeline_sensitivity_scenarios(company_id);
CREATE INDEX idx_timeline_sensitivity_scenarios_type 
  ON timeline_sensitivity_scenarios(scenario_type);

-- ============================================================
-- TIMELINE_VELOCITY_HISTORY: Daily tracking for trends
-- ============================================================

CREATE TABLE IF NOT EXISTS timeline_velocity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Snapshot data (recorded daily)
  recorded_date DATE NOT NULL,
  tasks_completed_this_period INT,
  tasks_completed_cumulative INT,
  
  -- Forecast at this snapshot
  forecasted_launch_date_then DATE,
  forecasted_launch_date_now DATE,
  launch_date_trend_days INT,  -- Positive = slipping
  
  -- Variance metrics
  planned_velocity_tasks_per_day FLOAT,
  actual_velocity_tasks_per_day FLOAT,
  variance_pct FLOAT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_timeline_velocity_history_company 
  ON timeline_velocity_history(company_id);
CREATE INDEX idx_timeline_velocity_history_date 
  ON timeline_velocity_history(recorded_date DESC);
CREATE INDEX idx_timeline_velocity_history_company_date 
  ON timeline_velocity_history(company_id, recorded_date DESC);

-- ============================================================
-- TIMELINE_ALERTS: Flag slipping phases early
-- ============================================================

CREATE TABLE IF NOT EXISTS timeline_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  alert_type VARCHAR(100) NOT NULL,  -- phase_behind, velocity_declining, variance_high
  phase_name VARCHAR(100),
  severity VARCHAR(20) NOT NULL,  -- info, warning, critical
  
  metric_name VARCHAR(100),
  current_value FLOAT,
  benchmark_value FLOAT,
  variance_pct FLOAT,
  
  message TEXT NOT NULL,
  recommended_action TEXT,
  
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_timeline_alerts_company 
  ON timeline_alerts(company_id);
CREATE INDEX idx_timeline_alerts_severity 
  ON timeline_alerts(severity DESC);
CREATE INDEX idx_timeline_alerts_acknowledged 
  ON timeline_alerts(acknowledged);

-- ============================================================
-- Updated_at trigger
-- ============================================================

DROP TRIGGER IF EXISTS update_ipo_timeline_forecasts_updated_at 
  ON ipo_timeline_forecasts;
CREATE TRIGGER update_ipo_timeline_forecasts_updated_at
  BEFORE UPDATE ON ipo_timeline_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_alerts_updated_at 
  ON timeline_alerts;
CREATE TRIGGER update_timeline_alerts_updated_at
  BEFORE UPDATE ON timeline_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. Calculation Algorithm: Monte Carlo + Critical Path

### 2.1 Data Sources

1. **Historical Task Data** (`checklist_items` table)
   - `completed_at - created_at` = actual task duration
   - `estimated_days` vs actual = variance pattern
   - Group by category (Legal, Financial, Governance, etc.)

2. **Phase Sequencing** (from `onboarding_templates` and PACE™)
   - Identify mandatory sequence: Phase 1 → Phase 2 → ... → Phase 8
   - Dependency graph: which tasks block others

3. **Velocity Metrics**
   - Tasks completed per week (from recent history)
   - Acceleration/deceleration trend (slope over 4-week window)

### 2.2 Algorithm: Hybrid Critical Path + Monte Carlo

**Stage 1: Calculate Base Critical Path**

```
For each phase in sequence:
  - Sum estimated_days of all critical path tasks
  - Adjust by historical variance factor
  
critical_path_days = SUM(phase_duration_with_variance)
base_launch_date = today + critical_path_days
```

**Stage 2: Monte Carlo Sampling (1000 simulations)**

```
For iteration 1 to 1000:
  - Sample task durations from variance distribution
  - Apply velocity variance (days slip by up to ±variance_pct)
  - Simulate delays (audit, legal, regulatory blocking)
  - Record final launch_date
  
percentile_50 = median(simulations)
percentile_10 = 10th percentile (optimistic)
percentile_90 = 90th percentile (pessimistic)
confidence_interval = percentile_90 - percentile_50
confidence_pct = (1 - (range / total_days)) * 100
```

**Stage 3: Risk Adjustments**

```
For each open risk factor (audit_not_started, etc.):
  - Add estimated delay days
  - Mark scenario in sensitivity analysis
  
total_risk_adjustment = SUM(risk_adjustments)
```

### 2.3 Output: Forecast JSON

```typescript
interface IPOTimelineForecast {
  baseDate: string;  // "2026-09-06"
  confidenceIntervalDays: number;  // 7 (±7 = Sept 1-13 range)
  confidencePct: number;  // 80
  trend: "improving" | "declining" | "stable";
  trendDays: number;  // -2 = getting better (was Sept 8, now Sept 6)
  
  velocityMetrics: {
    avgCompletionRate: number;  // tasks/day
    historicalVariancePct: number;  // 15%
    recoveryRate: number;  // how fast team catches up
  };
  
  sensitivityScenarios: [
    {
      name: "Audit delays 4 weeks",
      adjustment: 28,
      projectedDate: "2026-10-04",
      probability: 0.25  // 25% chance
    },
    {
      name: "Legal docs finish June 15 (3 weeks early)",
      adjustment: -21,
      projectedDate: "2026-08-16",
      probability: 0.15  // 15% chance, risky
    }
  ];
  
  atRiskPhases: [
    {
      phase: "Legal Documentation",
      daysOffSchedule: 14,
      reason: "Regulatory changes delayed template updates",
      recommendation: "Expedite legal review; consider parallel workflows"
    }
  ];
}
```

---

## 3. API Implementation

### 3.1 Routes

**`/api/timeline/forecast`** — Generate and retrieve current forecast

```typescript
// GET /api/timeline/forecast?companyId=<uuid>
Response {
  forecast: IPOTimelineForecast;
  lastUpdated: ISO8601;
  nextUpdate: ISO8601;  // When to recalculate
}

// POST /api/timeline/forecast/recalculate
Body { companyId: UUID }
Response {
  forecast: IPOTimelineForecast;
  recalculatedAt: ISO8601;
}
```

**`/api/timeline/sensitivity`** — What-if scenario analysis

```typescript
// POST /api/timeline/sensitivity
Body {
  companyId: UUID;
  scenarios: [
    {
      name: string;
      target: "phase_name" | "activity_type";
      adjustmentDays: number;
      reason: string;
    }
  ];
}

Response {
  scenarios: TimelineSensitivityScenario[];
  impactSummary: {
    mostLikelySlip: number;  // days
    bestCase: number;
    worstCase: number;
  };
}
```

**`/api/timeline/alerts`** — Get and acknowledge timeline alerts

```typescript
// GET /api/timeline/alerts?companyId=<uuid>&severity=warning|critical
Response {
  alerts: TimelineAlert[];
  summary: {
    critical: number;
    warning: number;
    info: number;
  };
}

// POST /api/timeline/alerts/<alertId>/acknowledge
Body { acknowledgedBy: UUID }
Response { acknowledged: true; }
```

**`/api/timeline/velocity-history`** — Daily trend data for charts

```typescript
// GET /api/timeline/velocity-history?companyId=<uuid>&days=30
Response {
  history: TimelineVelocityRecord[];
  trend: "improving" | "declining" | "stable";
  trendDays: number;
}
```

### 3.2 Service Implementation: `src/lib/services/timeline-prediction-service.ts`

```typescript
import { db } from "@/db";
import { 
  ipoTimelineForecasts, 
  timelineSensitivityScenarios,
  timelineVelocityHistory,
  timelineAlerts,
  checklistItems 
} from "@/db/schema";

export class TimelinePredictionService {
  /**
   * Calculate IPO launch date forecast using hybrid approach
   */
  async generateForecast(companyId: string): Promise<IPOTimelineForecast> {
    // 1. Fetch historical task data
    const tasks = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.company_id, companyId));
    
    // 2. Calculate critical path
    const criticalPath = this.calculateCriticalPath(tasks);
    
    // 3. Run Monte Carlo simulation
    const simulations = this.monteCarlo(criticalPath, 1000);
    
    // 4. Calculate confidence intervals
    const forecast = this.calculateConfidence(
      simulations,
      criticalPath,
      tasks
    );
    
    // 5. Store in DB
    await db.insert(ipoTimelineForecasts).values({
      company_id: companyId,
      base_launch_date: forecast.baseDate,
      forecast_confidence_pct: forecast.confidencePct,
      confidence_interval_days: forecast.confidenceIntervalDays,
      velocity_trend: forecast.trend,
      // ... other fields
    });
    
    return forecast;
  }
  
  /**
   * Run sensitivity analysis for what-if scenarios
   */
  async analyzeSensitivity(
    companyId: string,
    scenarios: SensitivityRequest[]
  ): Promise<SensitivityAnalysisResult> {
    const baseForecast = await db
      .select()
      .from(ipoTimelineForecasts)
      .where(eq(ipoTimelineForecasts.company_id, companyId))
      .orderBy(desc(ipoTimelineForecasts.created_at))
      .limit(1)
      .then(r => r[0]);
    
    const results = scenarios.map(scenario => {
      const adjustedDate = this.addDaysToDate(
        baseForecast.base_launch_date,
        scenario.adjustmentDays
      );
      
      return {
        name: scenario.name,
        projectedDate: adjustedDate,
        adjustment: scenario.adjustmentDays,
        probability: this.estimateProbability(scenario)
      };
    });
    
    // Store scenarios
    await db.insert(timelineSensitivityScenarios).values(
      results.map(r => ({
        company_id: companyId,
        scenario_name: r.name,
        projected_launch_date: r.projectedDate,
        // ...
      }))
    );
    
    return {
      scenarios: results,
      impactSummary: this.summarizeImpact(results)
    };
  }
  
  /**
   * Flag at-risk phases and generate alerts
   */
  async checkForAlerts(companyId: string): Promise<TimelineAlert[]> {
    const tasks = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.company_id, companyId));
    
    const alerts: TimelineAlert[] = [];
    
    // Check each phase for delays
    const phaseMetrics = this.analyzeByPhase(tasks);
    for (const [phase, metrics] of Object.entries(phaseMetrics)) {
      if (metrics.daysOverEstimate > 3) {
        alerts.push({
          type: "phase_behind",
          phase,
          severity: metrics.daysOverEstimate > 7 ? "critical" : "warning",
          message: `${phase} is ${metrics.daysOverEstimate} days behind schedule`,
          recommendation: "Review blockers; consider parallel workflows"
        });
      }
      
      if (metrics.velocityTrend === "declining") {
        alerts.push({
          type: "velocity_declining",
          phase,
          severity: "warning",
          message: `Task completion velocity declining in ${phase}`,
          recommendation: "Identify bottlenecks; allocate more resources"
        });
      }
    }
    
    // Store alerts
    await db.insert(timelineAlerts).values(
      alerts.map(a => ({ company_id: companyId, ...a }))
    );
    
    return alerts;
  }
  
  // === Private helper methods ===
  
  private calculateCriticalPath(tasks: ChecklistItem[]): CriticalPath {
    // Topologically sort tasks by dependencies
    // Sum durations along longest path
    // Return estimate with variance
  }
  
  private monteCarlo(
    criticalPath: CriticalPath,
    iterations: number
  ): number[] {
    const simulations: number[] = [];
    for (let i = 0; i < iterations; i++) {
      // Sample task durations from variance distribution
      // Apply risk factor adjustments
      // Record final duration
    }
    return simulations.sort((a, b) => a - b);
  }
  
  private calculateConfidence(
    simulations: number[],
    criticalPath: CriticalPath,
    tasks: ChecklistItem[]
  ): IPOTimelineForecast {
    const p50 = simulations[Math.floor(simulations.length * 0.5)];
    const p80 = simulations[Math.floor(simulations.length * 0.8)];
    const p20 = simulations[Math.floor(simulations.length * 0.2)];
    
    return {
      baseDate: this.addDaysToDate(new Date(), p50),
      confidenceIntervalDays: p80 - p20,
      confidencePct: 80,
      trend: this.calculateTrend(tasks),
      // ...
    };
  }
  
  private analyzeByPhase(tasks: ChecklistItem[]): Record<string, PhaseMetrics> {
    // Group tasks by category/phase
    // Calculate metrics per phase
  }
  
  private estimateProbability(scenario: SensitivityRequest): number {
    // Based on risk factors and historical patterns
    // Return 0-1 probability
  }
}
```

---

## 4. Board Reporting: Weekly Timeline Update

### 4.1 Report Structure

**`/api/timeline/board-report`** — Generate CEO/board-ready summary

```typescript
// GET /api/timeline/board-report?companyId=<uuid>
Response {
  executiveSummary: {
    headline: string;  // "Timeline: Sept 6, ±1 week, 80% confidence"
    status: "on_track" | "at_risk" | "critical";
    lastUpdate: ISO8601;
  };
  
  timeline: {
    baseDate: string;
    confidenceInterval: {
      lower: string;
      upper: string;
      days: number;
    };
    confidence: number;  // %
  };
  
  trend: {
    direction: "improving" | "declining" | "stable";
    daysSlippage: number;  // Positive = slipping
    weeksAgo: number;  // When was previous forecast
  };
  
  atRiskPhases: [
    {
      phase: string;
      daysOffSchedule: number;
      severity: "info" | "warning" | "critical";
      recommendation: string;
      owner: string;  // Role responsible
    }
  ];
  
  keyScenarios: [
    {
      name: string;
      projectedDate: string;
      daysVsBaseline: number;
      probability: number;  // %
    }
  ];
  
  velocityMetrics: {
    completedThisWeek: number;
    avgPerWeek: number;
    trend: string;
    tasksRemaining: number;
  };
}
```

### 4.2 Email Template: Weekly Timeline Update

**`src/lib/email-templates/timeline-update.tsx`**

```tsx
import * as React from "react";

interface TimelineUpdateEmailProps {
  companyName: string;
  headlineDate: string;  // "Sept 6, 2026"
  confidenceInterval: string;  // "±1 week (80%)"
  status: "on_track" | "at_risk" | "critical";
  trendDirection: "improving" | "declining" | "stable";
  trendDays: number;
  atRiskCount: number;
  keyScenarios: Array<{
    name: string;
    date: string;
    probability: number;
  }>;
  ceoName: string;
}

export const TimelineUpdateEmail: React.FC<TimelineUpdateEmailProps> = ({
  companyName,
  headlineDate,
  confidenceInterval,
  status,
  trendDirection,
  trendDays,
  atRiskCount,
  keyScenarios,
  ceoName
}) => {
  const statusColor = {
    on_track: "#10b981",
    at_risk: "#f59e0b",
    critical: "#ef4444"
  }[status];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px" }}>
      <h1 style={{ marginBottom: "24px", fontSize: "28px" }}>
        IPOReady Timeline Update
      </h1>

      {/* Headline */}
      <div
        style={{
          padding: "24px",
          backgroundColor: statusColor,
          color: "white",
          borderRadius: "8px",
          marginBottom: "24px",
          textAlign: "center"
        }}
      >
        <p style={{ fontSize: "14px", margin: "0 0 8px 0", opacity: 0.9 }}>
          {companyName}
        </p>
        <h2 style={{ fontSize: "32px", margin: "0 0 4px 0" }}>
          {headlineDate}
        </h2>
        <p style={{ fontSize: "14px", margin: "0" }}>
          Confidence: {confidenceInterval}
        </p>
      </div>

      {/* Trend */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0" }}>
          TREND
        </p>
        <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>
          {trendDirection === "improving"
            ? `✓ Improving: ${Math.abs(trendDays)} days better vs last week`
            : trendDirection === "declining"
            ? `⚠ Declining: ${trendDays} days slip vs last week`
            : "Stable: No significant change"}
        </p>
      </div>

      {/* At-Risk Alert */}
      {atRiskCount > 0 && (
        <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b", borderRadius: "4px" }}>
          <p style={{ fontSize: "12px", color: "#92400e", margin: "0 0 8px 0", fontWeight: "bold" }}>
            AT-RISK PHASES: {atRiskCount}
          </p>
          <p style={{ margin: "0", fontSize: "14px", color: "#78350f" }}>
            See attached report for details and recommended actions.
          </p>
        </div>
      )}

      {/* Key Scenarios */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0", fontWeight: "bold" }}>
          SENSITIVITY SCENARIOS
        </p>
        {keyScenarios.map((s, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "8px",
              padding: "12px",
              backgroundColor: "#f9fafb",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: "14px" }}>{s.name}</span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {s.date} ({s.probability}% probability)
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <a
          href="https://app.ipoready.com/timeline"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          View Full Report
        </a>
      </div>

      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "24px 0 0 0" }}>
        Questions? Reach out to your IPOReady advisor.
      </p>
    </div>
  );
};
```

### 4.3 Scheduling: Weekly Update Job

**`src/lib/cron/timeline-update.ts`** — Runs every Monday 8 AM

```typescript
import { db } from "@/db";
import { companies } from "@/db/schema";
import { TimelinePredictionService } from "@/lib/services/timeline-prediction-service";
import { sendEmail } from "@/lib/email";

export async function weeklyTimelineUpdate() {
  const service = new TimelinePredictionService();
  
  // Get all active companies
  const activeCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.status, "active"));
  
  for (const company of activeCompanies) {
    try {
      // Recalculate forecast
      const forecast = await service.generateForecast(company.id);
      
      // Check for alerts
      const alerts = await service.checkForAlerts(company.id);
      
      // Generate board report
      const report = await service.getBoardReport(company.id);
      
      // Send email to CEO + CFO
      const teamMembers = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.company_id, company.id),
            inArray(teamMembers.role, ["CEO", "CFO"])
          )
        );
      
      for (const member of teamMembers) {
        await sendEmail({
          to: member.email,
          subject: `IPOReady Timeline Update: ${company.name}`,
          templateId: "timeline-update",
          data: {
            companyName: company.name,
            headlineDate: forecast.baseDate,
            confidenceInterval: `±${forecast.confidenceIntervalDays} days (${forecast.confidencePct}%)`,
            status: alerts.length > 0 ? "at_risk" : "on_track",
            trendDirection: forecast.trend,
            trendDays: forecast.trendDays,
            atRiskCount: alerts.filter(a => a.severity === "critical").length,
            keyScenarios: forecast.sensitivityScenarios.slice(0, 3),
            ceoName: member.name
          }
        });
      }
      
    } catch (error) {
      console.error(`Timeline update failed for ${company.id}:`, error);
    }
  }
}
```

---

## 5. UI Components: Timeline Dashboard

### 5.1 Main Component: `TimelineCertaintyDashboard`

**`src/components/TimelineCertaintyDashboard.tsx`**

```tsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface TimelineCertaintyDashboardProps {
  companyId: string;
}

export const TimelineCertaintyDashboard: React.FC<
  TimelineCertaintyDashboardProps
> = ({ companyId }) => {
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [companyId]);

  const fetchTimeline = async () => {
    const [forecastRes, alertsRes, historyRes] = await Promise.all([
      fetch(`/api/timeline/forecast?companyId=${companyId}`),
      fetch(`/api/timeline/alerts?companyId=${companyId}`),
      fetch(`/api/timeline/velocity-history?companyId=${companyId}&days=90`)
    ]);

    setForecast(await forecastRes.json());
    setAlerts(await alertsRes.json());
    setHistory(await historyRes.json());
    setLoading(false);
  };

  if (loading) return <div>Loading timeline data...</div>;

  return (
    <div style={{ padding: "24px" }}>
      {/* Headline Card */}
      <HeadlineCard forecast={forecast} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
        {/* Velocity Trend Chart */}
        <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3>30-Day Completion Velocity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="recorded_date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="actual_velocity_tasks_per_day"
                stroke="#3b82f6"
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="planned_velocity_tasks_per_day"
                stroke="#9ca3af"
                strokeDasharray="5 5"
                name="Planned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sensitivity Analysis Chart */}
        <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3>Timeline Scenarios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={forecast.sensitivityScenarios.map(s => ({
                name: s.name,
                date: s.projectedDate,
                probability: s.probability
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Probability (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="probability" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Phases */}
      {alerts.length > 0 && (
        <div style={{ marginTop: "24px", backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: "0" }}>At-Risk Phases</h3>
          {alerts.map(alert => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
};

const HeadlineCard: React.FC<{ forecast: any }> = ({ forecast }) => {
  const lower = new Date(forecast.baseDate);
  lower.setDate(lower.getDate() - Math.floor(forecast.confidenceIntervalDays / 2));
  
  const upper = new Date(forecast.baseDate);
  upper.setDate(upper.getDate() + Math.floor(forecast.confidenceIntervalDays / 2));

  return (
    <div
      style={{
        padding: "32px",
        backgroundColor: "#f0f9ff",
        borderLeft: "4px solid #3b82f6",
        borderRadius: "8px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>
            IPO LAUNCH TIMELINE
          </p>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "36px" }}>
            {new Date(forecast.baseDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </h2>
          <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
            {forecast.confidenceInterval}% Confidence (
            {lower.toLocaleDateString("en-US", { month: "short", day: "numeric" })} to{" "}
            {upper.toLocaleDateString("en-US", { month: "short", day: "numeric" })})
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: forecast.trend === "improving" ? "#10b981" : "#f59e0b"
            }}
          >
            {forecast.trend === "improving" ? "✓" : "⚠"} {forecast.trend.toUpperCase()}
          </p>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            {forecast.trendDays > 0
              ? `${forecast.trendDays} days slip vs last week`
              : `${Math.abs(forecast.trendDays)} days better vs last week`}
          </p>
        </div>
      </div>
    </div>
  );
};

const AlertBanner: React.FC<{ alert: any }> = ({ alert }) => {
  const severityColors = {
    info: "#3b82f6",
    warning: "#f59e0b",
    critical: "#ef4444"
  };

  return (
    <div
      style={{
        marginBottom: "12px",
        padding: "16px",
        backgroundColor: "#f9fafb",
        borderLeft: `4px solid ${severityColors[alert.severity]}`,
        borderRadius: "4px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: "14px",
              fontWeight: "bold",
              color: severityColors[alert.severity]
            }}
          >
            {alert.phase}: {alert.message}
          </p>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            {alert.recommended_action}
          </p>
        </div>
        <button
          onClick={() => acknowledgeAlert(alert.id)}
          style={{
            padding: "4px 8px",
            fontSize: "12px",
            backgroundColor: "transparent",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

async function acknowledgeAlert(alertId: string) {
  await fetch(`/api/timeline/alerts/${alertId}/acknowledge`, {
    method: "POST"
  });
  window.location.reload();
}
```

### 5.2 Page Integration: `/src/app/dashboard/timeline/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TimelineCertaintyDashboard } from "@/components/TimelineCertaintyDashboard";

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { companyId } = await getCompanyForUser(session.user.id);
  if (!companyId) redirect("/wizard");

  return (
    <div>
      <h1>IPO Timeline Certainty</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Data-driven forecast with sensitivity analysis. Updates weekly.
      </p>
      <TimelineCertaintyDashboard companyId={companyId} />
    </div>
  );
}
```

---

## 6. Implementation Checklist

### Phase 1: Database & API (June 9-12)

- [ ] Create migration `025_timeline_prediction_engine.sql`
- [ ] Deploy to Neon
- [ ] Create `TimelinePredictionService` class
- [ ] Implement `/api/timeline/forecast` endpoint
- [ ] Implement `/api/timeline/sensitivity` endpoint
- [ ] Implement `/api/timeline/alerts` endpoint
- [ ] Implement `/api/timeline/velocity-history` endpoint
- [ ] Seed test data: 2 companies with different velocity patterns

### Phase 2: Board Reporting (June 13-15)

- [ ] Implement `/api/timeline/board-report` endpoint
- [ ] Create `TimelineUpdateEmail` template
- [ ] Create Cron job: `weeklyTimelineUpdate` (Mon 8 AM)
- [ ] Test email generation with mock data
- [ ] Test delivery to CEO/CFO roles

### Phase 3: UI & Dashboard (June 16-18)

- [ ] Create `TimelineCertaintyDashboard` component
- [ ] Create Velocity Trend Chart (Recharts)
- [ ] Create Sensitivity Analysis Chart
- [ ] Create Alert Banner component
- [ ] Create `/dashboard/timeline` page
- [ ] Add navigation link in sidebar
- [ ] QA: Test with live data

### Phase 4: Verification & Launch (June 19-20)

- [ ] Run E2E test: Forecast generation for all companies
- [ ] Verify alert generation: at-risk phase detection
- [ ] Verify email: Send test to CEO/CFO
- [ ] Load test: 1000 simultaneous forecast requests
- [ ] Deploy to production
- [ ] CEO demo: Board reporting workflow

---

## 7. Success Metrics

| Metric | Target | Deadline |
|--------|--------|----------|
| Forecast accuracy | ±3 days vs actual (after 3 IPOs) | Sept 2026 |
| Confidence intervals | 80%+ of launches within bands | Sept 2026 |
| Alert detection | Catch 90%+ of phases 5+ days early | Ongoing |
| Email delivery | 99%+ to CEO/CFO | Weekly |
| Dashboard latency | <500ms P99 for forecast load | June 20 |
| Board confidence | "Timeline is credible" (survey) | June 20 |

---

## 8. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Monte Carlo overfitting | Medium | High | Validate on 3+ historical IPOs; adjust variance factors |
| Forecast degrades with data quality | Medium | High | Add data quality checks; flag incomplete task records |
| Velocity changes post-launch | Medium | Medium | Recalculate weekly; track trend decay |
| Board expects 100% accuracy | Low | High | Clearly communicate "confidence interval" not "guarantee" |
| New risks emerge (regulatory) | Low | High | Quarterly sensitivity analysis with new risk factors |

---

## 9. Long-term Roadmap (Phase 2)

1. **Predictive Risk Factors** (Q3 2026)
   - ML model: Predict audit delays based on company attributes
   - Predict legal velocity based on jurisdiction, complexity
   - Surface "hidden risks" before they manifest

2. **Advisor Recommendations** (Q3 2026)
   - "Based on your velocity, consider starting audit 2 weeks earlier"
   - "Your variance is high; consider structured project management"

3. **Stakeholder Dashboards** (Q4 2026)
   - Underwriter view: Timeline + market window + IPO size
   - Investor relations: Messaging timeline ("IPO expected Q3 2026")
   - Board: Governance + timeline integrated dashboard

4. **Parallel Path Optimization** (Q4 2026)
   - Recommend tasks that can run in parallel to compress timeline
   - "You can start audit 2 weeks earlier if you begin legal docs now"
   - Simulate compression scenarios

---

## 10. Code Examples: Integration with Existing PACE™

### 10.1 Timeline Alerts in PACE Dashboard

**Enhance**: `/src/app/dashboard/pace/page.tsx`

```tsx
// Existing PACE dashboard imports...
import { TimelineAlert } from "@/components/TimelineAlert";

export default async function PACEDashboard() {
  // ... existing PACE code ...
  
  // NEW: Add timeline alert banner
  const alerts = await getTimelineAlerts(companyId);
  const timelineAlert = alerts.find(a => a.severity === "critical");
  
  return (
    <div>
      {timelineAlert && (
        <TimelineAlert
          message={timelineAlert.message}
          recommendation={timelineAlert.recommended_action}
          onDismiss={() => acknowledgeAlert(timelineAlert.id)}
        />
      )}
      
      {/* Existing PACE content */}
    </div>
  );
}
```

### 10.2 Timeline Reference in Board Report Email

**Enhance**: `src/lib/email-templates/board-report.tsx`

```tsx
// Add to existing Board Report email

<div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f0f9ff", borderRadius: "8px" }}>
  <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "bold", color: "#1e40af" }}>
    TIMELINE FORECAST
  </p>
  <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold" }}>
    {timelineForecast.baseDate} ± {timelineForecast.confidenceIntervalDays} days
  </p>
  <p style={{ margin: "0", fontSize: "12px", color: "#1e40af" }}>
    {timelineForecast.confidencePct}% confidence. Trend: {timelineForecast.trend}.
    <a href="https://app.ipoready.com/timeline" style={{ marginLeft: "8px", color: "#3b82f6" }}>
      View detailed analysis →
    </a>
  </p>
</div>
```

---

## 11. Deployment & Rollout

### 11.1 Rollout Phases

1. **Phase A** (June 18): Enable for pilot customers (3-5 companies)
   - Collect feedback on forecast accuracy
   - Tune Monte Carlo parameters based on real data
   - Test email delivery at scale

2. **Phase B** (June 25): Enable for all paid customers
   - Announce feature in release notes
   - Add help documentation
   - Monitor alert quality

3. **Phase C** (July 1): Enterprise boards
   - Add stakeholder dashboard views
   - Enable scenario sharing with underwriters
   - Launch advisory feature

### 11.2 Configuration & Tuning

**`src/lib/config/timeline-config.ts`**

```typescript
export const TIMELINE_CONFIG = {
  // Monte Carlo simulation
  SIMULATION_ITERATIONS: 1000,
  VARIANCE_PERCENTILE_LOW: 0.2,
  VARIANCE_PERCENTILE_HIGH: 0.8,
  
  // Confidence intervals
  CONFIDENCE_TARGET: 0.8,  // 80%
  MIN_CONFIDENCE_PCT: 50,
  MAX_CONFIDENCE_PCT: 95,
  
  // Risk adjustments
  AUDIT_DELAY_DAYS: 28,  // Default if audit not started
  LEGAL_DELAY_DAYS: 14,
  REGULATORY_DELAY_DAYS: 7,
  
  // Alert thresholds
  PHASE_BEHIND_THRESHOLD_DAYS: 3,
  VELOCITY_DECLINE_THRESHOLD_PCT: 20,
  
  // Recalculation frequency
  FORECAST_STALE_HOURS: 24,  // Recalc if older than 1 day
  ALERT_CHECK_FREQUENCY_HOURS: 6,
  
  // Reporting
  WEEKLY_REPORT_DAY: 1,  // Monday
  WEEKLY_REPORT_TIME: "08:00"  // 8 AM
};
```

---

## 12. Appendix: Data Structures

### 12.1 TypeScript Interfaces

```typescript
interface IPOTimelineForecast {
  baseDate: Date;
  confidenceIntervalDays: number;  // ±N days
  confidencePct: number;  // 50-95%
  trend: "improving" | "declining" | "stable";
  trendDays: number;  // Days vs previous forecast
  
  velocityMetrics: {
    avgCompletionRate: number;  // tasks/day
    historicalVariancePct: number;  // 10-40%
    recoveryRate: number;  // How fast team catches up after delay
  };
  
  sensitivityScenarios: TimelineSensitivityScenario[];
  atRiskPhases: AtRiskPhase[];
}

interface TimelineSensitivityScenario {
  name: string;  // "Audit delays 4 weeks"
  adjustmentDays: number;
  projectedDate: Date;
  probability: number;  // 0-1
  severity: "optimistic" | "baseline" | "risk";
}

interface AtRiskPhase {
  phase: string;
  daysOffSchedule: number;
  reason: string;
  recommendation: string;
  owner?: string;  // Role/person responsible
  startedAt?: Date;
  estimatedRecovery?: number;  // days to catch up
}

interface TimelineAlert {
  id: string;
  companyId: string;
  type: "phase_behind" | "velocity_declining" | "variance_high";
  severity: "info" | "warning" | "critical";
  phase?: string;
  message: string;
  recommendedAction: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

interface TimelineVelocityRecord {
  recordedDate: Date;
  tasksCompletedThisPeriod: number;
  tasksCompletedCumulative: number;
  forecastedLaunchDateThen: Date;
  forecastedLaunchDateNow: Date;
  launchDateTrendDays: number;  // Positive = slipping
  plannedVelocity: number;  // tasks/day
  actualVelocity: number;  // tasks/day
  variancePct: number;  // Negative = faster than planned
}
```

---

## 13. Summary

The Timeline Certainty Solution transforms opaque IPO estimates into transparent, data-driven forecasts with confidence intervals and sensitivity analysis. By combining critical path analysis, Monte Carlo simulation, and historical velocity data, IPOReady delivers:

1. **Board Confidence**: "Sept 6, ±1 week" is more credible than "Q3 sometime"
2. **Early Risk Detection**: Flag at-risk phases 5+ days before slippage
3. **Strategic Planning**: "If audit delays, launch shifts to Jan 15" scenarios
4. **Weekly Accountability**: CEO gets email every Monday with trend direction
5. **Stakeholder Alignment**: Underwriters, investors, CFO all work from same baseline

**Launch Target**: Friday, June 20, 2026 (Phase 1 MVP)

**Long-term Vision**: ML-powered predictive risk factors + advisor recommendations + enterprise board dashboards by Q4 2026.
