import * as React from 'react'

interface PilotWelcomeEmailProps {
  companyName: string
  ceoName: string
  pilotCode: string
  tempPassword: string
  tempEmail: string
  loginUrl: string
}

export const PilotWelcomeEmail: React.FC<PilotWelcomeEmailProps> = ({
  companyName,
  ceoName,
  pilotCode,
  tempPassword,
  tempEmail,
  loginUrl,
}) => (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb', padding: '20px' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ color: '#1e293b', margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
          🚀 Welcome to IPOReady Pilot
        </h1>
        <p style={{ color: '#64748b', margin: '0', fontSize: '14px' }}>
          Exclusive early access to the world's first IPO readiness platform
        </p>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ color: '#1e293b', fontSize: '16px', margin: '0 0 12px 0' }}>
          Hi <strong>{ceoName}</strong>,
        </p>
        <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: '0' }}>
          Congratulations! <strong>{companyName}</strong> has been selected as one of 10 pilot companies for IPOReady. We're thrilled to have you as part of this exclusive cohort testing our next-generation IPO readiness platform.
        </p>
      </div>

      {/* Pilot Code */}
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
        <p style={{ color: '#0c4a6e', fontSize: '12px', textTransform: 'uppercase', margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Your Pilot Access Code
        </p>
        <div style={{ backgroundColor: '#ffffff', border: '2px dashed #0ea5e9', padding: '12px', borderRadius: '6px', textAlign: 'center', fontFamily: 'monospace' }}>
          <p style={{ color: '#0369a1', fontSize: '18px', fontWeight: 'bold', margin: '0', letterSpacing: '2px' }}>
            {pilotCode}
          </p>
        </div>
        <p style={{ color: '#0c4a6e', fontSize: '12px', margin: '8px 0 0 0' }}>
          Use this code to identify your company in pilot communications
        </p>
      </div>

      {/* Login Credentials */}
      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
        <p style={{ color: '#92400e', fontSize: '12px', textTransform: 'uppercase', margin: '0 0 12px 0', fontWeight: 'bold' }}>
          Temporary Login Credentials
        </p>
        <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
          <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 8px 0' }}>
            <strong>Email:</strong> <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '3px' }}>{tempEmail}</code>
          </p>
          <p style={{ color: '#475569', fontSize: '13px', margin: '0' }}>
            <strong>Password:</strong> <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '3px' }}>{tempPassword}</code>
          </p>
        </div>
        <p style={{ color: '#92400e', fontSize: '12px', margin: '0' }}>
          ⚠️ Change your password after first login
        </p>
      </div>

      {/* Login Button */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <a
          href={loginUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Login to IPOReady →
        </a>
      </div>

      {/* What's Included */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          During the Pilot, You'll Have Access To:
        </h3>
        <ul style={{ color: '#475569', fontSize: '14px', margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>IPO Readiness Assessment (PACE™ Score)</li>
          <li>Phase-by-phase task management (8 IPO phases)</li>
          <li>Document library with templates and checklists</li>
          <li>Real-time progress tracking</li>
          <li>Direct feedback channel with our team</li>
          <li>Weekly check-ins and guidance (all pilot companies)</li>
        </ul>
      </div>

      {/* Feedback Emphasis */}
      <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
        <p style={{ color: '#065f46', fontSize: '14px', margin: '0' }}>
          <strong>💬 Your Feedback Matters:</strong> We're building this for you. Please share your thoughts, pain points, and feature requests as you navigate the platform. You'll receive a feedback form after each session.
        </p>
      </div>

      {/* Next Steps */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          Next Steps:
        </h3>
        <ol style={{ color: '#475569', fontSize: '14px', margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Log in to your account above</li>
          <li>Complete your company profile</li>
          <li>Review your 8 IPO phases and current tasks</li>
          <li>Start working through Phase 1 tasks</li>
          <li>Share feedback daily as you use the platform</li>
        </ol>
      </div>

      {/* Support */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
        <p style={{ color: '#475569', fontSize: '14px', margin: '0' }}>
          <strong>Need Help?</strong> Reply to this email or reach out to <a href="mailto:pilot@ipoready.com" style={{ color: '#2563eb', textDecoration: 'none' }}>pilot@ipoready.com</a>. We're here to support you.
        </p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 8px 0' }}>
          You're receiving this because you were selected for the IPOReady pilot program.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0' }}>
          © 2026 IPOReady Inc. All rights reserved.
        </p>
      </div>
    </div>
  </div>
)

export default PilotWelcomeEmail
