'use client'

import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { TrialCountdownBanner } from '@/components/TrialCountdownBanner'
import { useState } from 'react'

export default function TrialPage({ companyId }: { companyId: string }) {
  const router = useRouter()
  const subscription = useSubscription()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const faqItems = [
    {
      id: '1',
      question: 'What happens when my trial expires?',
      answer:
        'Your trial will automatically convert to a paid subscription if you have a payment method on file. If not, your access will be suspended and you can upgrade to a paid plan anytime to restore access.',
    },
    {
      id: '2',
      question: 'Can I cancel my trial?',
      answer:
        'Yes, you can cancel your trial anytime. Just go to your account settings and click "Cancel Trial". You can always restart your trial later if needed.',
    },
    {
      id: '3',
      question: 'Do I get a discount if I upgrade during my trial?',
      answer:
        'Yes! Upgrade during your trial and get your first month at 50% off. This offer is valid only for trial users.',
    },
    {
      id: '4',
      question: 'Is my data safe during the trial?',
      answer:
        'Absolutely. All your data is securely stored and fully accessible. Your data will be preserved even if you cancel your trial or your trial expires.',
    },
  ]

  const handleUpgradeClick = (plan: string) => {
    router.push(`/checkout?plan=${plan}`)
  }

  const handleContactClick = () => {
    // Open email or support widget
    window.location.href = 'mailto:support@ipoready.ai'
  }

  if (subscription.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with countdown banner */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your IPOReady Trial</h1>
        <TrialCountdownBanner companyId={companyId} />
      </div>

      {/* What's Included */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Included in Your Trial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '📊', name: 'PACE Readiness Tracking', desc: 'Comprehensive IPO readiness assessment' },
            { icon: '📄', name: 'Prospectus Builder', desc: 'AI-powered document generation' },
            { icon: '📋', name: 'Document Management', desc: 'Organize and link all your IPO documents' },
            { icon: '⚡', name: 'Sequencing Alerts', desc: 'Stay on track with workflow guidance' },
            { icon: '📈', name: 'Benchmarking', desc: 'Compare your progress with peers' },
            { icon: '💬', name: 'Email Support', desc: 'Get help from our support team' },
          ].map((feature) => (
            <div key={feature.name} className="rounded-lg border border-gray-200 p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Growth',
              price: 799,
              desc: 'For scaling companies',
              cta: 'Upgrade Now',
            },
            {
              name: 'Enterprise',
              price: 1999,
              desc: 'For enterprises',
              cta: 'Contact Sales',
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.name === 'Growth'
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-300'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <button
                onClick={() =>
                  plan.name === 'Enterprise'
                    ? handleContactClick()
                    : handleUpgradeClick(plan.name.toLowerCase())
                }
                className={`w-full py-2 rounded-md font-medium transition-colors ${
                  plan.name === 'Growth'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 overflow-hidden bg-white"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === item.id ? null : item.id)
                }
                className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                {item.question}
                <span
                  className="text-lg transition-transform"
                  style={{
                    transform: expandedFaq === item.id ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                >
                  ▼
                </span>
              </button>
              {expandedFaq === item.id && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 mb-4">
          Our support team is here to help you get the most out of your trial.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleContactClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Email Support
          </button>
          <a
            href="tel:+1-416-555-0123"
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md font-medium hover:bg-blue-100 transition-colors"
          >
            Call Us
          </a>
        </div>
      </div>
    </div>
  )
}
