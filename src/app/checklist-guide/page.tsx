'use client'
import { motion } from 'framer-motion'
import { Printer, Clock, CheckSquare, Shield, Link2, AlertCircle } from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────────────────

const CRITICAL_DEADLINES = [
  { label: 'TSXV filing to receipt',              value: '4–6 weeks',                   note: 'After application submission' },
  { label: 'NI 43-101 report currency',           value: 'Within 45 days',              note: 'Of prospectus filing date' },
  { label: 'PIF submission lead time',            value: '30 days min.',                note: 'Before listing application' },
  { label: 'Audited fiscal years required',       value: '2 years',                     note: 'CPAB-registered auditor' },
  { label: 'Escrow period (Tier 2)',              value: '18 months',                   note: 'From listing date' },
  { label: 'Material Change Report deadline',     value: '10 days',                     note: 'From date of change' },
  { label: 'First annual filing post-listing',    value: '120 days',                    note: 'After fiscal year-end' },
  { label: 'First quarterly filing deadline',     value: '45 days',                     note: 'After quarter-end' },
]

const TIER_REQUIREMENTS = [
  { requirement: 'Working Capital', tier1: '≥ CA$2M',       tier2: '≥ CA$750K' },
  { requirement: 'Net Assets',      tier1: 'Varies by type', tier2: 'Varies by type' },
  { requirement: 'Dist. Securities',tier1: '≥ 1,000,000',   tier2: '≥ 500,000' },
  { requirement: 'Public Float',    tier1: '≥ 20%',          tier2: '≥ 20%' },
  { requirement: 'Min. Shareholders',tier1: '≥ 200',         tier2: '≥ 150' },
]

const GOVERNANCE_ITEMS = [
  { item: 'Board: Minimum 3 directors, majority independent (Tier 1)',               ref: 'TSXV Policy 3.1' },
  { item: 'Audit Committee: ≥3 members, all financially literate',                   ref: 'NI 52-110' },
  { item: 'Audit Committee Financial Expert: At least 1 required',                   ref: 'NI 52-110 s.3' },
  { item: 'Corporate Secretary appointed',                                            ref: 'CBCA / BCBCA' },
  { item: 'Insider Trading Policy adopted',                                           ref: 'TSXV Policy 4.4' },
  { item: 'Corporate Disclosure Policy adopted',                                      ref: 'NI 51-102' },
  { item: 'Advance Notice Policy adopted',                                            ref: 'Best Practice' },
  { item: 'CEO/CFO financial certifications (NI 52-109) in place',                   ref: 'NI 52-109' },
  { item: 'Management Information Circular drafted',                                  ref: 'NI 54-101' },
  { item: 'Stock Option Plan adopted and approved by shareholders',                   ref: 'TSXV Policy 4.4' },
]

const KEY_CONTACTS = [
  { label: 'TSXV Listings',  url: 'https://tsxventure.com/listings',           display: 'tsxventure.com/listings' },
  { label: 'SEDAR+',         url: 'https://sedarplus.ca',                       display: 'sedarplus.ca' },
  { label: 'SEDI',           url: 'https://sedi.ca',                            display: 'sedi.ca' },
  { label: 'NI 52-110',      url: '#',                                           display: 'legislation.gov.bc.ca' },
  { label: 'OSC',            url: 'https://osc.ca',                             display: 'osc.ca' },
  { label: 'BCSC',           url: 'https://bcsc.bc.ca',                         display: 'bcsc.bc.ca' },
  { label: 'CIRO',           url: '#',                                           display: 'mfda.ca (CIRO)' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function ChecklistGuidePage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }} className="sm:px-6 lg:px-0">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 26px)', fontWeight: 900, color: '#1A1A1A', marginBottom: '6px', lineHeight: 1.2 }}>
              TSXV IPO Compliance Quick Reference
            </h1>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '10px' }}>
              Press Release &amp; Compliance cheat sheet for the full TSXV listing process
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D4ED8' }}>Updated May 2026 · Based on TSXV Policy 2.1</span>
            </div>
          </div>
          <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="flex-shrink-0"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '12px 18px', minHeight: '48px', borderRadius: '10px',
              background: '#1A1A1A', color: 'white',
              fontWeight: 700, fontSize: 'clamp(12px, 2vw, 13px)',
              border: 'none', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Printer style={{ width: '14px', height: '14px' }} />
            Print / Export PDF
          </button>
        </div>
      </motion.div>

      {/* ── 2×2 grid ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '2rem' }}>

        {/* ── Card 1: Critical Deadlines ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          style={{ background: 'white', border: '2px solid #FCA5A5', borderRadius: '16px', padding: '24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '15px', height: '15px', color: '#DC2626' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>Critical Deadlines</p>
              <p style={{ fontSize: '11px', color: '#9A9A9A' }}>Key time constraints you cannot miss</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {CRITICAL_DEADLINES.map((item, i) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                padding: '10px 0',
                borderBottom: i < CRITICAL_DEADLINES.length - 1 ? '1px solid #FEF2F2' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 500, lineHeight: 1.4 }}>{item.label}</p>
                  <p style={{ fontSize: '11px', color: '#9A9A9A', marginTop: '1px' }}>{item.note}</p>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Card 2: Minimum Requirements ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', border: '2px solid #93C5FD', borderRadius: '16px', padding: '24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle style={{ width: '15px', height: '15px', color: '#1D4ED8' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>Minimum Requirements</p>
              <p style={{ fontSize: '11px', color: '#9A9A9A' }}>Tier 1 vs Tier 2 at listing</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #EFF6FF' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Requirement</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tier 1</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#2D7A5F', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tier 2</th>
              </tr>
            </thead>
            <tbody>
              {TIER_REQUIREMENTS.map((row, i) => (
                <tr key={row.requirement} style={{ borderBottom: i < TIER_REQUIREMENTS.length - 1 ? '1px solid #EFF6FF' : 'none' }}>
                  <td style={{ padding: '10px 8px', color: '#1A1A1A', fontWeight: 500 }}>{row.requirement}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: '#1D4ED8' }}>{row.tier1}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: '#2D7A5F' }}>{row.tier2}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <p style={{ fontSize: '12px', color: '#1D4ED8', lineHeight: 1.5 }}>
              <strong>Note:</strong> Requirements vary by industry classification (Technology, Mining, Life Sciences, etc.).
              Confirm with your TSXV sponsor before relying on these figures.
            </p>
          </div>
        </motion.div>

        {/* ── Card 3: Governance Checklist ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          style={{ background: 'white', border: '2px solid #86EFAC', borderRadius: '16px', padding: '24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare style={{ width: '15px', height: '15px', color: '#16A34A' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>Governance Checklist</p>
              <p style={{ fontSize: '11px', color: '#9A9A9A' }}>Board &amp; corporate governance essentials</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {GOVERNANCE_ITEMS.map((item, i) => (
              <div key={item.item} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '9px 0',
                borderBottom: i < GOVERNANCE_ITEMS.length - 1 ? '1px solid #F0FDF4' : 'none',
              }}>
                {/* Decorative unchecked box */}
                <div style={{
                  width: '16px', height: '16px', borderRadius: '4px',
                  border: '2px solid #86EFAC', flexShrink: 0, marginTop: '1px',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: '#1A1A1A', lineHeight: 1.45 }}>{item.item}</p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#9A9A9A', flexShrink: 0, paddingTop: '2px' }}>{item.ref}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Card 4: Key Contacts & Resources ──────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ background: 'white', border: '2px solid #FCD34D', borderRadius: '16px', padding: '24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link2 style={{ width: '15px', height: '15px', color: '#D97706' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>Key Contacts &amp; Resources</p>
              <p style={{ fontSize: '11px', color: '#9A9A9A' }}>Regulators, filing systems &amp; legislation</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {KEY_CONTACTS.map((contact, i) => (
              <div key={contact.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                padding: '10px 0',
                borderBottom: i < KEY_CONTACTS.length - 1 ? '1px solid #FFFBEB' : 'none',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', width: '120px', flexShrink: 0 }}>
                  {contact.label}
                </span>
                <a
                  href={contact.url}
                  target={contact.url !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px', color: '#D97706', fontWeight: 500,
                    textDecoration: 'none', flex: 1,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B45309')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#D97706')}
                >
                  {contact.display}
                </a>
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Link2 style={{ width: '10px', height: '10px', color: '#D97706' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p style={{ fontSize: '12px', color: '#92400E', lineHeight: 1.5 }}>
              <strong>Disclaimer:</strong> This quick reference is for informational purposes only and does not constitute
              legal or regulatory advice. Confirm all requirements with qualified legal counsel and your TSXV sponsor.
            </p>
          </div>
        </motion.div>

      </div>

      {/* ── Print notice ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', background: '#F7F6F4', border: '1px solid #E5E4E0', marginBottom: '2rem' }}>
        <Printer style={{ width: '14px', height: '14px', color: '#9A9A9A' }} />
        <p style={{ fontSize: '12px', color: '#9A9A9A' }}>
          Click &quot;Print / Export PDF&quot; above to save this reference as a PDF — optimized for A4 &amp; Letter.
        </p>
      </motion.div>

    </div>
  )
}
