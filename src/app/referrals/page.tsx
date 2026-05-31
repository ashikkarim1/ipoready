'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gift, Copy, Check, DollarSign, Users, TrendingUp,
  Clock, CheckCircle2, ArrowRight, Mail, Share2,
  Zap, X, Loader2, RefreshCw, MousePointer
} from 'lucide-react'

type ReferralStatus = 'pending' | 'signed_up' | 'converted' | 'expired'
type PayoutStatus   = 'paid' | 'pending' | 'processing'

interface Referral {
  id: string; company_name: string | null; referred_email: string | null
  created_at: string; status: ReferralStatus; plan: string | null
  monthly_value_cad: number; commission_monthly_cad: number
  commission_paid_cad: number; commission_pending_cad: number
  next_payment_date: string | null; months_remaining: number
}
interface Payout {
  id: string; created_at: string; amount_cad: number
  status: PayoutStatus; method: string; stripe_transfer_id: string | null
}
interface Stats {
  converted: number; signedUp: number; pending: number
  totalPaidCAD: number; totalPendingCAD: number
  monthlyRecurring: number; totalClicks: number
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  const map: Record<ReferralStatus, { label: string; bg: string; color: string; border: string }> = {
    pending:   { label: 'Invited',   bg: '#F7F6F4', color: '#717171', border: '#E5E4E0' },
    signed_up: { label: 'Signed Up', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    converted: { label: 'Paying',    bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
    expired:   { label: 'Expired',   bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  }
  const { label, bg, color, border } = map[status]
  return <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: bg, color, border: `1px solid ${border}` }}>{label}</span>
}
function PayoutBadge({ status }: { status: PayoutStatus }) {
  if (status === 'paid')       return <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}>Paid</span>
  if (status === 'processing') return <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }}>Processing</span>
  return <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>Upcoming</span>
}
function fmt(n: number) { return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }) }
function fmtDate(s: string) { return new Date(s).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function ReferralsPage() {
  const [copied, setCopied]             = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [leadEmail, setLeadEmail]       = useState('')
  const [leadCompany, setLeadCompany]   = useState('')
  const [leadBusy, setLeadBusy]         = useState(false)
  const [leadDone, setLeadDone]         = useState(false)
  const [loading, setLoading]           = useState(true)
  const [referralUrl, setReferralUrl]   = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals]       = useState<Referral[]>([])
  const [payouts, setPayouts]           = useState<Payout[]>([])
  const [stats, setStats]               = useState<Stats>({ converted:0,signedUp:0,pending:0,totalPaidCAD:0,totalPendingCAD:0,monthlyRecurring:0,totalClicks:0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [r, s] = await Promise.all([fetch('/api/referrals'), fetch('/api/referrals/stats')])
      const rd = await r.json(); const sd = await s.json()
      setReferralUrl(rd.referralUrl ?? ''); setReferralCode(rd.referralCode ?? '')
      setReferrals(rd.referrals ?? []); setPayouts(rd.payouts ?? []); setStats(sd)
    } catch(e){ console.error(e) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  function copy() { navigator.clipboard.writeText(referralUrl); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  async function submitLead() {
    if (!leadEmail && !leadCompany) return
    setLeadBusy(true)
    await fetch('/api/referrals',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ referredEmail:leadEmail, companyName:leadCompany }) })
    setLeadDone(true); setLeadEmail(''); setLeadCompany('')
    setTimeout(()=>{ setLeadDone(false); setShowModal(false); load() },1800)
    setLeadBusy(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:'900px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
        <div>
          <h1 className="serif text-2xl" style={{ color:'#1A1A1A', marginBottom:'0.25rem' }}>Partner Referrals</h1>
          <p className="text-sm" style={{ color:'#717171' }}>Earn 15% monthly commission for every company you refer — for 12 months.</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0" style={{ background:'#1A1A1A', color:'white' }}>
          <Mail className="w-4 h-4" /> Refer a Company
        </button>
      </div>

      {/* Referral link card */}
      <div className="rounded-2xl overflow-hidden" style={{ background:'#1A1A1A' }}>
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(232,49,42,0.18)', border:'1px solid rgba(232,49,42,0.3)' }}>
              <Gift className="w-4 h-4" style={{ color:'#E8312A' }} />
            </div>
            <p className="font-bold text-white text-sm">Your Personalized Referral Link</p>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm truncate" style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)' }}>
              {loading ? '…' : referralUrl}
            </div>
            <button onClick={copy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0" style={{ background:copied?'#15803D':'#E8312A', color:'white' }}>
              {copied ? <><Check className="w-4 h-4"/>Copied!</> : <><Copy className="w-4 h-4"/>Copy</>}
            </button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.45)' }}><MousePointer className="w-3.5 h-3.5"/>{loading?'…':stats.totalClicks} clicks</div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.45)' }}><Users className="w-3.5 h-3.5"/>{loading?'…':stats.converted} paying clients</div>
            {referralCode && <div className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.45)' }}><Share2 className="w-3.5 h-3.5"/>Code: <span className="font-mono" style={{ color:'#E8312A' }}>{referralCode}</span></div>}
          </div>
        </div>
        <div className="px-6 py-3 flex items-center gap-3" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.3)' }}>Share via</span>
          {[
            { label:'Email',    href:`mailto:?subject=IPOReady — Your IPO roadmap in 5 minutes&body=Check this out: ${encodeURIComponent(referralUrl)}` },
            { label:'LinkedIn', href:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}` },
            { label:'X / Twitter', href:`https://twitter.com/intent/tweet?text=Preparing+for+a+listing%3F+Try+IPOReady:&url=${encodeURIComponent(referralUrl)}` },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.13)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.75rem' }}>
        {[
          { label:'Total Earned',       value:loading?'…':fmt(stats.totalPaidCAD),              icon:DollarSign, color:'#15803D', bg:'#F0FDF4' },
          { label:'Pending Commission', value:loading?'…':fmt(stats.totalPendingCAD),            icon:Clock,      color:'#B45309', bg:'#FFFBEB' },
          { label:'Monthly Recurring',  value:loading?'…':fmt(stats.monthlyRecurring),           icon:TrendingUp, color:'#E8312A', bg:'#FDECEB' },
          { label:'Annual Projected',   value:loading?'…':fmt(stats.monthlyRecurring * 12),      icon:Zap,        color:'#1D4ED8', bg:'#EFF6FF' },
        ].map(({ label, value, icon:Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background:'white', border:'1px solid #E5E4E0' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background:bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="font-black text-xl" style={{ color:'#1A1A1A' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color:'#9A9A9A' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Referrals table */}
      <div className="rounded-2xl overflow-hidden" style={{ background:'white', border:'1px solid #E5E4E0' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #F0EFED' }}>
          <div>
            <p className="font-bold text-sm" style={{ color:'#1A1A1A' }}>Your Referrals</p>
            <p className="text-xs mt-0.5" style={{ color:'#9A9A9A' }}>{stats.converted} paying · {stats.signedUp} signed up · {stats.pending} invited</p>
          </div>
          <button onClick={load} className="p-1.5 rounded-lg" style={{ color:'#9A9A9A' }}><RefreshCw className="w-4 h-4"/></button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color:'#9A9A9A' }}/></div>
        ) : referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background:'#F7F6F4', border:'1px solid #E5E4E0' }}>
              <Gift className="w-5 h-5" style={{ color:'#9A9A9A' }}/>
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color:'#1A1A1A' }}>No referrals yet</p>
            <p className="text-xs mb-4" style={{ color:'#9A9A9A', maxWidth:'280px' }}>Share your link or manually add a lead to get started.</p>
            <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background:'#1A1A1A', color:'white' }}>
              <Mail className="w-4 h-4"/> Refer a Company
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #F0EFED' }}>
                  {['Company','Email','Date','Status','Plan','Monthly','Paid','Pending'].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold px-4 py-3" style={{ color:'#9A9A9A', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referrals.map((r,i)=>(
                  <tr key={r.id} style={{ borderBottom:i<referrals.length-1?'1px solid #F7F6F4':'none' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='#FAFAFA')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color:'#1A1A1A' }}>{r.company_name??'—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color:'#717171' }}>{r.referred_email??'—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color:'#9A9A9A', whiteSpace:'nowrap' }}>{fmtDate(r.created_at)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
                    <td className="px-4 py-3 text-sm" style={{ color:'#717171' }}>{r.plan??'—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color:'#1A1A1A' }}>{r.commission_monthly_cad>0?fmt(r.commission_monthly_cad):'—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color:'#15803D' }}>{r.commission_paid_cad>0?fmt(r.commission_paid_cad):'—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color:'#B45309' }}>{r.commission_pending_cad>0?fmt(r.commission_pending_cad):'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts */}
      <div className="rounded-2xl overflow-hidden" style={{ background:'white', border:'1px solid #E5E4E0' }}>
        <div className="px-6 py-4" style={{ borderBottom:'1px solid #F0EFED' }}>
          <p className="font-bold text-sm" style={{ color:'#1A1A1A' }}>Payout History</p>
          <p className="text-xs mt-0.5" style={{ color:'#9A9A9A' }}>Commissions paid to your account</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" style={{ color:'#9A9A9A' }}/></div>
        ) : payouts.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm" style={{ color:'#9A9A9A' }}>No payouts yet — commissions appear here once processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #F0EFED' }}>
                  {['Date','Amount','Status','Method','Reference'].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold px-4 py-3" style={{ color:'#9A9A9A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p,i)=>(
                  <tr key={p.id} style={{ borderBottom:i<payouts.length-1?'1px solid #F7F6F4':'none' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='#FAFAFA')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td className="px-4 py-3 text-sm" style={{ color:'#1A1A1A' }}>{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color:'#1A1A1A' }}>{fmt(p.amount_cad)}</td>
                    <td className="px-4 py-3"><PayoutBadge status={p.status}/></td>
                    <td className="px-4 py-3 text-sm" style={{ color:'#717171' }}>{p.method}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color:'#9A9A9A' }}>{p.stripe_transfer_id??'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commission structure */}
      <div className="rounded-2xl p-5" style={{ background:'#F7F6F4', border:'1px solid #E5E4E0' }}>
        <p className="font-bold text-sm mb-3" style={{ color:'#1A1A1A' }}>Commission Structure</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
          {[
            { icon:'💰', title:'15% Monthly',     body:'Earn 15% of the monthly subscription for every client you bring in.' },
            { icon:'📅', title:'12-Month Window', body:'Commissions paid monthly for a full year from the client\'s first payment.' },
            { icon:'🏦', title:'Bank Transfer',   body:'Paid monthly by bank transfer. No minimums, no thresholds.' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background:'white', border:'1px solid #E5E4E0' }}>
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color:'#1A1A1A' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color:'#717171' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.5)' }}
            onClick={e=>{ if(e.target===e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ opacity:0, scale:0.96, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
              className="rounded-2xl overflow-hidden w-full max-w-md"
              style={{ background:'white', border:'1px solid #E5E4E0', boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #F0EFED' }}>
                <p className="font-bold text-sm" style={{ color:'#1A1A1A' }}>Refer a Company</p>
                <button onClick={()=>setShowModal(false)} style={{ color:'#9A9A9A' }}><X className="w-4 h-4"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color:'#9A9A9A' }}>Company Name</label>
                  <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border:'1px solid #E5E4E0', background:'#FAFAFA', color:'#1A1A1A' }}
                    onFocus={e=>{e.target.style.borderColor='#1A1A1A';e.target.style.boxShadow='0 0 0 3px rgba(26,26,26,0.07)'}}
                    onBlur={e=>{e.target.style.borderColor='#E5E4E0';e.target.style.boxShadow='none'}}
                    placeholder="Acme Corp" value={leadCompany} onChange={e=>setLeadCompany(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color:'#9A9A9A' }}>Contact Email</label>
                  <input type="email" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border:'1px solid #E5E4E0', background:'#FAFAFA', color:'#1A1A1A' }}
                    onFocus={e=>{e.target.style.borderColor='#1A1A1A';e.target.style.boxShadow='0 0 0 3px rgba(26,26,26,0.07)'}}
                    onBlur={e=>{e.target.style.borderColor='#E5E4E0';e.target.style.boxShadow='none'}}
                    placeholder="cfo@company.com" value={leadEmail} onChange={e=>setLeadEmail(e.target.value)} />
                </div>
                <div className="pt-1 flex gap-2">
                  <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background:'#F7F6F4', color:'#717171', border:'1px solid #E5E4E0' }}>Cancel</button>
                  <button onClick={submitLead} disabled={leadBusy||(!leadEmail&&!leadCompany)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                    style={{ background:leadDone?'#15803D':'#1A1A1A', color:'white' }}>
                    {leadBusy?<Loader2 className="w-4 h-4 animate-spin"/>:leadDone?<><CheckCircle2 className="w-4 h-4"/>Added!</>:<><ArrowRight className="w-4 h-4"/>Add Referral</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
