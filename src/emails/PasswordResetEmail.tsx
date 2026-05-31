import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Tailwind,
} from '@react-email/components'

interface PasswordResetEmailProps {
  name: string
  resetUrl: string
  expiresInMinutes?: number
}

export default function PasswordResetEmail({ name, resetUrl, expiresInMinutes = 60 }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Reset your IPOReady password — link expires in ${expiresInMinutes} minutes`}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#F7F6F4', fontFamily: "'Inter', -apple-system, sans-serif", margin: 0, padding: '40px 0' }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto' }}>

            {/* Logo bar */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <table align="center" style={{ margin: '0 auto' }}>
                <tbody><tr>
                  <td style={{ backgroundColor: '#1A1A1A', borderRadius: '10px', width: '36px', height: '36px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '18px', lineHeight: '36px' }}>🚀</span>
                  </td>
                  <td style={{ paddingLeft: '10px', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
                      IPO<span style={{ color: '#E8312A' }}>Ready</span>
                    </span>
                  </td>
                </tr></tbody>
              </table>
            </Section>

            {/* Card */}
            <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E4E0', padding: '40px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <Heading style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                Reset your password
              </Heading>
              <Text style={{ fontSize: '15px', color: '#717171', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                Hi {name}, we received a request to reset the password for your IPOReady account. Click the button below to choose a new one.
              </Text>

              <Button
                href={resetUrl}
                style={{ backgroundColor: '#E8312A', color: '#FFFFFF', borderRadius: '100px', fontSize: '14px', fontWeight: 600, padding: '13px 32px', display: 'inline-block', textDecoration: 'none' }}>
                Reset my password →
              </Button>

              <Hr style={{ borderColor: '#E5E4E0', margin: '28px 0' }} />

              {/* Security note */}
              <Section style={{ backgroundColor: '#FEF3C7', borderRadius: '10px', padding: '16px', border: '1px solid #FDE68A' }}>
                <Text style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: '1.5' }}>
                  <strong>This link expires in {expiresInMinutes} minutes.</strong> If you didn&apos;t request a password reset, you can safely ignore this email — your account is secure.
                </Text>
              </Section>

              <Text style={{ fontSize: '12px', color: '#B8B7B3', margin: '20px 0 0 0', lineHeight: '1.6' }}>
                If the button above doesn&apos;t work, copy and paste this link into your browser:<br />
                <span style={{ color: '#1A1A1A', wordBreak: 'break-all' }}>{resetUrl}</span>
              </Text>
            </Section>

            {/* Footer */}
            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text style={{ fontSize: '12px', color: '#B8B7B3', margin: 0, lineHeight: '1.6' }}>
                IPOReady · hello@ipoready.com<br />
                If you didn&apos;t request this, please ignore. Your password has not been changed.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
