'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Award, DollarSign, Users, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ReferralCommissionDashboard() {
  // Mock data for referral commissions
  const referralData = [
    {
      id: 'ref-1',
      referredName: 'Michael Rodriguez',
      referredRole: 'Audit Committee Chair',
      referrerName: 'Sarah Chen',
      referrerRole: 'Lead Independent Director',
      hireDate: '2024-06-15',
      compensationPackage: 95000,
      commissionRate: 0.1, // 10% for referrer commission
      commissionEarned: 9500,
      status: 'completed',
    },
  ]

  const totalEarned = referralData.reduce((sum, ref) => sum + ref.commissionEarned, 0)
  const totalReferrals = referralData.length
  const completedReferrals = referralData.filter(ref => ref.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Referral Commission Program</h2>
        <p className="text-slate-600">
          Earn referral commissions when your board members introduce IPOReady to qualified directors and officers
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Commission Earned</p>
                  <p className="text-3xl font-bold text-slate-900">${totalEarned.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-2">From {completedReferrals} referral{completedReferrals !== 1 ? 's' : ''}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-slate-200 bg-gradient-to-br from-emerald-50 to-slate-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Board Members</p>
                  <p className="text-3xl font-bold text-slate-900">{totalReferrals}</p>
                  <p className="text-xs text-slate-500 mt-2">Referred through IPOReady</p>
                </div>
                <Users className="w-8 h-8 text-emerald-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-slate-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Active Referrals</p>
                  <p className="text-3xl font-bold text-slate-900">{totalReferrals}</p>
                  <p className="text-xs text-slate-500 mt-2">All commission-eligible</p>
                </div>
                <Award className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Program Details */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>How the Referral Commission Works</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Your Board Member Refers Talent</p>
                <p className="text-sm text-slate-600">
                  A director or officer on your board refers a qualified professional to another company through IPOReady.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Hiring Company Makes Offer</p>
                <p className="text-sm text-slate-600">
                  The hiring company makes an offer and the candidate is placed into their board or management.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Commission Confirmed</p>
                <p className="text-sm text-slate-600">
                  Both parties confirm the hire in the IPOReady platform. IPOReady invoices the hiring company for finders fee.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">10% Referral Commission Paid</p>
                <p className="text-sm text-slate-600">
                  Your board member earns <span className="font-semibold">10% of the IPOReady finders fee</span> as a referral commission.
                  You can claim this as a company credit or bonus distribution.
                </p>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <p className="font-semibold text-slate-900">Example Commission Calculation</p>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Hired Director's Annual Comp:</span>
                <span className="font-medium">$80,000</span>
              </div>
              <div className="flex justify-between">
                <span>IPOReady Finders Fee (15%):</span>
                <span className="font-medium">$12,000</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span>Your Referral Commission (10% of FF):</span>
                <span className="font-medium text-emerald-600">$1,200</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      {referralData.length > 0 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Referral Commission History</CardTitle>
            <CardDescription>Track commissions earned from board member referrals</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {referralData.map((referral, idx) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 border border-slate-200 rounded-lg space-y-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{referral.referredName}</h4>
                      <p className="text-sm text-slate-600 mb-2">{referral.referredRole}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-slate-600">Referred by:</span>
                        <span className="text-sm text-slate-900">{referral.referrerName}</span>
                        <span className="text-xs text-slate-500">({referral.referrerRole})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">${referral.commissionEarned.toLocaleString()}</p>
                      <p className="text-xs text-slate-600">Commission earned</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Hire Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(referral.hireDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">Annual Compensation</p>
                      <p className="text-sm font-medium text-slate-900">${referral.compensationPackage.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">Status</p>
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full w-fit">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Completed</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-slate-900 mb-2">Who can earn referral commissions?</p>
            <p className="text-sm text-slate-700">
              Any board member, director, or officer on your team can refer qualified professionals to other companies
              through IPOReady and earn referral commissions.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900 mb-2">How often are commissions paid?</p>
            <p className="text-sm text-slate-700">
              Commissions are calculated and paid monthly after confirmation of hire. Both parties must confirm employment
              in the IPOReady platform within 7 days of start date.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900 mb-2">Can I request the referral commission be credited to board comp?</p>
            <p className="text-sm text-slate-700">
              Yes. You can request that referral commissions be deducted from annual board compensation rather than paid
              separately. Contact support@ipoready.com to arrange this.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900 mb-2">What if the hire doesn't work out?</p>
            <p className="text-sm text-slate-700">
              Referral commissions are paid after 30 days of confirmed employment. If the position is terminated within 30
              days, the hiring company can request a refund of the finders fee (and your referral commission is forfeited).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
