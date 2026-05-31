import * as React from 'react'

interface WeeklySummaryProps {
  week: string
  totalCompanies: number
  totalFeedback: number
  averageRating: number
  positiveRatio: number
  frictionPoints: Array<{
    point: string
    mentions: number
    severity: 'critical' | 'high' | 'medium' | 'low'
  }>
  topPages: Array<{
    page: string
    feedbackCount: number
    averageRating: number
  }>
  engagementMetrics: {
    companiesActive: number
    avgTasksCompleted: number
    totalDocsUploaded: number
  }
}

const severityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#dc2626'
    case 'high':
      return '#f59e0b'
    case 'medium':
      return '#eab308'
    case 'low':
      return '#10b981'
    default:
      return '#6b7280'
  }
}

const severityBgColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#fee2e2'
    case 'high':
      return '#fef3c7'
    case 'medium':
      return '#fef08a'
    case 'low':
      return '#ecfdf5'
    default:
      return '#f3f4f6'
  }
}

export const PilotWeeklySummaryEmail: React.FC<WeeklySummaryProps> = ({
  week,
  totalCompanies,
  totalFeedback,
  averageRating,
  positiveRatio,
  frictionPoints,
  topPages,
  engagementMetrics,
}) => (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb', padding: '20px' }}>
    <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#2563eb', padding: '32px 24px', color: '#ffffff' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          📊 IPOReady Pilot Weekly Summary
        </h1>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
          Week of {week}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 24px' }}>
        {/* Key Metrics */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Key Metrics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Metric Card 1 */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px', padding: '16px' }}>
              <p style={{ color: '#0c4a6e', fontSize: '12px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                Total Companies
              </p>
              <p style={{ color: '#0369a1', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {totalCompanies}
              </p>
            </div>
            {/* Metric Card 2 */}
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', padding: '16px' }}>
              <p style={{ color: '#92400e', fontSize: '12px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                Total Feedback
              </p>
              <p style={{ color: '#b45309', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {totalFeedback}
              </p>
            </div>
            {/* Metric Card 3 */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '6px', padding: '16px' }}>
              <p style={{ color: '#065f46', fontSize: '12px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                Avg Rating
              </p>
              <p style={{ color: '#047857', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {averageRating.toFixed(2)}/5.0
              </p>
            </div>
            {/* Metric Card 4 */}
            <div style={{ backgroundColor: '#fce7f3', border: '1px solid #ec4899', borderRadius: '6px', padding: '16px' }}>
              <p style={{ color: '#831843', fontSize: '12px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                Positive Ratio
              </p>
              <p style={{ color: '#be185d', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {(positiveRatio * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div style={{ marginBottom: '32px', backgroundColor: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ color: '#1e293b', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
            Engagement This Week
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
                <strong>{engagementMetrics.companiesActive}</strong> companies active
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
                <strong>{engagementMetrics.avgTasksCompleted}</strong> avg tasks/company
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
                <strong>{engagementMetrics.totalDocsUploaded}</strong> documents uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Top Friction Points */}
        {frictionPoints.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              🚨 Top Friction Points (Requires Action)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {frictionPoints.slice(0, 5).map((point, idx) => (
                <div key={idx} style={{ backgroundColor: severityBgColor(point.severity), border: `1px solid ${severityColor(point.severity)}`, borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500', margin: '0 0 4px 0' }}>
                        {point.point}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
                        {point.mentions} mention{point.mentions !== 1 ? 's' : ''} from pilots
                      </p>
                    </div>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: severityColor(point.severity),
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginLeft: '8px',
                      whiteSpace: 'nowrap',
                    }}>
                      {point.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Pages */}
        {topPages.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              Most Visited Pages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topPages.map((page, idx) => (
                <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500', margin: '0' }}>
                      {page.page}
                    </p>
                    <span style={{ color: '#64748b', fontSize: '13px', margin: '0' }}>
                      {page.feedbackCount} feedback · {page.averageRating.toFixed(1)}⭐
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ color: '#065f46', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
            ✅ Action Items for This Week
          </h3>
          <ul style={{ color: '#047857', fontSize: '13px', margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Address top {Math.min(3, frictionPoints.length)} friction points in the next release</li>
            <li>Schedule 1-on-1 check-ins with any companies showing low engagement (&lt;2 tasks/week)</li>
            <li>Review feedback comments for qualitative insights not captured in ratings</li>
            <li>Update roadmap based on pilot company priorities</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px 24px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>
          IPOReady Pilot Program • Weekly Analytics Report
        </p>
      </div>
    </div>
  </div>
)

export default PilotWeeklySummaryEmail
