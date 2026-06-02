'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FeaturesMegaMenu } from '@/app/components/FeaturesMegaMenu'
import {
  BookOpen, FileText, ExternalLink, Newspaper, ChevronRight,
  Search, Filter, Clock, Building2, AlertCircle, Globe, Scale,
  TrendingUp, BookMarked, Shield, Star, Bookmark, ChevronDown, ChevronUp
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExchangeKey = 'TSX' | 'TSXV' | 'CSE' | 'CBOE' | 'NASDAQ' | 'NYSE' | 'OTC'
type LearnTab = 'pre-ipo' | 'post-listing' | 'forms'

interface Filing {
  date: string
  company: string
  ticker: string
  type: string
  description: string
  url: string
}

interface Policy {
  title: string
  section: string
  description: string
  url: string
  updated: string
}

interface NewsItem {
  date: string
  headline: string
  source: string
  exchange: ExchangeKey | 'General'
  url: string
}

interface GuideCard {
  id: number
  title: string
  category: string
  categoryColor: string
  categoryBg: string
  exchange: string
  readMin: number
  summary: string
  expandedContent?: React.ReactNode
}

// ─── Exchange Config ───────────────────────────────────────────────────────────

const EXCHANGES: { key: ExchangeKey; label: string; country: string; flag: string; color: string; bg: string }[] = [
  { key: 'TSX',    label: 'TSX',          country: 'Toronto Stock Exchange',          flag: '🇨🇦', color: '#B91C1C', bg: '#FEF2F2' },
  { key: 'TSXV',   label: 'TSXV',         country: 'TSX Venture Exchange',            flag: '🇨🇦', color: '#1D4ED8', bg: '#EFF6FF' },
  { key: 'CSE',    label: 'CSE',          country: 'Canadian Securities Exchange',    flag: '🇨🇦', color: '#2D7A5F', bg: '#EAF5F0' },
  { key: 'CBOE',   label: 'Cboe CA',      country: 'Cboe Canada',                     flag: '🇨🇦', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'NASDAQ', label: 'NASDAQ',       country: 'Nasdaq Stock Market',             flag: '🇺🇸', color: '#0369A1', bg: '#F0F9FF' },
  { key: 'NYSE',   label: 'NYSE',         country: 'New York Stock Exchange',         flag: '🇺🇸', color: '#B45309', bg: '#FFFBEB' },
  { key: 'OTC',    label: 'OTC',          country: 'OTC Markets Group',               flag: '🇺🇸', color: '#6B7280', bg: '#F9FAFB' },
]

// ─── Filings Data ─────────────────────────────────────────────────────────────

const FILINGS: Record<ExchangeKey, Filing[]> = {
  TSX: [
    { date: '2026-05-20', company: 'Northland Power Inc.', ticker: 'NPI', type: 'Material Change Report', description: 'Acquisition of 49% interest in offshore wind portfolio — Scotland & Netherlands', url: '#' },
    { date: '2026-05-19', company: 'Brookfield Asset Management', ticker: 'BAM', type: 'Annual Information Form', description: 'Annual disclosure for fiscal year ended Dec 31, 2025 — 62 pages', url: '#' },
    { date: '2026-05-16', company: 'TechNorth Corp.', ticker: 'TNO', type: 'Preliminary Prospectus', description: 'Initial public offering of 12,000,000 common shares at $10.00–$12.00 per share', url: '#' },
    { date: '2026-05-15', company: 'Maple Leaf Foods Inc.', ticker: 'MFI', type: 'Management Information Circular', description: 'Notice of annual and special meeting of shareholders — June 18, 2026', url: '#' },
    { date: '2026-05-14', company: 'Granite REIT', ticker: 'GRT.UN', type: 'Short Form Prospectus', description: 'Bought deal offering of $200M 5.20% senior unsecured debentures due 2031', url: '#' },
  ],
  TSXV: [
    { date: '2026-05-21', company: 'Goldstrike Resources Ltd.', ticker: 'GSR', type: 'Filing Statement', description: 'Qualifying transaction — acquisition of Yukon gold exploration property, 1,850 ha', url: '#' },
    { date: '2026-05-19', company: 'CleanTech Ventures Inc.', ticker: 'CTV', type: 'Prospectus', description: 'IPO of 8,000,000 units at $0.75 per unit — clean energy storage technology', url: '#' },
    { date: '2026-05-18', company: 'Sovereign Lithium Corp.', ticker: 'SLI', type: 'Material Change Report', description: 'Closing of private placement — 15,000,000 shares at $0.45 raising $6.75M', url: '#' },
    { date: '2026-05-15', company: 'Northern Health Tech Inc.', ticker: 'NHT', type: 'Annual Information Form', description: 'AIF for fiscal year ended March 31, 2026 — Digital health diagnostics platform', url: '#' },
    { date: '2026-05-13', company: 'Pacific Copper Corp.', ticker: 'PCC', type: 'Information Circular', description: 'Special meeting re: consolidation of share capital and name change to Pacific Metals Corp.', url: '#' },
  ],
  CSE: [
    { date: '2026-05-20', company: 'CannaGrow Sciences Inc.', ticker: 'CGS', type: 'Listing Statement', description: 'Listing of 45,000,000 common shares — cannabis extraction & white-label manufacturing', url: '#' },
    { date: '2026-05-19', company: 'Blockchain Capital Corp.', ticker: 'BCC', type: 'Management Discussion & Analysis', description: 'MD&A for Q1 2026 — digital asset custody and institutional trading desk', url: '#' },
    { date: '2026-05-16', company: 'Psilocybin Pharma Ltd.', ticker: 'PSI', type: 'Material Change Report', description: 'Regulatory approval received — Phase II clinical trial clearance, Health Canada', url: '#' },
    { date: '2026-05-14', company: 'Verdant Energy Corp.', ticker: 'VEC', type: 'Prospectus Supplement', description: 'At-the-market equity offering program — up to $10M common shares', url: '#' },
    { date: '2026-05-12', company: 'AI Horizons Inc.', ticker: 'AHI', type: 'Listing Statement', description: 'CSE listing following TSXV graduation — AI-powered supply chain optimization', url: '#' },
  ],
  CBOE: [
    { date: '2026-05-21', company: 'Nexus Industrial REIT', ticker: 'NXR.UN', type: 'Final Prospectus', description: 'Bought deal offering — 6,000,000 trust units at $10.50 per unit ($63M)', url: '#' },
    { date: '2026-05-18', company: 'Cardinal Energy Ltd.', ticker: 'CJ', type: 'Material Change Report', description: 'Corporate reorganization — migration of listing from TSX to Cboe Canada effective June 1', url: '#' },
    { date: '2026-05-17', company: 'Farmers Edge Inc.', ticker: 'FDGE', type: 'Annual Information Form', description: 'AIF for fiscal year ended December 31, 2025 — Precision agriculture SaaS', url: '#' },
    { date: '2026-05-15', company: 'Surge Energy Inc.', ticker: 'SGY', type: 'Prospectus', description: 'Rights offering — 1 right per share, exercise price $2.80, raise up to $28M', url: '#' },
    { date: '2026-05-13', company: 'Westbridge Renewable Energy', ticker: 'WEB', type: 'Information Circular', description: 'Annual and special meeting — June 25, 2026. Approval of omnibus equity incentive plan', url: '#' },
  ],
  NASDAQ: [
    { date: '2026-05-21', company: 'Vertex Biosciences Inc.', ticker: 'VRTX', type: 'S-1 Registration Statement', description: 'IPO registration — oncology mRNA therapeutics, up to $150M offered', url: '#' },
    { date: '2026-05-20', company: 'DataStream Analytics Corp.', ticker: 'DSTR', type: 'Form 8-K', description: 'Entry into material definitive agreement — $500M revolving credit facility with Citi', url: '#' },
    { date: '2026-05-19', company: 'CloudBridge Technologies', ticker: 'CLBR', type: 'Form 10-K', description: 'Annual report for fiscal year ended March 31, 2026 — enterprise cloud infrastructure', url: '#' },
    { date: '2026-05-16', company: 'MedVision Diagnostics', ticker: 'MVD', type: 'S-1/A Amendment', description: 'Amended registration — updated pricing range $14–$16 per share, 8,500,000 shares', url: '#' },
    { date: '2026-05-15', company: 'GreenPath Materials Inc.', ticker: 'GPM', type: 'Form 4', description: 'Statement of changes in beneficial ownership — CEO purchases 50,000 shares open market', url: '#' },
  ],
  NYSE: [
    { date: '2026-05-21', company: 'Atlas Infrastructure Partners', ticker: 'AIP', type: 'S-11 Registration', description: 'REIT IPO registration — infrastructure-focused real estate investment trust, $400M target', url: '#' },
    { date: '2026-05-20', company: 'Sovereign Capital Group', ticker: 'SCG', type: 'Form 8-K', description: 'Results of operations — Q1 2026 earnings. Revenue $2.1B, EPS $1.84 beat consensus', url: '#' },
    { date: '2026-05-19', company: 'Meridian Energy Corp.', ticker: 'MEC', type: 'Form 20-F', description: 'Annual report of foreign private issuer — fiscal year 2025, Canadian-HQ renewable energy', url: '#' },
    { date: '2026-05-16', company: 'Pinnacle Health Systems', ticker: 'PHS', type: 'S-4 Registration', description: 'Merger registration — acquisition of BioCore Diagnostics for $2.8B all-stock transaction', url: '#' },
    { date: '2026-05-15', company: 'Global Logistics Inc.', ticker: 'GLI', type: 'DEF 14A Proxy', description: 'Definitive proxy statement — annual meeting June 20, say-on-pay and 4 director elections', url: '#' },
  ],
  OTC: [
    { date: '2026-05-21', company: 'Pacific Rim Ventures Inc.', ticker: 'PRFV', type: 'Form 211', description: 'Application to initiate quotation — mining exploration company uplisting to OTCQB', url: '#' },
    { date: '2026-05-20', company: 'BioNaturals Corp.', ticker: 'BNTL', type: 'Form 10-12G', description: 'Registration of securities — nutraceuticals company, SEC registration 10,000,000 shares', url: '#' },
    { date: '2026-05-19', company: 'Quantum Photonics Ltd.', ticker: 'QPHL', type: 'Form 15-12G', description: 'Termination of registration — below 300 holders of record, deregistering from reporting', url: '#' },
    { date: '2026-05-16', company: 'RealEstate Digital Inc.', ticker: 'REDI', type: 'Annual Report (OTC)', description: 'Voluntary annual report for 2025 — proptech company, OTCQX Best Market disclosure standards', url: '#' },
    { date: '2026-05-14', company: 'Horizon Cannabis Inc.', ticker: 'HRZC', type: 'Form 8-A12G', description: 'Registration of class of securities — preferred shares, Canadian issuer listed OTC', url: '#' },
  ],
}

// ─── Policies Data ────────────────────────────────────────────────────────────

const POLICIES: Record<ExchangeKey, Policy[]> = {
  TSX: [
    { title: 'TSX Company Manual', section: 'Part I — Listing', description: 'Eligibility requirements, listing criteria, minimum financial thresholds, and application procedures for TSX listing', url: '#', updated: 'Mar 2026' },
    { title: 'TSX Company Manual', section: 'Part IV — Continuous Disclosure', description: 'Timely disclosure policy, material change reports, financial statement filing deadlines, and press release requirements', url: '#', updated: 'Jan 2026' },
    { title: 'TSX Company Manual', section: 'Part VI — Securities', description: 'Trading rules, special warrants, securities offerings, private placements, and shareholder approval requirements', url: '#', updated: 'Feb 2026' },
    { title: 'TSX Corporate Governance Guidelines', section: 'Board Composition', description: 'Independence requirements, audit committee composition, compensation committee standards, and governance disclosure', url: '#', updated: 'Nov 2025' },
    { title: 'TSX Staff Notices', section: 'Recent Interpretations', description: 'Staff guidance on emerging issues including dual-class share structures, climate disclosure expectations, and AI governance', url: '#', updated: 'Apr 2026' },
  ],
  TSXV: [
    { title: 'TSXV Corporate Finance Manual', section: 'Policy 2.1 — Initial Listing Requirements', description: 'Tier 1 and Tier 2 listing criteria, minimum working capital, property interests, and management track record', url: '#', updated: 'Feb 2026' },
    { title: 'TSXV Corporate Finance Manual', section: 'Policy 3.2 — Filing Requirements', description: 'Continuous disclosure obligations, quarterly and annual filing deadlines, and material change reporting for venture issuers', url: '#', updated: 'Jan 2026' },
    { title: 'TSXV Corporate Finance Manual', section: 'Policy 5.1 — Loans, Bonuses, Profit Sharing', description: 'Restrictions on related party transactions, management compensation disclosure, and insider transaction approvals', url: '#', updated: 'Mar 2026' },
    { title: 'TSXV Blanket Orders', section: 'Temporary Relief — Small Issuers', description: 'Current blanket orders providing targeted relief for qualifying issuers under financial hardship thresholds', url: '#', updated: 'Apr 2026' },
    { title: 'TSXV RTO Policies', section: 'Policy 5.2 — Change of Business', description: 'Reverse takeover mechanics, arm\'s length requirements, filing statements, and requalification as new issuer', url: '#', updated: 'Dec 2025' },
  ],
  CSE: [
    { title: 'CSE Listing Policies', section: 'Part 2 — Listing Requirements', description: 'Initial listing conditions for industrial, mining, oil & gas, technology, and cannabis companies including financial thresholds', url: '#', updated: 'Mar 2026' },
    { title: 'CSE Listing Policies', section: 'Part 5 — Ongoing Requirements', description: 'Continuous disclosure, timely disclosure, financial reporting deadlines, and material information management', url: '#', updated: 'Feb 2026' },
    { title: 'CSE Staff Bulletin', section: 'Cannabis Issuers', description: 'CSE guidance specific to cannabis companies covering licence requirements, regulatory compliance disclosure, and geographic restrictions', url: '#', updated: 'Jan 2026' },
    { title: 'CSE Policies', section: 'Part 8 — Halts and Suspensions', description: 'Trading halt triggers, suspension procedures, reinstatement conditions, and delisting criteria for non-compliant issuers', url: '#', updated: 'Nov 2025' },
    { title: 'CSE Notice to Issuers', section: 'Digital Asset Companies', description: 'Supplemental disclosure requirements for issuers with digital asset or blockchain business models', url: '#', updated: 'Apr 2026' },
  ],
  CBOE: [
    { title: 'Cboe Canada Listing Rules', section: 'Part 3 — Listing Criteria', description: 'Financial and non-financial eligibility requirements, shareholder spread, market capitalization minimums', url: '#', updated: 'Jan 2026' },
    { title: 'Cboe Canada Listing Rules', section: 'Part 7 — Issuer Obligations', description: 'Ongoing reporting obligations, press release protocols, investor relations requirements, and corporate action filings', url: '#', updated: 'Feb 2026' },
    { title: 'Cboe Canada Trading Rules', section: 'Market Operations', description: 'Market hours, order types, trading halts, dark pool provisions, and best execution obligations', url: '#', updated: 'Mar 2026' },
    { title: 'Cboe Canada FAQs', section: 'Listing Migration Guide', description: 'Step-by-step guide for issuers migrating from TSX or TSXV — timeline, required documentation, and transfer procedures', url: '#', updated: 'Apr 2026' },
  ],
  NASDAQ: [
    { title: 'Nasdaq Listing Rules', section: 'Rule 5000 — Global Select Market', description: 'Initial listing standards for Global Select Market: financial, liquidity, and corporate governance requirements', url: '#', updated: 'Feb 2026' },
    { title: 'Nasdaq Listing Rules', section: 'Rule 5600 — Corporate Governance', description: 'Board composition, audit committee charter, compensation committee independence, and code of conduct requirements', url: '#', updated: 'Mar 2026' },
    { title: 'Nasdaq Listing Rules', section: 'Rule 5635 — Shareholder Approval', description: '20% rule for equity issuances, change of control transactions, acquisition of stock or assets, and equity compensation plans', url: '#', updated: 'Jan 2026' },
    { title: 'Nasdaq Staff Guidance', section: 'Foreign Private Issuers', description: 'FPI exemptions from certain governance rules, Form 20-F annual report requirements, and home-country practice substitutions', url: '#', updated: 'Dec 2025' },
    { title: 'Nasdaq Listing Process', section: 'Application & Approval Timeline', description: 'End-to-end listing application guide: engagement letter, preliminary review, confidential submission, public filing, and approval', url: '#', updated: 'Apr 2026' },
  ],
  NYSE: [
    { title: 'NYSE Listed Company Manual', section: 'Section 1 — Listing Standards', description: 'Financial standards, global market cap minimums, distribution requirements, and non-US company special provisions', url: '#', updated: 'Mar 2026' },
    { title: 'NYSE Listed Company Manual', section: 'Section 3 — Corporate Governance', description: 'Director independence, audit committee requirements, CEO certification of compliance, and governance committee standards', url: '#', updated: 'Feb 2026' },
    { title: 'NYSE Listed Company Manual', section: 'Section 4 — Shareholder Approval', description: 'Scenarios requiring shareholder approval: equity incentive plans, change of control issuances, related party transactions', url: '#', updated: 'Jan 2026' },
    { title: 'NYSE Interpretive Letters', section: 'Staff Interpretations', description: 'Publicly available staff interpretive letters on corporate governance and listing rule applications', url: '#', updated: 'Apr 2026' },
    { title: 'NYSE Arca Listing Rules', section: 'ETF & Structured Products', description: 'Additional requirements for ETF issuers, closed-end funds, and structured product listings on Arca', url: '#', updated: 'Nov 2025' },
  ],
  OTC: [
    { title: 'OTC Markets Standards', section: 'OTCQX Requirements', description: 'Best Market standards: minimum bid price $1, net tangible assets $2M, SEC reporting, and US bank/attorney sponsor requirement', url: '#', updated: 'Feb 2026' },
    { title: 'OTC Markets Standards', section: 'OTCQB Venture Market', description: 'Venture stage requirements: minimum bid price $0.01, annual certification, SEC reporting, and financial standards', url: '#', updated: 'Feb 2026' },
    { title: 'OTC Markets Standards', section: 'Disclosure Requirements', description: 'Voluntary and mandatory disclosure standards, annual certification process, and information review by OTC Markets', url: '#', updated: 'Mar 2026' },
    { title: 'SEC Rule 15c2-11', section: 'Revised Requirements', description: 'Updated broker-dealer requirements for publishing OTC quotations — current public information standards effective 2021', url: '#', updated: 'Jan 2026' },
    { title: 'OTC Uplisting Guide', section: 'Path to National Exchange', description: 'Roadmap and checklist for upgrading from OTC to Nasdaq or NYSE — eligibility criteria, timeline, and common pitfalls', url: '#', updated: 'Apr 2026' },
  ],
}

// ─── News Data ─────────────────────────────────────────────────────────────────

const NEWS: NewsItem[] = [
  { date: 'May 21, 2026', headline: 'TSX to implement mandatory climate-related disclosure for all listed issuers effective Q1 2027', source: 'TMX Group', exchange: 'TSX', url: '#' },
  { date: 'May 20, 2026', headline: 'Nasdaq raises minimum listing bid price requirement to $4.00 under proposed rule amendment', source: 'SEC Filing', exchange: 'NASDAQ', url: '#' },
  { date: 'May 19, 2026', headline: 'CSE reports record 47 new listings in Q1 2026, led by AI and clean energy sectors', source: 'CSE News Release', exchange: 'CSE', url: '#' },
  { date: 'May 17, 2026', headline: 'Canadian Securities Administrators publish updated guidance on AI governance disclosure for issuers', source: 'CSA Staff Notice 51-360', exchange: 'General', url: '#' },
  { date: 'May 16, 2026', headline: 'NYSE approves new dual-class share structure framework for technology sector IPOs', source: 'NYSE Rule Filing', exchange: 'NYSE', url: '#' },
  { date: 'May 15, 2026', headline: 'TSXV announces Tier 1 graduation fee reduction — incentivizing small issuer growth to senior market', source: 'TMX Bulletin', exchange: 'TSXV', url: '#' },
  { date: 'May 14, 2026', headline: 'OTC Markets Group updates OTCQX annual certification process — new sustainability disclosure component', source: 'OTC Markets Notice', exchange: 'OTC', url: '#' },
  { date: 'May 13, 2026', headline: 'Cboe Canada launches new SPAC listing framework with enhanced investor protection provisions', source: 'Cboe Canada Press Release', exchange: 'CBOE', url: '#' },
  { date: 'May 12, 2026', headline: 'SEC proposes expanded disclosure requirements for foreign private issuers on US exchanges', source: 'SEC Release 33-11359', exchange: 'General', url: '#' },
  { date: 'May 9, 2026', headline: 'TSX sets new annual IPO record — 38 new listings raising $4.2B CAD in first four months of 2026', source: 'TMX Group Statistics', exchange: 'TSX', url: '#' },
]

// ─── Guide expanded content helpers ───────────────────────────────────────────

function TSXVListingContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#F7F6F4', borderRadius: '10px', padding: '0.875rem 1rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>A — Minimum Financial Requirements</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            'Tier 2: Working capital ≥ CA$750,000; Tier 1: ≥ CA$2,000,000',
            'Tier 2: Adequate property interest or product/service with 18-month budget',
            'Tier 1: Advanced-stage property or product with demonstrated revenue',
            'Minimum 200 public shareholders, each holding ≥ 1 board lot',
            'Free float: ≥ 1,000,000 freely tradeable shares at listing',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#1D4ED8', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
              <span style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#F7F6F4', borderRadius: '10px', padding: '0.875rem 1rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>B — Corporate Requirements</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            'Board of directors with majority resident Canadian directors',
            'Audit committee constituted under NI 52-110 (venture issuer exemptions available)',
            'Corporate governance disclosure per NI 58-101',
            'Escrow arrangements for principals per TSXV Policy 5.4',
            'Management track record: principals must demonstrate relevant experience',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#1D4ED8', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
              <span style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#F7F6F4', borderRadius: '10px', padding: '0.875rem 1rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>C — Filing Package Items</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            'Filing Statement or Prospectus (depending on listing route)',
            'Personal Information Forms (PIFs) for all directors, officers, and 10%+ holders',
            'Financial statements (audited) meeting TSXV standards',
            'Technical report (NI 43-101 if mining/resource property)',
            'Escrow agreement executed with TSXV transfer agent',
            'TSXV listing fee and initial listing fee paid',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#1D4ED8', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
              <span style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MaterialChangeContent() {
  const events = [
    { event: 'Change in CEO, CFO, or Board Chair', deadline: '10 days', note: 'Includes resignation or termination of officer with key responsibilities' },
    { event: 'Acquisition or disposition of material assets', deadline: '10 days', note: 'Any asset representing >20% of total assets triggers reporting' },
    { event: 'New significant financing (equity or debt)', deadline: '10 days', note: 'Includes bought deals, private placements, and credit facilities' },
    { event: 'Resource estimate update (NI 43-101)', deadline: '10 days', note: 'Change in mineral resource/reserve category or tonnage >10%' },
    { event: 'Regulatory approval or denial', deadline: '10 days', note: 'Health Canada, EPA, or exchange-specific approvals or rejections' },
    { event: 'Signing or termination of material contract', deadline: '10 days', note: 'Offtake agreements, JV agreements, licensing agreements' },
    { event: 'Commencement or settlement of material litigation', deadline: '10 days', note: 'Any claim that could materially affect operations or financial position' },
    { event: 'Bankruptcy, insolvency, or restructuring filing', deadline: 'Immediate', note: 'Requires immediate press release followed by formal MCR filing' },
    { event: 'Change in auditor', deadline: '10 days', note: 'Includes notice of auditor resignation or dismissal' },
    { event: 'Share consolidation or subdivision', deadline: '10 days', note: 'Requires shareholder or director approval documentation' },
    { event: 'Name change of the company', deadline: '10 days', note: 'Concurrent press release and SEDAR+ filing required' },
    { event: 'Dividend declaration or suspension', deadline: '10 days', note: 'Must include record date and payment date in disclosure' },
    { event: 'Significant exploration results (mining)', deadline: '10 days', note: 'Results that materially change the resource picture require immediate disclosure' },
    { event: 'Strategic partnership or joint venture', deadline: '10 days', note: 'Where the transaction is material to operations or capital structure' },
    { event: 'Completion of qualifying transaction (TSXV)', deadline: '10 days', note: 'Reverse takeover or change of business completion triggers full MCR' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#717171', marginBottom: '0.25rem' }}>Under NI 51-102 s.7.1, a material change report (Form 51-102F3) must be filed within 10 days of the date of the material change. The following 15 events typically trigger this obligation:</p>
      {events.map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.5rem 0.75rem', background: '#F7F6F4', borderRadius: '8px' }}>
          <span style={{ background: '#FDECEB', color: '#E8312A', borderRadius: '4px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '2px' }}>{ev.event}</p>
            <p style={{ fontSize: '0.7rem', color: '#717171', lineHeight: 1.4 }}>{ev.note}</p>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#B45309', background: '#FEF3C7', borderRadius: '4px', padding: '2px 6px', flexShrink: 0, whiteSpace: 'nowrap' }}>{ev.deadline}</span>
        </div>
      ))}
    </div>
  )
}

function PostListingTimelineContent() {
  const phases = [
    {
      label: 'Day 1–30',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      items: [
        'File listing date press release on SEDAR+ within 1 business day',
        'Register all insiders on SEDI and file Form 55-102F2 within 10 days',
        'Hold inaugural audit committee meeting and approve charter',
        'File insider reports for any pre-listing share transactions',
        'Activate continuous disclosure program and monitor material changes',
      ],
    },
    {
      label: 'Day 31–60',
      color: '#2D7A5F',
      bg: '#EAF5F0',
      items: [
        'File first quarterly financial statements (if Q-end falls in window)',
        'Publish first MD&A discussing plan of operations post-listing',
        'Issue first investor relations press release (business update)',
        'Complete any remaining escrow documentation with transfer agent',
        'Confirm AGM date and begin proxy circular preparation',
      ],
    },
    {
      label: 'Day 61–90',
      color: '#7C3AED',
      bg: '#F5F3FF',
      items: [
        'File annual financial statements if fiscal year ends within 90 days',
        'Confirm Annual Information Form filing deadline with securities counsel',
        'Hold first post-listing board meeting with full agenda',
        'Review and update insider trading policy with blackout periods',
        'Begin preparation for first AGM — management information circular',
      ],
    },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
      {phases.map(phase => (
        <div key={phase.label} style={{ background: phase.bg, borderRadius: '10px', padding: '0.875rem', border: `1px solid ${phase.color}33` }}>
          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: phase.color, marginBottom: '0.625rem' }}>{phase.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {phase.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                <span style={{ color: phase.color, fontWeight: 700, fontSize: '0.7rem', flexShrink: 0, marginTop: '2px' }}>•</span>
                <span style={{ fontSize: '0.7rem', color: '#444', lineHeight: 1.45 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Filing Type Badge ─────────────────────────────────────────────────────────

function FilingBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Preliminary Prospectus': { bg: '#FDECEB', color: '#E8312A' },
    'Final Prospectus':       { bg: '#FDECEB', color: '#E8312A' },
    'Prospectus':             { bg: '#FDECEB', color: '#E8312A' },
    'Listing Statement':      { bg: '#EAF5F0', color: '#2D7A5F' },
    'Filing Statement':       { bg: '#EAF5F0', color: '#2D7A5F' },
    'S-1 Registration Statement': { bg: '#EFF6FF', color: '#1D4ED8' },
    'S-1/A Amendment':        { bg: '#EFF6FF', color: '#1D4ED8' },
    'Annual Information Form': { bg: '#F7F6F4', color: '#717171' },
    'Form 10-K':              { bg: '#F7F6F4', color: '#717171' },
    'Form 20-F':              { bg: '#F7F6F4', color: '#717171' },
    'Material Change Report': { bg: '#FEF3C7', color: '#B45309' },
    'Form 8-K':               { bg: '#FEF3C7', color: '#B45309' },
  }
  const style = map[type] ?? { bg: '#F7F6F4', color: '#9A9A9A' }
  return (
    <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}>
      {type}
    </span>
  )
}

// ─── Guide Card Component ──────────────────────────────────────────────────────

function GuideCardItem({
  guide,
  isExpanded,
  isBookmarked,
  onToggleExpand,
  onToggleBookmark,
}: {
  guide: GuideCard
  isExpanded: boolean
  isBookmarked: boolean
  onToggleExpand: () => void
  onToggleBookmark: () => void
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid #E5E4E0',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
      <div style={{ padding: '1.125rem 1.25rem' }}>
        {/* Top row: category, exchange, read time, bookmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
          <span style={{
            background: guide.categoryBg,
            color: guide.categoryColor,
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            letterSpacing: '0.02em',
          }}>{guide.category}</span>
          <span style={{
            background: '#F7F6F4',
            color: '#717171',
            fontSize: '0.65rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '999px',
          }}>{guide.exchange}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
            <Clock style={{ width: '11px', height: '11px', color: '#9A9A9A' }} />
            <span style={{ fontSize: '0.65rem', color: '#9A9A9A', fontWeight: 500 }}>{guide.readMin} min read</span>
          </div>
          <button onClick={onToggleBookmark} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: isBookmarked ? '#E8312A' : '#CCCCCC',
            transition: 'color 0.15s',
          }}>
            <Bookmark style={{ width: '14px', height: '14px', fill: isBookmarked ? '#E8312A' : 'none' }} />
          </button>
        </div>

        {/* Title */}
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A', marginBottom: '0.375rem', lineHeight: 1.35 }}>{guide.title}</h3>

        {/* Summary */}
        <p style={{ fontSize: '0.775rem', color: '#717171', lineHeight: 1.55, marginBottom: '0.75rem',
          display: '-webkit-box', WebkitLineClamp: isExpanded ? undefined : 2, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden' }}>
          {guide.summary}
        </p>

        {/* Read Guide button */}
        {guide.expandedContent && (
          <button onClick={onToggleExpand} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#1D4ED8',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}>
            {isExpanded ? 'Collapse' : 'Read Guide'}
            {isExpanded ? <ChevronUp style={{ width: '13px', height: '13px' }} /> : <ChevronDown style={{ width: '13px', height: '13px' }} />}
          </button>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && guide.expandedContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F0EFED', paddingTop: '1rem' }}>
              {guide.expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [activeExchange, setActiveExchange] = useState<ExchangeKey>('TSX')
  const [activeTab, setActiveTab] = useState<'filings' | 'policies'>('filings')
  const [search, setSearch] = useState('')

  // Learning Centre state
  const [learnTab, setLearnTab] = useState<LearnTab>('pre-ipo')
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null)
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())

  function toggleBookmark(id: number) {
    setBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleExpand(id: number) {
    setExpandedGuide(prev => (prev === id ? null : id))
  }

  const exchange = EXCHANGES.find(e => e.key === activeExchange)!

  const filings = FILINGS[activeExchange].filter(f =>
    !search || f.company.toLowerCase().includes(search.toLowerCase()) ||
    f.type.toLowerCase().includes(search.toLowerCase()) ||
    f.ticker.toLowerCase().includes(search.toLowerCase())
  )

  const policies = POLICIES[activeExchange].filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.section.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  // Guide data
  const preIpoGuides: GuideCard[] = [
    {
      id: 1,
      title: 'TSXV Listing Requirements — Complete Guide',
      category: 'Regulatory',
      categoryColor: '#1D4ED8',
      categoryBg: '#EFF6FF',
      exchange: 'TSXV',
      readMin: 12,
      summary: 'Minimum requirements for a TSXV listing — distributable securities, working capital, asset thresholds, and corporate governance requirements under TSXV Policy 2.1.',
      expandedContent: <TSXVListingContent />,
    },
    {
      id: 2,
      title: 'NI 43-101 Technical Report Primer (Mining)',
      category: 'Technical',
      categoryColor: '#2D7A5F',
      categoryBg: '#EAF5F0',
      exchange: 'TSXV / TSX',
      readMin: 8,
      summary: 'National Instrument 43-101 requires a technical report from a Qualified Person for all material mineral properties. This guide covers when it\'s required, who qualifies, and common deficiencies.',
    },
    {
      id: 3,
      title: 'PIF — Personal Information Form Complete Walkthrough',
      category: 'Regulatory',
      categoryColor: '#1D4ED8',
      categoryBg: '#EFF6FF',
      exchange: 'TSXV / CSE',
      readMin: 6,
      summary: 'The Personal Information Form (PIF) is required for all directors, officers, and 10%+ shareholders. This guide covers what triggers a PIF, the disclosure questions, and how to avoid common refusals.',
    },
    {
      id: 4,
      title: 'Audit Committee Requirements — NI 52-110',
      category: 'Governance',
      categoryColor: '#7C3AED',
      categoryBg: '#F5F3FF',
      exchange: 'All Canadian',
      readMin: 5,
      summary: 'NI 52-110 requires every reporting issuer to have an audit committee of at least 3 members, majority independent, with a financial expert. Key requirements, exemptions for venture issuers, and charter template guidance.',
    },
  ]

  const postListingGuides: GuideCard[] = [
    {
      id: 5,
      title: 'Continuous Disclosure — What Triggers a Material Change Report',
      category: 'Compliance',
      categoryColor: '#B45309',
      categoryBg: '#FEF3C7',
      exchange: 'All',
      readMin: 10,
      summary: 'Under NI 51-102, a material change report must be filed within 10 days of any change in business, operations, or capital that would reasonably be expected to significantly affect share price. This guide covers 15 triggering events with real examples.',
      expandedContent: <MaterialChangeContent />,
    },
    {
      id: 6,
      title: 'SEDI Registration & Insider Reporting — Step-by-Step',
      category: 'Regulatory',
      categoryColor: '#1D4ED8',
      categoryBg: '#EFF6FF',
      exchange: 'All Canadian',
      readMin: 7,
      summary: 'All insiders of a reporting issuer must register on SEDI (System for Electronic Disclosure by Insiders) and report all trades within 5 calendar days. This guide covers the registration process, Form 55-102F2, and avoiding the 10-day window breach.',
    },
    {
      id: 7,
      title: 'First 90 Days Post-Listing Compliance Checklist',
      category: 'Compliance',
      categoryColor: '#B45309',
      categoryBg: '#FEF3C7',
      exchange: 'TSXV / TSX',
      readMin: 8,
      summary: 'The 30/60/90 day compliance calendar after your listing date. Covers SEDAR+ filings, SEDI obligations, press release requirements, AGM timing, audit committee first meeting, and first MD&A.',
      expandedContent: <PostListingTimelineContent />,
    },
  ]

  const formTemplates = [
    { title: 'Insider Trading Policy Template', sub: 'TSXV-compliant', href: '/templates' },
    { title: 'Audit Committee Charter Template', sub: 'NI 52-110', href: '/templates' },
    { title: 'Form 55-102F2 Guide', sub: 'SEDI insider reporting', href: '/templates' },
    { title: 'Corporate Disclosure Policy', sub: 'For all Canadian reporting issuers', href: '/templates' },
  ]

  const learnTabs: { key: LearnTab; label: string }[] = [
    { key: 'pre-ipo', label: 'Pre-IPO Guides' },
    { key: 'post-listing', label: 'Post-Listing Compliance' },
    { key: 'forms', label: 'Forms & Templates' },
  ]

  return (
    <>
      {/* Main menu */}
      <FeaturesMegaMenu />

      <div style={{ maxWidth: '1280px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '1.75rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.375rem' }}>
          <BookOpen className="w-5 h-5" style={{ color: '#E8312A' }} />
          <h1 className="text-nav font-bold text-2xl">Resource Centre</h1>
        </div>
        <p className="text-text-muted text-sm">
          Recent filings, regulatory policies, and procedures across all major listing exchanges.
          For reference only — always verify directly with the exchange or your legal counsel.
        </p>
      </div>

      {/* ── Learning Centre ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        {/* Section header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <BookMarked className="w-4 h-4" style={{ color: '#1D4ED8' }} />
            <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1A1A1A' }}>IPO &amp; Compliance Learning Centre</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#717171' }}>
            Everything you need to know — from first filing to post-listing compliance
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {learnTabs.map(tab => (
            <button key={tab.key} onClick={() => setLearnTab(tab.key)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                ...(learnTab === tab.key
                  ? { background: '#1D4ED8', borderColor: '#1D4ED8', color: 'white' }
                  : { background: 'white', borderColor: '#E5E4E0', color: '#717171' }),
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          {learnTab === 'pre-ipo' && (
            <motion.div key="pre-ipo"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {preIpoGuides.map(guide => (
                <GuideCardItem
                  key={guide.id}
                  guide={guide}
                  isExpanded={expandedGuide === guide.id}
                  isBookmarked={bookmarked.has(guide.id)}
                  onToggleExpand={() => toggleExpand(guide.id)}
                  onToggleBookmark={() => toggleBookmark(guide.id)}
                />
              ))}
            </motion.div>
          )}

          {learnTab === 'post-listing' && (
            <motion.div key="post-listing"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {postListingGuides.map(guide => (
                <GuideCardItem
                  key={guide.id}
                  guide={guide}
                  isExpanded={expandedGuide === guide.id}
                  isBookmarked={bookmarked.has(guide.id)}
                  onToggleExpand={() => toggleExpand(guide.id)}
                  onToggleBookmark={() => toggleBookmark(guide.id)}
                />
              ))}
            </motion.div>
          )}

          {learnTab === 'forms' && (
            <motion.div key="forms"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {formTemplates.map((tpl, i) => (
                <a key={i} href={tpl.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E4E0',
                    padding: '1.125rem 1.25rem',
                    textDecoration: 'none',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText style={{ width: '16px', height: '16px', color: '#1D4ED8' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A1A1A', marginBottom: '2px' }}>{tpl.title}</p>
                    <p style={{ fontSize: '0.73rem', color: '#9A9A9A' }}>{tpl.sub}</p>
                  </div>
                  <ChevronRight style={{ width: '15px', height: '15px', color: '#CCCCCC', flexShrink: 0 }} />
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, height: '1px', background: '#E5E4E0' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
          Regulatory Filings &amp; Exchange Policies
        </span>
        <div style={{ flex: 1, height: '1px', background: '#E5E4E0' }} />
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Left: Main Content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Exchange filter tabs */}
          <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: '1.25rem' }}>
            {EXCHANGES.map(ex => (
              <button key={ex.key} onClick={() => setActiveExchange(ex.key)}
                className="flex items-center gap-1.5 rounded-full text-sm font-medium transition-all border"
                style={{
                  padding: '0.375rem 0.875rem',
                  ...(activeExchange === ex.key
                    ? { background: exchange.bg, borderColor: exchange.color, color: exchange.color, fontWeight: 600 }
                    : { background: 'white', borderColor: '#E5E4E0', color: '#717171' })
                }}>
                <span>{ex.flag}</span>
                <span>{ex.label}</span>
              </button>
            ))}
          </div>

          {/* Exchange info bar */}
          <div className="rounded-xl border flex items-center gap-3" style={{ background: exchange.bg, borderColor: exchange.color + '33', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: exchange.color }} />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm" style={{ color: exchange.color }}>{exchange.label}</span>
              <span className="text-text-muted text-sm" style={{ marginLeft: '0.5rem' }}>{exchange.country}</span>
            </div>
            <span className="text-xs" style={{ color: '#9A9A9A' }}>{exchange.flag}</span>
          </div>

          {/* Tabs + Search */}
          <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#E5E4E0', background: '#F7F6F4' }}>
              {(['filings', 'policies'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-1.5 text-sm font-medium transition-all capitalize"
                  style={{
                    padding: '0.5rem 1rem',
                    ...(activeTab === tab
                      ? { background: 'white', color: '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
                      : { background: 'transparent', color: '#9A9A9A' })
                  }}>
                  {tab === 'filings' ? <FileText className="w-3.5 h-3.5" /> : <BookMarked className="w-3.5 h-3.5" />}
                  {tab === 'filings' ? 'Recent Filings' : 'Policies & Procedures'}
                </button>
              ))}
            </div>

            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={activeTab === 'filings' ? 'Search by company, ticker, or type…' : 'Search policies…'}
                className="w-full rounded-xl border text-sm outline-none"
                style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.5rem 0.75rem 0.5rem 2rem', color: '#1A1A1A' }}
              />
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'filings' ? (
              <motion.div key={`filings-${activeExchange}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'white', borderColor: '#E5E4E0' }}>

                {/* Table header */}
                <div className="grid text-xs font-semibold uppercase tracking-wider"
                  style={{ gridTemplateColumns: '90px 1fr 180px 90px', gap: '0', background: '#F7F6F4', borderBottom: '1px solid #E5E4E0', padding: '0.625rem 1.25rem', color: '#9A9A9A' }}>
                  <span>Date</span>
                  <span>Company / Description</span>
                  <span>Filing Type</span>
                  <span style={{ textAlign: 'right' }}>View</span>
                </div>

                {filings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-text-light text-sm" style={{ padding: '2.5rem' }}>
                    <Search className="w-6 h-6 mb-2" />
                    No filings match your search
                  </div>
                ) : filings.map((f, i) => (
                  <div key={i}
                    className="grid items-start transition-colors"
                    style={{
                      gridTemplateColumns: '90px 1fr 180px 90px',
                      padding: '0.875rem 1.25rem',
                      borderBottom: i < filings.length - 1 ? '1px solid #F0EFED' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-text-light flex-shrink-0" />
                      <span className="text-xs text-text-muted whitespace-nowrap">{f.date.slice(5)}</span>
                    </div>
                    <div style={{ paddingRight: '1rem' }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                        <span className="font-semibold text-sm text-nav">{f.company}</span>
                        <span className="text-xs font-mono rounded px-1.5 py-0.5"
                          style={{ background: '#F7F6F4', color: '#717171' }}>{f.ticker}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{f.description}</p>
                    </div>
                    <div><FilingBadge type={f.type} /></div>
                    <div style={{ textAlign: 'right' }}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                        style={{ color: exchange.color }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between" style={{ background: '#F7F6F4', borderTop: '1px solid #E5E4E0', padding: '0.625rem 1.25rem' }}>
                  <span className="text-xs text-text-light">Showing 5 most recent filings for {exchange.label}</span>
                  <a href="#" className="text-xs font-medium flex items-center gap-1" style={{ color: exchange.color }}>
                    View all on SEDAR+ / EDGAR <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`policies-${activeExchange}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                {policies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-text-light text-sm rounded-2xl border"
                    style={{ padding: '2.5rem', background: 'white', borderColor: '#E5E4E0' }}>
                    <Search className="w-6 h-6 mb-2" />
                    No policies match your search
                  </div>
                ) : policies.map((p, i) => (
                  <div key={i} className="rounded-2xl border transition-all"
                    style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.125rem 1.25rem' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = exchange.color + '66')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E4E0')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.3rem' }}>
                          <Scale className="w-3.5 h-3.5 flex-shrink-0" style={{ color: exchange.color }} />
                          <span className="font-semibold text-sm text-nav">{p.title}</span>
                          <span className="text-xs rounded-full px-2 py-0.5"
                            style={{ background: exchange.bg, color: exchange.color }}>{p.section}</span>
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">{p.description}</p>
                        <p className="text-xs mt-1.5" style={{ color: '#9A9A9A' }}>Last updated: {p.updated}</p>
                      </div>
                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border text-xs font-medium flex-shrink-0 transition-all"
                        style={{ padding: '0.375rem 0.75rem', borderColor: '#E5E4E0', color: '#717171', background: '#F7F6F4' }}
                        onMouseEnter={e => { e.currentTarget.style.background = exchange.bg; e.currentTarget.style.color = exchange.color; e.currentTarget.style.borderColor = exchange.color + '66' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F7F6F4'; e.currentTarget.style.color = '#717171'; e.currentTarget.style.borderColor = '#E5E4E0' }}>
                        <ExternalLink className="w-3 h-3" /> Open
                      </a>
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border flex items-start gap-3" style={{ background: '#FFFBEB', borderColor: '#FDE68A', padding: '0.875rem 1rem' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                    Policy references are provided for informational purposes only and may not reflect the most current version.
                    Always verify directly with the exchange or your securities counsel before making compliance decisions.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Rail: News ────────────────────────────────────────────── */}
        <div className="hidden xl:flex flex-col" style={{ width: '320px', gap: '1rem', flexShrink: 0 }}>

          {/* News feed */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#E5E4E0' }}>
            <div className="flex items-center gap-2" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E4E0' }}>
              <Newspaper className="w-4 h-4" style={{ color: '#E8312A' }} />
              <h3 className="font-semibold text-sm text-nav">Exchange News</h3>
              <span className="ml-auto text-xs text-text-light">Latest</span>
            </div>

            <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {NEWS.map((item, i) => {
                const ex = item.exchange !== 'General' ? EXCHANGES.find(e => e.key === item.exchange) : null
                return (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col gap-1.5 transition-colors"
                    style={{ padding: '0.875rem 1.25rem', borderBottom: i < NEWS.length - 1 ? '1px solid #F0EFED' : 'none', display: 'block', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="flex items-center gap-1.5">
                      {ex ? (
                        <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                          style={{ background: ex.bg, color: ex.color }}>{ex.label}</span>
                      ) : (
                        <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                          style={{ background: '#F7F6F4', color: '#717171' }}>General</span>
                      )}
                      <span className="text-[10px] text-text-light ml-auto">{item.date}</span>
                    </div>
                    <p className="text-xs text-nav leading-relaxed font-medium">{item.headline}</p>
                    <p className="text-[10px] text-text-light">{item.source}</p>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.875rem' }}>
              <Globe className="w-4 h-4" style={{ color: '#1A1A1A' }} />
              <h3 className="font-semibold text-sm text-nav">Official Portals</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'SEDAR+', sub: 'Canadian public filings', url: '#' },
                { label: 'EDGAR', sub: 'US SEC filings database', url: '#' },
                { label: 'TMX Group', sub: 'TSX & TSXV exchange', url: '#' },
                { label: 'CSE Listings', sub: 'CSE issuer directory', url: '#' },
                { label: 'Nasdaq IR', sub: 'Issuer resources & tools', url: '#' },
              ].map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg transition-colors"
                  style={{ padding: '0.5rem 0.75rem', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F4')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div>
                    <p className="text-sm font-medium text-nav">{link.label}</p>
                    <p className="text-xs text-text-light">{link.sub}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-text-light flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border flex items-start gap-2.5" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.875rem 1rem' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-text-light" />
            <p className="text-[11px] leading-relaxed text-text-light">
              IPOReady does not publish or verify filing data. All content is for reference only.
              Verify filings at SEDAR+ or EDGAR and consult your securities counsel.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
