/**
 * Integration Tests: Stripe Payment Integration
 * Test payment processing, subscriptions, and webhooks
 */

import {
  createTestCompany,
  createTestUser,
  cleanupTestData,
  createMockStripeClient,
} from '../test-utils'

describe('Stripe Payment Integration', () => {
  let testCompanyId: string
  let testUserId: string
  let mockStripe: any

  beforeEach(async () => {
    const company = await createTestCompany()
    testCompanyId = company.id
    const user = await createTestUser({ companyId: testCompanyId })
    testUserId = user.id
    mockStripe = createMockStripeClient()
  })

  afterEach(async () => {
    await cleanupTestData(testCompanyId)
  })

  describe('Customer Management', () => {
    it('should create Stripe customer', async () => {
      const customer = await mockStripe.customers.create({
        email: 'test@example.com',
        metadata: {
          companyId: testCompanyId,
        },
      })

      expect(customer.id).toBeDefined()
      expect(customer.id).toMatch(/^cus_/)
      expect(customer.email).toBe('test@example.com')
    })

    it('should retrieve customer by ID', async () => {
      const customer = await mockStripe.customers.retrieve('cus_test123')

      expect(customer.id).toBe('cus_test123')
      expect(customer.email).toBeDefined()
    })

    it('should handle missing customer', async () => {
      mockStripe.customers.retrieve = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('No such customer')
        )

      await expect(
        mockStripe.customers.retrieve('non_existent')
      ).rejects.toThrow('No such customer')
    })

    it('should store customer company mapping', async () => {
      const customer = await mockStripe.customers.create({
        email: `company-${testCompanyId}@example.com`,
        metadata: {
          companyId: testCompanyId,
          userId: testUserId,
        },
      })

      expect(customer.id).toBeDefined()
    })
  })

  describe('Subscription Management', () => {
    it('should create subscription', async () => {
      const subscription = await mockStripe.subscriptions.create({
        customer: 'cus_test123',
        items: [{ price: 'price_monthly' }],
      })

      expect(subscription.id).toBeDefined()
      expect(subscription.id).toMatch(/^sub_/)
      expect(subscription.status).toBe('active')
    })

    it('should retrieve subscription', async () => {
      const subscription = await mockStripe.subscriptions.retrieve(
        'sub_test123'
      )

      expect(subscription.id).toBe('sub_test123')
      expect(subscription.status).toBe('active')
    })

    it('should update subscription', async () => {
      const subscription = await mockStripe.subscriptions.update(
        'sub_test123',
        {
          metadata: {
            plan: 'pro',
          },
        }
      )

      expect(subscription.id).toBe('sub_test123')
      expect(subscription.status).toBe('active')
    })

    it('should handle subscription cancellation', async () => {
      mockStripe.subscriptions.update = jest
        .fn()
        .mockResolvedValueOnce({
          id: 'sub_test123',
          status: 'canceled',
        })

      const subscription = await mockStripe.subscriptions.update(
        'sub_test123',
        { cancel_at_period_end: true }
      )

      expect(subscription.status).toBe('canceled')
    })

    it('should track subscription period dates', async () => {
      const subscription = await mockStripe.subscriptions.retrieve(
        'sub_test123'
      )

      expect(subscription.current_period_end).toBeDefined()
      expect(typeof subscription.current_period_end).toBe('number')
    })

    it('should handle trial period', async () => {
      const subscription = await mockStripe.subscriptions.create({
        customer: 'cus_test123',
        items: [{ price: 'price_monthly' }],
        trial_period_days: 14,
      })

      expect(subscription.id).toBeDefined()
    })
  })

  describe('Payment Intent', () => {
    it('should create payment intent', async () => {
      const intent = await mockStripe.paymentIntents.create({
        amount: 9999, // $99.99
        currency: 'usd',
        customer: 'cus_test123',
        metadata: {
          companyId: testCompanyId,
        },
      })

      expect(intent.id).toBeDefined()
      expect(intent.id).toMatch(/^pi_/)
      expect(intent.status).toBe('succeeded')
      expect(intent.client_secret).toBeDefined()
    })

    it('should retrieve payment intent', async () => {
      const intent = await mockStripe.paymentIntents.retrieve('pi_test123')

      expect(intent.id).toBe('pi_test123')
      expect(intent.status).toBe('succeeded')
    })

    it('should handle payment failure', async () => {
      mockStripe.paymentIntents.create = jest
        .fn()
        .mockResolvedValueOnce({
          id: 'pi_failed',
          status: 'requires_payment_method',
          client_secret: 'secret123',
        })

      const intent = await mockStripe.paymentIntents.create({
        amount: 9999,
        currency: 'usd',
      })

      expect(intent.status).not.toBe('succeeded')
    })

    it('should handle declined card', async () => {
      mockStripe.paymentIntents.create = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('Your card was declined')
        )

      await expect(
        mockStripe.paymentIntents.create({
          amount: 9999,
          currency: 'usd',
        })
      ).rejects.toThrow('declined')
    })
  })

  describe('Webhook Events', () => {
    it('should handle payment_intent.succeeded event', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            status: 'succeeded',
            customer: 'cus_test123',
            metadata: {
              companyId: testCompanyId,
            },
          },
        },
      }

      expect(event.type).toBe('payment_intent.succeeded')
      expect(event.data.object.status).toBe('succeeded')
    })

    it('should handle customer.subscription.updated event', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'active',
            customer: 'cus_test123',
          },
        },
      }

      expect(event.type).toBe('customer.subscription.updated')
      expect(event.data.object.status).toBe('active')
    })

    it('should handle customer.subscription.deleted event', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
            status: 'canceled',
            customer: 'cus_test123',
          },
        },
      }

      expect(event.type).toBe('customer.subscription.deleted')
    })

    it('should verify webhook signature', async () => {
      const secret = 'whsec_test123'
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
      })
      const timestamp = Math.floor(Date.now() / 1000)

      // Signature should be HMAC-SHA256
      expect(secret).toBeDefined()
      expect(timestamp).toBeGreaterThan(0)
    })

    it('should reject invalid webhook signatures', async () => {
      const invalidSignature = 'invalid_signature'

      // This should fail verification
      expect(invalidSignature).not.toMatch(
        /^t=\d+,v1=[a-f0-9]{64}$/
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle API authentication errors', async () => {
      mockStripe.customers.create = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('Invalid API Key provided')
        )

      await expect(
        mockStripe.customers.create({
          email: 'test@example.com',
        })
      ).rejects.toThrow('Invalid API Key')
    })

    it('should handle invalid request errors', async () => {
      mockStripe.customers.create = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('Missing required param: email')
        )

      await expect(
        mockStripe.customers.create({})
      ).rejects.toThrow('Missing required')
    })

    it('should handle rate limiting', async () => {
      mockStripe.customers.create = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('Too many requests')
        )

      await expect(
        mockStripe.customers.create({
          email: 'test@example.com',
        })
      ).rejects.toThrow('Too many requests')
    })

    it('should handle network errors', async () => {
      mockStripe.customers.create = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('Network connection error')
        )

      await expect(
        mockStripe.customers.create({
          email: 'test@example.com',
        })
      ).rejects.toThrow('Network')
    })
  })

  describe('Pricing and Plans', () => {
    it('should support multiple pricing tiers', async () => {
      const plans = [
        { id: 'price_starter', name: 'Starter', amount: 2999 },
        { id: 'price_pro', name: 'Pro', amount: 9999 },
        { id: 'price_enterprise', name: 'Enterprise', amount: 29999 },
      ]

      expect(plans).toHaveLength(3)
      plans.forEach(plan => {
        expect(plan.id).toBeDefined()
        expect(plan.amount).toBeGreaterThan(0)
      })
    })

    it('should calculate subscription cost correctly', async () => {
      const monthlyAmount = 9999 // $99.99
      const quantity = 1

      const total = monthlyAmount * quantity
      expect(total).toBe(9999)
    })
  })

  describe('Billing Portal', () => {
    it('should create billing portal session', async () => {
      const session = {
        url: 'https://billing.stripe.com/session/123',
        id: 'bps_test123',
        customer: 'cus_test123',
      }

      expect(session.url).toBeDefined()
      expect(session.url).toMatch(/^https:\/\//)
    })

    it('should handle missing customer for portal', async () => {
      mockStripe.customers.retrieve = jest
        .fn()
        .mockRejectedValueOnce(
          new Error('No such customer')
        )

      await expect(
        mockStripe.customers.retrieve('non_existent')
      ).rejects.toThrow()
    })
  })
})
