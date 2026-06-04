'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Link2, Award, Briefcase, MapPin, BookOpen, ArrowRight, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Gap {
  id: string
  type: 'critical' | 'warning'
  role: string
  requirement: string
  description: string
  marketCompMin: number
  marketCompMax: number
  equityMin: number
  equityMax: number
}

interface TalentMarketplaceProps {
  gaps: Gap[]
  selectedExchange: string
  onProfessionalSelected?: (professional: Professional) => void
}

interface Professional {
  id: string
  name: string
  title: string
  currentRole?: string
  yearsExperience: number
  boardPositions: number
  linkedinVerified: boolean
  linkedinUrl: string
  industryFocus: string[]
  location: string
  matchScore?: number
  typicalComp: {
    min: number
    max: number
  }
  equity: {
    min: number
    max: number
  }
  recommendationReason?: string
  featured?: boolean
}

const mockProfessionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'Sarah Chen',
    title: 'Independent Director',
    currentRole: 'Board Member at TechVenture Inc.',
    yearsExperience: 18,
    boardPositions: 5,
    linkedinVerified: true,
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    industryFocus: ['Technology', 'SaaS', 'FinTech'],
    location: 'Toronto, ON',
    matchScore: 94,
    typicalComp: { min: 75000, max: 95000 },
    equity: { min: 0.3, max: 0.5 },
    recommendationReason: 'Perfect match: 18 years public board experience, audit committee expert',
    featured: true,
  },
  {
    id: 'prof-2',
    name: 'David Thompson',
    title: 'Audit Committee Chair',
    currentRole: 'Former CFO at BioTech Solutions',
    yearsExperience: 22,
    boardPositions: 4,
    linkedinVerified: true,
    linkedinUrl: 'https://linkedin.com/in/dthompson',
    industryFocus: ['Healthcare', 'Biotech', 'Pharma'],
    location: 'Vancouver, BC',
    matchScore: 91,
    typicalComp: { min: 85000, max: 115000 },
    equity: { min: 0.4, max: 0.6 },
    recommendationReason: 'CPA with SOX experience and financial expertise requirement',
    featured: true,
  },
  {
    id: 'prof-3',
    name: 'Jennifer Wong',
    title: 'Independent Director',
    currentRole: 'VP Finance at Growth Capital Ltd.',
    yearsExperience: 16,
    boardPositions: 3,
    linkedinVerified: true,
    linkedinUrl: 'https://linkedin.com/in/jwong',
    industryFocus: ['Finance', 'Investment', 'Real Estate'],
    location: 'Calgary, AB',
    matchScore: 87,
    typicalComp: { min: 70000, max: 90000 },
    equity: { min: 0.25, max: 0.4 },
    recommendationReason: 'Strong financial background with investment board experience',
  },
  {
    id: 'prof-4',
    name: 'Michael Rodriguez',
    title: 'Chief Financial Officer',
    currentRole: 'Interim CFO at RetailTech Corp',
    yearsExperience: 20,
    boardPositions: 2,
    linkedinVerified: true,
    linkedinUrl: 'https://linkedin.com/in/mrodriguez',
    industryFocus: ['Retail', 'E-commerce', 'Technology'],
    location: 'Montreal, QC',
    matchScore: 89,
    typicalComp: { min: 380000, max: 480000 },
    equity: { min: 2.0, max: 3.0 },
    recommendationReason: 'Public company CFO experience with IPO transition background',
  },
  {
    id: 'prof-5',
    name: 'Lisa Patel',
    title: 'Independent Director',
    currentRole: 'Consultant, Corporate Governance',
    yearsExperience: 19,
    boardPositions: 6,
    linkedinVerified: true,
    linkedinUrl: 'https://linkedin.com/in/lisapatel',
    industryFocus: ['Technology', 'Software', 'Cloud'],
    location: 'Toronto, ON',
    matchScore: 85,
    typicalComp: { min: 65000, max: 85000 },
    equity: { min: 0.25, max: 0.45 },
    recommendationReason: 'Extensive board experience, specialized in tech sector governance',
  },
]

export function TalentMarketplace({
  gaps,
  selectedExchange,
  onProfessionalSelected,
}: TalentMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'match' | 'experience'>('match')

  // Filter professionals
  const filteredProfessionals = mockProfessionals
    .filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.currentRole?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = !selectedRole || p.title.toLowerCase().includes(selectedRole.toLowerCase())
      const matchesIndustry = !selectedIndustry || p.industryFocus.some(i => i.toLowerCase().includes(selectedIndustry.toLowerCase()))
      const matchesRegion = !selectedRegion || p.location.includes(selectedRegion)

      return matchesSearch && matchesRole && matchesIndustry && matchesRegion
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return (b.matchScore || 0) - (a.matchScore || 0)
      }
      return b.yearsExperience - a.yearsExperience
    })

  const uniqueRoles = Array.from(new Set(mockProfessionals.map(p => p.title)))
  const uniqueIndustries = Array.from(
    new Set(mockProfessionals.flatMap(p => p.industryFocus)),
  )
  const uniqueRegions = Array.from(new Set(mockProfessionals.map(p => p.location.split(',')[1].trim())))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="card p-6 card-hover" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-nav">IPOReady Talent Marketplace</h2>
          </div>
          <p className="text-sm text-text-muted">
            Search our network of verified directors, officers, and board members. All introductions secured through
            IPOReady ensure compliance and track finders fees (15% of 1-year compensation).
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, title, or experience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-nav focus:ring-2 focus:ring-offset-0"
            style={{ background: '#FFFFFF', color: '#1A1A1A' }}
          />
        </div>

        {/* Filter Chips */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Role</label>
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value || null)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-nav text-nav"
              style={{ background: '#FFFFFF' }}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Industry</label>
            <select
              value={selectedIndustry || ''}
              onChange={(e) => setSelectedIndustry(e.target.value || null)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-nav text-nav"
              style={{ background: '#FFFFFF' }}
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Region</label>
            <select
              value={selectedRegion || ''}
              onChange={(e) => setSelectedRegion(e.target.value || null)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-nav text-nav"
              style={{ background: '#FFFFFF' }}
            >
              <option value="">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-nav uppercase tracking-widest">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'match' | 'experience')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-nav text-nav"
              style={{ background: '#FFFFFF' }}
            >
              <option value="match">Best Match</option>
              <option value="experience">Most Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Showing <span className="font-semibold text-nav">{filteredProfessionals.length}</span> qualified
          professionals
        </p>
      </div>

      {/* Professional Cards */}
      <div className="space-y-4">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((prof, idx) => (
            <motion.div
              key={prof.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <div className={`card p-6 card-hover ${prof.featured ? 'border-info border-2' : ''}`} style={{ borderColor: prof.featured ? '#1D4ED8' : '#E5E4E0', background: prof.featured ? '#EFF6FF' : '#FFFFFF' }}>
                <div className="space-y-4">
                  {/* Header with Match Score */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-nav">{prof.name}</h3>
                        {prof.linkedinVerified && (
                          <span className="pill px-2 py-1 text-xs" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                            <Link2 className="w-3 h-3 inline mr-1" />
                            Verified
                          </span>
                        )}
                        {prof.featured && (
                          <span className="pill px-2 py-1 text-xs" style={{ background: '#FEF3C7', color: '#B45309' }}>
                            <Star className="w-3 h-3 inline mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mb-2">{prof.title}</p>
                      {prof.currentRole && <p className="text-xs text-text-muted">{prof.currentRole}</p>}
                    </div>

                    {prof.matchScore && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-success">{prof.matchScore}%</div>
                        <p className="text-xs text-text-muted">Match</p>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Reason */}
                  {prof.recommendationReason && (
                    <div className="p-3 bg-white border border-info border-opacity-30 rounded-lg">
                      <p className="text-sm text-nav">{prof.recommendationReason}</p>
                    </div>
                  )}

                  {/* Experience Details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-xs text-text-muted">Experience</p>
                        <p className="text-sm font-semibold text-nav">{prof.yearsExperience}+ yrs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-xs text-text-muted">Board Positions</p>
                        <p className="text-sm font-semibold text-nav">{prof.boardPositions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-xs text-text-muted">Location</p>
                        <p className="text-sm font-semibold text-nav">{prof.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Industry Tags */}
                  <div className="flex flex-wrap gap-2">
                    {prof.industryFocus.map(industry => (
                      <span key={industry} className="pill px-3 py-1 text-xs font-semibold" style={{ background: '#F7F6F4', color: '#1A1A1A' }}>
                        {industry}
                      </span>
                    ))}
                  </div>

                  {/* Compensation Info */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ background: '#F7F6F4' }}>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Typical Comp</p>
                      <p className="text-sm font-semibold text-nav">
                        ${(prof.typicalComp.min / 1000).toFixed(0)}K - ${(prof.typicalComp.max / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Equity Package</p>
                      <p className="text-sm font-semibold text-nav">
                        {prof.equity.min.toFixed(2)}% - {prof.equity.max.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => onProfessionalSelected?.(prof)}
                      className="btn btn-accent flex-1 gap-2 font-semibold px-6 py-2.5 rounded-full"
                    >
                      View Full Profile
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button className="btn btn-secondary flex-1 gap-2 font-semibold px-6 py-2.5 rounded-full">
                      Request Introduction
                    </Button>
                  </div>

                  {/* IPOReady Verification Badge */}
                  <div className="text-xs text-text-muted text-center pt-2 border-t border-border">
                    IPOReady-Verified Candidate #{prof.id} • Introductions tracked through IPOReady platform
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="card p-12 text-center" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
            <Search className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-40" />
            <p className="text-nav font-medium mb-2">No professionals found</p>
            <p className="text-sm text-text-muted">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {/* Finders Fee Information */}
      <div className="card p-6 card-hover" style={{ background: '#EAF5F0', border: '1px solid #D5EDE8' }}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-success" />
          <h3 className="text-sm font-semibold text-success">IPOReady Finders Fee</h3>
        </div>
        <p className="text-sm text-nav mb-3">
          When you hire an IPOReady-introduced candidate, a one-time finders fee of <span className="font-semibold">15% of 1-year
          compensation</span> is invoiced after the employment start date is confirmed in the platform.
        </p>
        <div className="p-3 bg-white border border-success border-opacity-30 rounded-lg text-xs text-nav">
          <p className="mb-2">
            <span className="font-semibold">Example:</span> Hire Independent Director at $80K annual retainer
          </p>
          <p>IPOReady Finders Fee: $80K × 15% = <span className="font-semibold text-success">$12,000 (one-time)</span></p>
        </div>
      </div>
    </div>
  )
}
