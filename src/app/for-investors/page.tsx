'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  Target, TrendingUp, Zap, Users, Lock, CheckCircle2, ArrowRight,
  BarChart3, Star, Globe, DollarSign, Clock, Briefcase, Filter,
  AlertCircle, Mail, Calendar, Eye, Building2, LineChart
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
}

export default function ForInvestorsPage() {
  const router = useRouter()

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      <Header />

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden px-6 py-16 md:py-32"
        style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' }}
      >
        <div className="max-w-6xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-4 md:mb-6 inline-block"
          >
            <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <p className="text-xs md:text-sm font-semibold">The IPO-Bound Deal Flow Network</p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight"
          >
            Deal Flow You Can't Get Anywhere Else
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base md:text-xl text-white/80 mb-6 md:mb-8 max-w-3xl mx-auto"
          >
            IPOReady is the only platform with real-time visibility into companies actually executing IPO/RTO journeys. Get notified when opportunities match your thesis. No noise. Just signal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/investor/signup')}
              className="px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2"
              style={{ background: '#E8312A', color: '#FFFFFF' }}
            >
              Get Early Access
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/for-investors/data')}
              className="px-8 py-4 rounded-full font-bold text-lg border-2 border-white text-white hover:bg-white/10 transition"
            >
              See Our Data
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/for-investors/datasets')}
              className="px-8 py-4 rounded-full font-bold text-lg border-2 border-white text-white hover:bg-white/10 transition"
            >
              Data Transparency
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-sm text-white/60 mt-8"
          >
            Free for investors. No credit card required.
          </motion.p>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-success/10 blur-3xl opacity-20" />
      </motion.section>

      {/* VALUE PROPOSITION GRID */}
      <section className="px-6 py-20 md:py-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="serif text-4xl md:text-5xl font-bold text-nav mb-4">
            Why IPOReady for Investors
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Every other platform gives you generic startup deal flow. We give you the companies actually executing IPO journeys.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Card 1: Real Signal */}
          <motion.div
            variants={item}
            className="card p-8 border-2 border-accent/20 hover:border-accent/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-error-soft flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold text-nav text-xl mb-3">Real Signal, Zero Noise</h3>
            <p className="text-text-muted leading-relaxed mb-4">
              Every company on IPOReady has verified intent to IPO/RTO. No pre-revenue startups. No acquihires. Just companies with real execution momentum and exit potential.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Only 5-10% of startups get this far. You see the best.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Pre-screened by exchange requirements & compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Real metrics: revenue, growth, profitability</span>
              </li>
            </ul>
          </motion.div>

          {/* Card 2: Proprietary Data */}
          <motion.div
            variants={item}
            className="card p-8 border-2 border-success/20 hover:border-success/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-success-soft flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-bold text-nav text-xl mb-3">Proprietary IPO Metrics</h3>
            <p className="text-text-muted leading-relaxed mb-4">
              Our PACE™ score predicts listing readiness with institutional accuracy. See exactly where each company stands on their journey.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>PACE™ Score: 0-100 readiness metric</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Estimated listing date forecast</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Compliance & regulatory progress tracking</span>
              </li>
            </ul>
          </motion.div>

          {/* Card 3: Smart Alerts */}
          <motion.div
            variants={item}
            className="card p-8 border-2 border-info/20 hover:border-info/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-info-soft flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-info" />
            </div>
            <h3 className="font-bold text-nav text-xl mb-3">Real-Time Deal Alerts</h3>
            <p className="text-text-muted leading-relaxed mb-4">
              Get notified the instant a company matches your investment criteria and launches a raise. Capture momentum before deals are full.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Real-time alerts (within 1 hour of launch)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Custom filters: stage, sector, geography, check size</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Weekly digest of all new opportunities</span>
              </li>
            </ul>
          </motion.div>

          {/* Card 4: Direct Pipeline */}
          <motion.div
            variants={item}
            className="card p-8 border-2 border-warning/20 hover:border-warning/40 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-warning-soft flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-bold text-nav text-xl mb-3">Direct Founder Access</h3>
            <p className="text-text-muted leading-relaxed mb-4">
              Skip the gatekeepers. Message founders directly through IPOReady. Set meetings. Track conversations.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>In-app messaging with founders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>One-click meeting scheduling</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>CRM pipeline tracking for your deals</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS / SOCIAL PROOF */}
      <section
        className="px-6 py-20 md:py-32"
        style={{ background: '#1A1A1A', color: '#FFFFFF' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Platform Built for Institutional Capital
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Used by VCs, PEs, debt funds, and strategic investors looking for IPO-bound companies before they're household names.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={item} className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">500+</div>
              <p className="text-white/70">IPO-Ready Companies</p>
              <p className="text-sm text-white/50 mt-1">Actively executing their journeys</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <div className="text-5xl font-bold text-success mb-2">$50B+</div>
              <p className="text-white/70">In Pending Raises</p>
              <p className="text-sm text-white/50 mt-1">Available deal flow this year</p>
            </motion.div>
            <motion.div variants={item} className="text-center">
              <div className="text-5xl font-bold text-info mb-2">98%</div>
              <p className="text-white/70">Institutional Grade</p>
              <p className="text-sm text-white/50 mt-1">Compliance verified</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EXCLUSIVITY / EARLY ADOPTER */}
      <section className="px-6 py-20 md:py-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="card p-12 border-2 border-accent/40 relative overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-6 h-6 text-accent" />
              <span className="font-bold text-accent text-sm">EARLY ADOPTER ADVANTAGE</span>
            </div>

            <h2 className="serif text-4xl font-bold text-nav mb-4">
              Be Among the First Institutional Investors
            </h2>

            <p className="text-xl text-text-muted mb-8 max-w-3xl">
              IPOReady's investor network is young. Early members get:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-nav mb-1">First Look at Deals</h3>
                  <p className="text-text-muted text-sm">See companies before other investors get notifications</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-nav mb-1">Founding Member Status</h3>
                  <p className="text-text-muted text-sm">Featured on investor directory, lifetime early adopter pricing</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h3 className="font-bold text-nav mb-1">Build Your Network</h3>
                  <p className="text-text-muted text-sm">Connect with other quality institutional investors</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-nav mb-1">Shape the Platform</h3>
                  <p className="text-text-muted text-sm">Help us build investor features (we listen to early members)</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/investor/signup')}
              className="btn btn-accent text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
            >
              Get Early Access Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:py-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="serif text-4xl md:text-5xl font-bold text-nav mb-4">
            How It Works
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Get started in minutes. Real deal flow in your inbox by tomorrow.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {[
            {
              num: '1',
              title: 'Sign Up (2 minutes)',
              desc: 'Tell us your investment thesis: stage, sectors, check size, geography.'
            },
            {
              num: '2',
              title: 'Set Your Criteria',
              desc: 'Configure deal alerts. Which stages? Which sectors? How much capital per check?'
            },
            {
              num: '3',
              title: 'Get Real-Time Alerts',
              desc: 'When a company matches your criteria and launches a raise, we notify you within 1 hour.'
            },
            {
              num: '4',
              title: 'Connect with Founders',
              desc: 'Message founders directly. Set meetings. Track conversations in your IPOReady dashboard.'
            },
            {
              num: '5',
              title: 'Track Your Pipeline',
              desc: 'Log your investments, track milestones, watch companies go public.'
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              variants={item}
              className="flex gap-6 items-start"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-2xl text-accent">{step.num}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-nav text-xl mb-2">{step.title}</h3>
                <p className="text-text-muted">{step.desc}</p>
              </div>
              {i < 4 && (
                <div className="hidden md:flex w-1 h-24 bg-gradient-to-b from-accent to-transparent" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA SECTION */}
      <section
        className="px-6 py-20 md:py-32"
        style={{ background: '#1A1A1A' }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Stop Missing IPO-Bound Deals
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-xl text-white/70 mb-8 max-w-3xl mx-auto"
          >
            The best companies IPO quietly. They're on IPOReady, raising capital, hitting milestones. Get first look at institutional-grade deal flow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/investor/signup')}
              className="px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2"
              style={{ background: '#E8312A', color: '#FFFFFF' }}
            >
              Join as Investor
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-sm text-white/50 mt-8"
          >
            Free for early adopters. No credit card. Join 500+ institutional investors.
          </motion.p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-text-muted text-sm">
          <p>IPOReady © 2026. The IPO-bound company intelligence platform.</p>
        </div>
      </footer>
    </div>
  )
}
