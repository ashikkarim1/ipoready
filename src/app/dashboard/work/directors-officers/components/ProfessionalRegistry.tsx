'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Check, CheckCircle2, Lock, Link2, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RegistrationFormData {
  title: string
  yearsPublicExperience: string
  boardPositions: string
  industries: string[]
  regions: string[]
  rateExpectations: string
  phone: string
  linkedinUrl: string
}

export function ProfessionalRegistry() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<RegistrationFormData>({
    title: '',
    yearsPublicExperience: '',
    boardPositions: '',
    industries: [],
    regions: [],
    rateExpectations: '',
    phone: '',
    linkedinUrl: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [linkedinVerified, setLinkedinVerified] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneVerified || !linkedinVerified) {
      alert('Please verify your phone number and LinkedIn profile')
      return
    }
    setSubmitted(true)
    setTimeout(() => {
      setShowForm(false)
      setSubmitted(false)
      setFormData({
        title: '',
        yearsPublicExperience: '',
        boardPositions: '',
        industries: [],
        regions: [],
        rateExpectations: '',
        phone: '',
        linkedinUrl: '',
      })
    }, 3000)
  }

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry],
    }))
  }

  const handleRegionChange = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }))
  }

  const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Energy', 'Real Estate', 'Consumer', 'Other']
  const regions = ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Other']

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-slate-200 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Professional Registry</CardTitle>
              <CardDescription className="text-slate-300">
                Are you a qualified director, officer, or board member? Register to be discovered by companies seeking your expertise.
              </CardDescription>
            </div>
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {!showForm ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Get discovered by vetted companies</p>
                    <p className="text-sm text-slate-600">Companies use IPOReady to find qualified directors and officers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Control your availability and expectations</p>
                    <p className="text-sm text-slate-600">Set your rate expectations, industries, and geographic preferences</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Verified introductions only</p>
                    <p className="text-sm text-slate-600">All introductions go through IPOReady messaging and vetting</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Verification Required:</span> Phone number verification + LinkedIn validation required for registration
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowForm(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Register as Professional
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-900">Registration submitted successfully!</p>
                  <p className="text-sm text-slate-600">We will review your profile and notify you within 24 hours.</p>
                </motion.div>
              )}

              {!submitted && (
                <>
                  {/* Professional Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Professional Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Independent Director, CFO, Board Member"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  {/* Years of Public Company Experience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Years of Public Company Experience</label>
                    <select
                      value={formData.yearsPublicExperience}
                      onChange={(e) => setFormData({ ...formData, yearsPublicExperience: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="">Select years of experience</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-15">10-15 years</option>
                      <option value="15-20">15-20 years</option>
                      <option value="20+">20+ years</option>
                    </select>
                  </div>

                  {/* Board Positions Held */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Board Positions Held</label>
                    <select
                      value={formData.boardPositions}
                      onChange={(e) => setFormData({ ...formData, boardPositions: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="">Select number of positions</option>
                      <option value="1-2">1-2 positions</option>
                      <option value="3-4">3-4 positions</option>
                      <option value="5+">5+ positions</option>
                    </select>
                  </div>

                  {/* Industries Served */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Industries Served</label>
                    <div className="grid grid-cols-2 gap-3">
                      {industries.map(industry => (
                        <label key={industry} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.industries.includes(industry)}
                            onChange={() => handleIndustryChange(industry)}
                            className="w-4 h-4 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Geographic Availability */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Geographic Availability</label>
                    <div className="grid grid-cols-2 gap-3">
                      {regions.map(region => (
                        <label key={region} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.regions.includes(region)}
                            onChange={() => handleRegionChange(region)}
                            className="w-4 h-4 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{region}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rate Expectations */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Annual Rate Expectations</label>
                    <input
                      type="text"
                      placeholder="e.g., $75K-$100K retainer for director roles"
                      value={formData.rateExpectations}
                      onChange={(e) => setFormData({ ...formData, rateExpectations: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  {/* Phone Verification */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Phone Number (Verification Required)</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="+1 (647) 555-0123"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => setPhoneVerified(!phoneVerified)}
                        variant={phoneVerified ? 'default' : 'outline'}
                        className={phoneVerified ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                      >
                        {phoneVerified ? <Check className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </Button>
                    </div>
                    {phoneVerified && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Phone verified
                      </p>
                    )}
                  </div>

                  {/* LinkedIn Verification */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">LinkedIn Profile (Validation Required)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => setLinkedinVerified(!linkedinVerified)}
                        variant={linkedinVerified ? 'default' : 'outline'}
                        className={linkedinVerified ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                      >
                        {linkedinVerified ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    {linkedinVerified && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> LinkedIn verified
                      </p>
                    )}
                  </div>

                  {/* Agreement */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <p className="text-sm text-slate-700">
                      By registering, you agree that introductions made through IPOReady may result in earning
                      referral commissions. Learn more about our <span className="font-medium">Terms of Service</span>.
                    </p>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                      Submit Registration
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setFormData({
                          title: '',
                          yearsPublicExperience: '',
                          boardPositions: '',
                          industries: [],
                          regions: [],
                          rateExpectations: '',
                          phone: '',
                          linkedinUrl: '',
                        })
                        setPhoneVerified(false)
                        setLinkedinVerified(false)
                      }}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
