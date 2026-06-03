import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Tailwind,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
  companyName: string
  exchange: string
  loginUrl: string
}

export default function WelcomeEmail({ name, companyName, exchange, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to IPOReady — your IPO command centre is ready</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: 'var(--color-bg-primary)', fontFamily: "'Inter', -apple-system, sans-serif", margin: 0, padding: '40px 0' }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto' }}>

            {/* Logo bar */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <table align="center" style={{ margin: '0 auto' }}>
                <tbody><tr>
                  <td style={{ backgroundColor: 'var(--color-text-primary)', borderRadius: '10px', width: '36px', height: '36px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ color: 'var(--color-surface-primary)', fontSize: '18px', lineHeight: '36px' }}>🚀</span>
                  </td>
                  <td style={{ paddingLeft: '10px', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
                      IPO<span style={{ color: 'var(--color-accent)' }}>Ready</span>
                    </span>
                  </td>
                </tr></tbody>
              </table>
            </Section>

            {/* Card */}
            <Section style={{ backgroundColor: 'var(--color-surface-primary)', borderRadius: '16px', border: '1px solid #E5E4E0', padding: '40px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <Heading style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                Welcome aboard, {name} 👋
              </Heading>
              <Text style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                Your IPOReady workspace for <strong style={{ color: 'var(--color-text-primary)' }}>{companyName}</strong> is set up and waiting. You&apos;re on the path to <strong style={{ color: 'var(--color-text-primary)' }}>{exchange}</strong> — let&apos;s get your PACE™ score baseline established.
              </Text>

              {/* PACE callout */}
              <Section style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: '12px', padding: '20px', marginBottom: '28px', border: '1px solid #E5E4E0' }}>
                <Text style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', margin: '0 0 8px 0' }}>
                  Your PACE™ Score
                </Text>
                <table style={{ width: '100%' }}>
                  <tbody><tr>
                    <td>
                      <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1 }}>—</span>
                      <Text style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: '4px 0 0 0' }}>Complete your first tasks to unlock your score</Text>
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      <span style={{ backgroundColor: 'var(--color-error-soft)', color: 'var(--color-accent)', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px' }}>
                        Not yet scored
                      </span>
                    </td>
                  </tr></tbody>
                </table>
              </Section>

              {/* Steps */}
              <Text style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px 0' }}>Your first 3 moves:</Text>
              {[
                ['Complete your company profile', 'Exchange, listing type, target date'],
                ['Start your IPO checklist',       '180+ tasks, organised by workstream'],
                ['Invite your legal & finance team','Assign tasks, track milestones together'],
              ].map(([title, sub], i) => (
                <table key={i} style={{ width: '100%', marginBottom: '10px' }}>
                  <tbody><tr>
                    <td style={{ width: '28px', verticalAlign: 'top' }}>
                      <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-text-primary)', color: 'var(--color-surface-primary)', fontSize: '11px', fontWeight: 700, textAlign: 'center', lineHeight: '22px' }}>{i + 1}</span>
                    </td>
                    <td style={{ paddingLeft: '10px' }}>
                      <Text style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{title}</Text>
                      <Text style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '2px 0 0 0' }}>{sub}</Text>
                    </td>
                  </tr></tbody>
                </table>
              ))}

              <Hr style={{ borderColor: 'var(--color-border)', margin: '28px 0' }} />

              <Button
                href={loginUrl}
                style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-surface-primary)', borderRadius: '100px', fontSize: '14px', fontWeight: 600, padding: '12px 28px', display: 'inline-block', textDecoration: 'none' }}>
                Open my IPOReady dashboard →
              </Button>
            </Section>

            {/* Footer */}
            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text style={{ fontSize: '12px', color: '#B8B7B3', margin: 0, lineHeight: '1.6' }}>
                IPOReady · hello@ipoready.com<br />
                You&apos;re receiving this because you registered at www.ipoready.ai.<br />
                IPOReady is a workflow platform only and does not provide legal, securities or financial advice.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
