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
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="card overflow-hidden card-hover" style={{ border: '1px solid #E5E4E0' }}>
        <div style={{ background: '#1A1A1A', color: '#FFFFFF', padding: '1.5rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Professional Registry</h2>
              <p className="text-sm text-text-muted">
                Are you a qualified director, officer, or board member? Register to be discovered by companies seeking your expertise.
              </p>
            </div>
            <Lock className="w-8 h-8 opacity-60 flex-shrink-0" />
          </div>
        </div>

        <div className="p-6">
          {!showForm ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-nav">Get discovered by vetted companies</p>
                    <p className="text-sm text-text-muted">Companies use IPOReady to find qualified directors and officers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-nav">Control your availability and expectations</p>
                    <p className="text-sm text-text-muted">Set your rate expectations, industries, and geographic preferences</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-nav">Verified introductions only</p>
                    <p className="text-sm text-text-muted">All introductions go through IPOReady messaging and vetting</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-nav">
                    <span className="font-semibold">Verification Required:</span> Phone number verification + LinkedIn validation required for registration
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowForm(true)} className="btn btn-accent gap-2 font-semibold px-6 py-2.5 rounded-full w-full">
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
                  className="p-4 rounded-lg text-center"
                  style={{ background: '#EAF5F0', border: '1px solid #D5EDE8' }}
                >
                  <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-semibold text-nav">Registration submitted successfully!</p>
                  <p className="text-sm text-text-muted">We will review your profile and notify you within 24 hours.</p>
                </motion.div>
              )}

              {!submitted && (
                <>
                  {/* Professional Title */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Professional Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Independent Director, CFO, Board Member"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-nav"
                      style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                      required
                    />
                  </div>

                  {/* Years of Public Company Experience */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Years of Public Company Experience</label>
                    <select
                      value={formData.yearsPublicExperience}
                      onChange={(e) => setFormData({ ...formData, yearsPublicExperience: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-nav text-nav"
                      style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
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
                    <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Board Positions Held</label>
                    <select
                      value={formData.boardPositions}
                      onChange={(e) => setFormData({ ...formData, boardPositions: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-nav text-nav"
                      style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
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
                    <label className="block text-xs font-semibold mb-3 text-nav uppercase tracking-widest">Industries Served</label>
                    <div className="grid grid-cols-2 gap-3">
                      {industries.map(industry => (
                        <label key={industry} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.industries.includes(industry)}
                            onChange={() => handleIndustryChange(industry)}
                            className="w-4 h-4 rounded focus:ring-offset-0"
                            style={{ borderColor: '#E5E4E0', accentColor: '#E8312A' }}
                          />
                          <span className="text-sm text-nav">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Geographic Availability */}
                  <div>
                    <label className="block text-xs font-semibold mb-3 text-nav uppercase tracking-widest">Geographic Availability</label>
                    <div className="grid grid-cols-2 gap-3">
                      {regions.map(region => (
                        <label key={region} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.regions.includes(region)}
                            onChange={() => handleRegionChange(region)}
                            className="w-4 h-4 rounded focus:ring-offset-0"
                            style={{ borderColor: '#E5E4E0', accentColor: '#E8312A' }}
                          />
                          <span className="text-sm text-nav">{region}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rate Expectations */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Annual Rate Expectations</label>
                    <input
                      type="text"
                      placeholder="e.g., $75K-$100K retainer for director roles"
                      value={formData.rateExpectations}
                      onChange={(e) => setFormData({ ...formData, rateExpectations: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-nav"
                      style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                      required
                    />
                  </div>

                  {/* Phone Verification */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-nav uppercase tracking-widest">Phone Number (Verification Required)</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="+1 (647) 555-0123"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-nav"
                        style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => setPhoneVerified(!phoneVerified)}
                        className={phoneVerified ? 'btn btn-accent' : 'btn btn-secondary'}
                      >
                        {phoneVerified ? <Check className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </Button>
                    </div>
                    {phoneVerified && (
                      <p className="text-xs text-success flex items-center gap-1">
                        <Check className="w-3 h-3" /> Phone verified
                      </p>
                    )}
                  </div>

                  {/* LinkedIn Verification */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-nav uppercase tracking-widest">LinkedIn Profile (Validation Required)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-nav"
                        style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => setLinkedinVerified(!linkedinVerified)}
                        className={linkedinVerified ? 'btn btn-accent' : 'btn btn-secondary'}
                      >
                        {linkedinVerified ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    {linkedinVerified && (
                      <p className="text-xs text-success flex items-center gap-1">
                        <Check className="w-3 h-3" /> LinkedIn verified
                      </p>
                    )}
                  </div>

                  {/* Agreement */}
                  <div className="p-4 rounded-lg" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                    <p className="text-sm text-nav">
                      By registering, you agree that introductions made through IPOReady may result in earning
                      referral commissions. Learn more about our <span className="font-semibold">Terms of Service</span>.
                    </p>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <Button type="submit" className="btn btn-accent flex-1 gap-2 font-semibold px-6 py-2.5 rounded-full">
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
                      className="btn btn-secondary flex-1 gap-2 font-semibold px-6 py-2.5 rounded-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}
