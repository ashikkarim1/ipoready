import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Tailwind,
} from '@react-email/components'

interface PlanUpgradeEmailProps {
  name: string
  companyName: string
  oldPlan: string
  newPlan: string
  billingCycle: string
  amount: string
  nextBillingDate: string
  manageUrl: string
}

export default function PlanUpgradeEmail({
  name,
  companyName,
  oldPlan,
  newPlan,
  billingCycle,
  amount,
  nextBillingDate,
  manageUrl,
}: PlanUpgradeEmailProps) {
  const isUpgrade = ['growth', 'enterprise'].includes(newPlan.toLowerCase())
  const subject = isUpgrade
    ? `You're now on IPOReady ${newPlan} — welcome to the next level`
    : `Your IPOReady plan has been updated to ${newPlan}`

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#F7F6F4', fontFamily: "'Inter', -apple-system, sans-serif", margin: 0, padding: '40px 0' }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto' }}>

            {/* Logo */}
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
                {isUpgrade ? `Plan upgraded to ${newPlan} 🎉` : `Plan changed to ${newPlan}`}
              </Heading>
              <Text style={{ fontSize: '15px', color: '#717171', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                Hi {name}, your IPOReady plan for <strong style={{ color: '#1A1A1A' }}>{companyName}</strong> has been updated.
              </Text>

              {/* Plan change summary */}
              <Section style={{ backgroundColor: '#F7F6F4', borderRadius: '12px', padding: '20px', marginBottom: '28px', border: '1px solid #E5E4E0' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: '10px' }}>
                        <Text style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A9A9A', margin: 0 }}>Previous Plan</Text>
                        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#9A9A9A', margin: '4px 0 0 0', textDecoration: 'line-through' }}>{oldPlan}</Text>
                      </td>
                      <td style={{ textAlign: 'center', paddingBottom: '10px' }}>
                        <Text style={{ fontSize: '20px', margin: 0 }}>→</Text>
                      </td>
                      <td style={{ paddingBottom: '10px', textAlign: 'right' }}>
                        <Text style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A9A9A', margin: 0 }}>New Plan</Text>
                        <Text style={{ fontSize: '16px', fontWeight: 700, color: '#E8312A', margin: '4px 0 0 0' }}>{newPlan}</Text>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ paddingTop: '10px', borderTop: '1px solid #E5E4E0' }}>
                        <table style={{ width: '100%' }}>
                          <tbody>
                            <tr>
                              <td><Text style={{ fontSize: '13px', color: '#717171', margin: 0 }}>Billing cycle</Text></td>
                              <td style={{ textAlign: 'right' }}><Text style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{billingCycle}</Text></td>
                            </tr>
                            <tr>
                              <td><Text style={{ fontSize: '13px', color: '#717171', margin: '6px 0 0 0' }}>Amount</Text></td>
                              <td style={{ textAlign: 'right' }}><Text style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: '6px 0 0 0' }}>{amount}</Text></td>
                            </tr>
                            <tr>
                              <td><Text style={{ fontSize: '13px', color: '#717171', margin: '6px 0 0 0' }}>Next billing</Text></td>
                              <td style={{ textAlign: 'right' }}><Text style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: '6px 0 0 0' }}>{nextBillingDate}</Text></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>

              <Text style={{ fontSize: '13px', color: '#9A9A9A', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                Taxes and fees are calculated based on your billing address and may appear as a separate line item on your invoice.
                As a UAE-registered entity, IPOReady complies with applicable digital services tax regulations for Canadian and US customers.
              </Text>

              <Hr style={{ borderColor: '#E5E4E0', margin: '0 0 28px 0' }} />

              <Button
                href={manageUrl}
                style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', borderRadius: '100px', fontSize: '14px', fontWeight: 600, padding: '12px 28px', display: 'inline-block', textDecoration: 'none' }}>
                Manage billing →
              </Button>
            </Section>

            {/* Footer */}
            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text style={{ fontSize: '12px', color: '#B8B7B3', margin: 0, lineHeight: '1.6' }}>
                IPOReady · hello@ipoready.com<br />
                IPOReady is a workflow platform only and does not provide legal, securities or financial advice.<br />
                © {new Date().getFullYear()} The UpCapital Group. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
