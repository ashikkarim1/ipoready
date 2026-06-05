'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, Shield, Eye,
  Zap, Target, XCircle, Plus, ArrowRight, Clock, Users, FileText,
  BarChart3, Lightbulb, Lock, Unlock, ChevronDown, ChevronUp
} from 'lucide-react'

interface HealthMetric {
  id: string
  name: string
  score: number
  max: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  description: string
  icon: React.ReactNode
}

interface Gap {
  id: string
  severity: 'critical' | 'warning' | 'info'
  folder: string
  issue: string
  impact: string
  timeToFix: string
  recommendation: string
}

interface Moat {
  id: string
  type: 'competitive' | 'financial' | 'technical' | 'market' | 'team'
  title: string
  description: string
  impact: string
  documentsSupporting: string[]
}

interface Recommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  action: string
  rationale: string
  expectedImpact: string
  estimatedEffort: string
}

interface RedFlag {
  id: string
  severity: 'critical' | 'high' | 'medium'
  issue: string
  why: string
  dealKiller: boolean
  mitigation: string
}

export default function DataRoomHealthPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')
  const [language, setLanguage] = useState<'en' | 'fr'>('en')

  // Overall Data Room Health Score (0-100)
  const overallScore = 72
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#2D7A5F' // Green
    if (score >= 70) return '#B45309' // Amber
    if (score >= 50) return '#DC2626' // Red
    return '#7C2D12' // Dark red
  }

  const healthMetrics: HealthMetric[] = [
    {
      id: 'completeness',
      name: language === 'en' ? 'Document Completeness' : 'Complétude des documents',
      score: 85,
      max: 100,
      status: 'good',
      description: language === 'en' ? 'All required documents uploaded and current' : 'Tous les documents requis sont téléchargés et à jour',
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: 'financial-clarity',
      name: language === 'en' ? 'Financial Transparency' : 'Transparence financière',
      score: 68,
      max: 100,
      status: 'warning',
      description: language === 'en' ? 'Financial statements present but lacking detail' : 'Les états financiers sont présents mais manquent de détails',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'team-strength',
      name: language === 'en' ? 'Team Presentation' : 'Présentation de l\'équipe',
      score: 75,
      max: 100,
      status: 'good',
      description: language === 'en' ? 'Team bios complete, credentials strong' : 'Les biographies de l\'équipe sont complètes, les qualifications solides',
      icon: <Users className="w-6 h-6" />
    },
    {
      id: 'market-positioning',
      name: language === 'en' ? 'Market Positioning' : 'Positionnement marché',
      score: 60,
      max: 100,
      status: 'critical',
      description: language === 'en' ? 'Limited competitive positioning docs' : 'Documentation concurrentielle limitée',
      icon: <Target className="w-6 h-6" />
    },
    {
      id: 'governance-controls',
      name: language === 'en' ? 'Governance & Controls' : 'Gouvernance et contrôles',
      score: 78,
      max: 100,
      status: 'good',
      description: language === 'en' ? 'Articles, resolutions, board info present' : 'Articles, résolutions, info conseil présents',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'investor-confidence',
      name: language === 'en' ? 'Investor Confidence' : 'Confiance des investisseurs',
      score: 71,
      max: 100,
      status: 'warning',
      description: language === 'en' ? 'Based on document access patterns and downloads' : 'En fonction des modèles d\'accès et de téléchargement',
      icon: <Eye className="w-6 h-6" />
    }
  ]

  const gaps: Gap[] = [
    {
      id: '1',
      severity: 'critical',
      folder: language === 'en' ? 'Business Plan & Model' : 'Plan d\'affaires et modèle',
      issue: language === 'en' ? 'Market research report missing' : 'Rapport d\'étude de marché manquant',
      impact: language === 'en' ? 'Investors can\'t assess TAM or market opportunity independently' : 'Les investisseurs ne peuvent pas évaluer le TAM indépendamment',
      timeToFix: '2-3 days',
      recommendation: language === 'en' ? 'Add third-party market research (Gartner, IDC, etc.) showing TAM and growth rates' : 'Ajouter des recherches de marché tierces'
    },
    {
      id: '2',
      severity: 'critical',
      folder: language === 'en' ? 'Market & Competitors' : 'Marché et concurrents',
      issue: language === 'en' ? 'Competitive landscape analysis missing' : 'Analyse du paysage concurrentiel manquante',
      impact: language === 'en' ? 'No clear positioning vs competitors - investors worry about defensibility' : 'Aucun positionnement clair vs concurrents',
      timeToFix: '3-5 days',
      recommendation: language === 'en' ? 'Create competitive matrix showing feature comparison, pricing, market share vs top 5 competitors' : 'Créer une matrice concurrentielle'
    },
    {
      id: '3',
      severity: 'warning',
      folder: language === 'en' ? 'Business Plan & Model' : 'Plan d\'affaires et modèle',
      issue: language === 'en' ? 'Financial model lacks sensitivity analysis' : 'Le modèle financier manque d\'analyse de sensibilité',
      impact: language === 'en' ? 'Investors can\'t see downside scenarios or risk mitigation' : 'Les investisseurs ne voient pas les scénarios baissiers',
      timeToFix: '1-2 days',
      recommendation: language === 'en' ? 'Add sensitivity tables (±10%, ±20% revenue/COGS impact on valuation)' : 'Ajouter des tables de sensibilité'
    },
    {
      id: '4',
      severity: 'warning',
      folder: language === 'en' ? 'Product & Technology' : 'Produit et technologie',
      issue: language === 'en' ? 'No customer testimonials or case studies' : 'Pas de témoignages clients ni d\'études de cas',
      impact: language === 'en' ? 'Investors can\'t validate product-market fit from customer voice' : 'Les investisseurs ne peuvent pas valider le PMF',
      timeToFix: '3-7 days',
      recommendation: language === 'en' ? 'Add 3-5 customer case studies (ROI achieved, time to value, net retention)' : 'Ajouter 3-5 études de cas clients'
    },
    {
      id: '5',
      severity: 'info',
      folder: language === 'en' ? 'Team & Leadership' : 'Équipe et leadership',
      issue: language === 'en' ? 'Board member bios incomplete' : 'Les biographies des membres du conseil sont incomplètes',
      impact: language === 'en' ? 'Weakens credibility of board and governance structure' : 'Affaiblit la crédibilité du conseil',
      timeToFix: '1 day',
      recommendation: language === 'en' ? 'Add board member bios including prior boards, exits, industry expertise' : 'Ajouter les biographies des membres du conseil'
    }
  ]

  const moats: Moat[] = [
    {
      id: '1',
      type: 'technical',
      title: language === 'en' ? 'Proprietary AI Engine' : 'Moteur IA propriétaire',
      description: language === 'en' ? 'Patent-pending machine learning for document classification and anomaly detection' : 'ML breveté pour la classification et détection',
      impact: language === 'en' ? 'High switching cost, 6-12 month replication timeline for competitors' : 'Coût de changement élevé',
      documentsSupporting: ['IP Ownership Documentation', 'Patent Filing (Pending)', 'Technical Architecture']
    },
    {
      id: '2',
      type: 'market',
      title: language === 'en' ? 'Early Mover in IPO Tech' : 'Premier arrivant en IPO Tech',
      description: language === 'en' ? 'First platform to unify IPO prep + data room + filing + advisory' : 'Première plateforme unifiée',
      impact: language === 'en' ? 'Brand dominance, customer acquisition advantage, 18-24 month lead on competitors' : 'Avantage d\'acquisition client',
      documentsSupporting: ['Launch Timeline', 'Competitive Landscape', 'Market Research']
    },
    {
      id: '3',
      type: 'team',
      title: language === 'en' ? 'Experienced Leadership' : 'Leadership expérimenté',
      description: language === 'en' ? 'CEO 3x IPO veteran, CFO from Big 4, COO scaled 2 exits to unicorn' : 'CEO 3x IPO, CFO Big 4, COO scaleup',
      impact: language === 'en' ? 'Attracts top talent, strong investor credibility, fast execution' : 'Attire les meilleurs talents',
      documentsSupporting: ['CEO Biography', 'Leadership Team Bios', 'Prior Company Track Records']
    },
    {
      id: '4',
      type: 'financial',
      title: language === 'en' ? 'Unit Economics' : 'Unités économiques',
      description: language === 'en' ? '78% gross margin, 3.5 year payback period, path to profitability in 24 months' : 'Marge brute 78%, rentabilité en 24 mois',
      impact: language === 'en' ? 'De-risks investment, shows sustainable business model, capital efficient' : 'Modèle commercial durable',
      documentsSupporting: ['Financial Model', 'Unit Economics Analysis', 'Customer LTV/CAC']
    }
  ]

  const recommendations: Recommendation[] = [
    {
      id: '1',
      priority: 'high',
      category: language === 'en' ? 'Market Intelligence' : 'Intelligence marché',
      action: language === 'en' ? 'Add comprehensive competitive positioning document' : 'Ajouter document de positionnement concurrentiel',
      rationale: language === 'en' ? 'Every serious investor will ask: "How do you win vs Competitor X?" This document pre-answers that.' : 'Chaque investisseur demandera comment vous gagnez vs concurrents',
      expectedImpact: language === 'en' ? '+12 points on market positioning score, 2x confidence in investment thesis' : '+12 points sur score positionnement',
      estimatedEffort: '3-5 days'
    },
    {
      id: '2',
      priority: 'high',
      category: language === 'en' ? 'Social Proof' : 'Preuve sociale',
      action: language === 'en' ? 'Add 3-5 customer case studies with ROI metrics' : 'Ajouter 3-5 études de cas clients',
      rationale: language === 'en' ? 'Product-market fit is 5x more convincing when told by customers, not founders' : 'Le PMF est 5x plus convaincant venant des clients',
      expectedImpact: language === 'en' ? '+18 points on investor confidence, faster due diligence' : '+18 points confiance investisseurs',
      estimatedEffort: '5-7 days'
    },
    {
      id: '3',
      priority: 'high',
      category: language === 'en' ? 'Financial Clarity' : 'Clarté financière',
      action: language === 'en' ? 'Add sensitivity analysis to financial model' : 'Ajouter analyse de sensibilité au modèle',
      rationale: language === 'en' ? 'Shows you\'ve thought through downside risks and how business holds up in recession' : 'Montre que vous avez pensé aux risques baissiers',
      expectedImpact: language === 'en' ? '+15 points on financial transparency, more confident investors' : '+15 points transparence financière',
      estimatedEffort: '1-2 days'
    },
    {
      id: '4',
      priority: 'medium',
      category: language === 'en' ? 'Governance' : 'Gouvernance',
      action: language === 'en' ? 'Add advisor bios and board meeting minutes (last 2 quarters)' : 'Ajouter biographies des conseillers',
      rationale: language === 'en' ? 'Demonstrates active governance and advisor oversight' : 'Démontre gouvernance active',
      expectedImpact: language === 'en' ? '+8 points on governance score' : '+8 points gouvernance',
      estimatedEffort: '1 day'
    },
    {
      id: '5',
      priority: 'medium',
      category: language === 'en' ? 'Market Evidence' : 'Évidence marché',
      action: language === 'en' ? 'Add third-party analyst reports and market sizing' : 'Ajouter rapports analystes tiers',
      rationale: language === 'en' ? 'Independent validation of TAM and market opportunity is more credible than founder estimates' : 'Validation indépendante du TAM',
      expectedImpact: language === 'en' ? '+10 points on market positioning' : '+10 points positionnement',
      estimatedEffort: '2-3 days'
    }
  ]

  const redFlags: RedFlag[] = [
    {
      id: '1',
      severity: 'critical',
      issue: language === 'en' ? 'No path to profitability shown' : 'Pas de chemin vers la rentabilité',
      why: language === 'en' ? 'Financial model shows perpetual losses, investors worry about capital efficiency' : 'Modèle montre pertes perpétuelles',
      dealKiller: true,
      mitigation: language === 'en' ? 'Update model with operating leverage, margin expansion plan, profitability timeline by Year 5' : 'Mettre à jour modèle avec plan de rentabilité'
    },
    {
      id: '2',
      severity: 'critical',
      issue: language === 'en' ? 'Team turnover: 2 executives left in last 12 months' : 'Rotation équipe: 2 exécutifs partis en 12 mois',
      why: language === 'en' ? 'Signals dysfunction, burn-out, or loss of confidence in leadership' : 'Signale dysfonctionnement ou perte de confiance',
      dealKiller: true,
      mitigation: language === 'en' ? 'Add narrative explaining departures (retirements, external opportunities) and succession plan' : 'Ajouter narrative expliquant les départs'
    },
    {
      id: '3',
      severity: 'high',
      issue: language === 'en' ? 'Key customer concentration: 40% of revenue from 1 customer' : 'Concentration client: 40% du revenu d\'1 client',
      why: language === 'en' ? 'Single customer loss = existential risk to business' : 'Perte d\'un client = risque existentiel',
      dealKiller: false,
      mitigation: language === 'en' ? 'Add customer diversification plan (show other pipeline opportunities, retention agreements with top client)' : 'Ajouter plan de diversification client'
    },
    {
      id: '4',
      severity: 'high',
      issue: language === 'en' ? 'No IP protection strategy documented' : 'Pas de stratégie de protection IP documentée',
      why: language === 'en' ? 'Investors worry about defensibility if you have trade secrets but no patents or NDAs' : 'Investisseurs s\'inquiètent de la défendabilité',
      dealKiller: false,
      mitigation: language === 'en' ? 'Add IP audit (patents, trademarks, trade secrets) and protection strategy' : 'Ajouter audit PI et stratégie'
    },
    {
      id: '5',
      severity: 'medium',
      issue: language === 'en' ? 'Regulatory risk not addressed (data privacy, compliance)' : 'Risque réglementaire non abordé',
      why: language === 'en' ? 'If you store/process sensitive data, compliance failures could be catastrophic' : 'Les défaillances de conformité pourraient être catastrophiques',
      dealKiller: false,
      mitigation: language === 'en' ? 'Add compliance framework (GDPR, CCPA, SOC 2) and risk mitigation plan' : 'Ajouter cadre de conformité'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }
      case 'good': return { bg: '#EAF5F0', text: '#2D7A5F', border: '#A7BEAE' }
      case 'warning': return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }
      case 'critical': return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' }
      default: return { bg: '#F7F6F4', text: '#717171', border: '#E5E4E0' }
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626'
      case 'high': return '#EA580C'
      case 'warning': return '#B45309'
      case 'medium': return '#F59E0B'
      default: return '#1D4ED8'
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="serif text-4xl font-bold text-nav mb-2">
              {language === 'en' ? 'Data Room Health Report' : 'Rapport de santé de la salle données'}
            </h1>
            <p className="text-text-muted">
              {language === 'en'
                ? 'Your investor confidence score, gaps, competitive advantages, and recommendations to strengthen your position'
                : 'Votre score de confiance investisseur, lacunes, avantages concurrentiels et recommandations'}
            </p>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="px-3 py-2 rounded-lg font-semibold text-sm border transition-all"
            style={{ borderColor: '#E5E4E0', background: '#F7F6F4' }}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl border-2"
          style={{
            background: 'white',
            borderColor: getScoreColor(overallScore),
            boxShadow: `0 8px 32px ${getScoreColor(overallScore)}20`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="label text-text-muted mb-2 uppercase tracking-widest">
                {language === 'en' ? 'Overall Data Room Health Score' : 'Score de santé global'}
              </p>
              <h2 className="text-6xl font-black" style={{ color: getScoreColor(overallScore) }}>
                {overallScore}/100
              </h2>
              <p className="text-lg text-text-muted mt-2">
                {overallScore >= 85 && (language === 'en' ? 'Excellent — Investor ready' : 'Excellent — Prêt pour investisseurs')}
                {overallScore >= 70 && overallScore < 85 && (language === 'en' ? 'Good — Address gaps to strengthen' : 'Bon — Adresser les lacunes')}
                {overallScore >= 50 && overallScore < 70 && (language === 'en' ? 'At Risk — Multiple critical gaps' : 'À risque — Lacunes critiques')}
                {overallScore < 50 && (language === 'en' ? 'Weak — Major work required' : 'Faible — Travail majeur requis')}
              </p>
            </div>

            {/* Score Donut */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E4E0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={getScoreColor(overallScore)}
                  strokeWidth="8"
                  strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-black text-2xl" style={{ color: getScoreColor(overallScore) }}>
                  {Math.round((overallScore / 100) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Health Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4 mb-8"
      >
        {healthMetrics.map((metric, i) => {
          const colors = getStatusColor(metric.status)
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border"
              style={{ background: colors.bg, borderColor: colors.border }}
            >
              <div className="flex items-start justify-between mb-3">
                <div style={{ color: colors.text }}>{metric.icon}</div>
                <p className="label-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.6)', color: colors.text }}>
                  {metric.score}/{metric.max}
                </p>
              </div>
              <p className="font-bold text-nav mb-1 text-sm">{metric.name}</p>
              <p className="caption-sm text-text-muted">{metric.description}</p>
              <div className="mt-3 w-full bg-white rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(metric.score / metric.max) * 100}%`, background: colors.text }}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Critical Gaps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'gaps' ? null : 'gaps')}
          className="w-full p-6 rounded-xl border-2 flex items-center justify-between transition-all hover:shadow-md"
          style={{
            background: expandedSection === 'gaps' ? '#FEE2E2' : 'white',
            borderColor: expandedSection === 'gaps' ? '#DC2626' : '#E5E4E0'
          }}
        >
          <div className="flex items-center gap-3 text-left flex-1">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-nav">
                {language === 'en' ? '🚨 Critical Gaps' : '🚨 Lacunes critiques'} ({gaps.length})
              </p>
              <p className="text-sm text-text-muted mt-1">
                {language === 'en' ? 'Missing documents or information that concern investors' : 'Documents manquants qui préoccupent les investisseurs'}
              </p>
            </div>
          </div>
          {expandedSection === 'gaps' ? <ChevronUp /> : <ChevronDown />}
        </button>

        <AnimatePresence>
          {expandedSection === 'gaps' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mt-3"
            >
              {gaps.map((gap, i) => (
                <motion.div
                  key={gap.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border"
                  style={{
                    background: gap.severity === 'critical' ? '#FEE2E2' : gap.severity === 'warning' ? '#FEF3C7' : '#EFF6FF',
                    borderColor: gap.severity === 'critical' ? '#FECACA' : gap.severity === 'warning' ? '#FDE68A' : '#BFDBFE'
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        background: gap.severity === 'critical' ? '#DC2626' : gap.severity === 'warning' ? '#B45309' : '#1D4ED8'
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-nav">
                        {gap.folder}: {gap.issue}
                      </p>
                      <p className="text-sm text-text-muted mt-1">
                        <strong>{language === 'en' ? 'Impact:' : 'Impact:'}</strong> {gap.impact}
                      </p>
                      <p className="text-sm text-text-muted mt-1">
                        <strong>{language === 'en' ? 'Fix time:' : 'Temps de correction:'}</strong> {gap.timeToFix}
                      </p>
                      <p className="text-sm font-semibold text-nav mt-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
                        ✓ {gap.recommendation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Competitive Moats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'moats' ? null : 'moats')}
          className="w-full p-6 rounded-xl border-2 flex items-center justify-between transition-all hover:shadow-md"
          style={{
            background: expandedSection === 'moats' ? '#F0FDF4' : 'white',
            borderColor: expandedSection === 'moats' ? '#2D7A5F' : '#E5E4E0'
          }}
        >
          <div className="flex items-center gap-3 text-left flex-1">
            <Shield className="w-6 h-6 text-green-700 flex-shrink-0" />
            <div>
              <p className="font-bold text-nav">
                {language === 'en' ? '⚔️ Your Competitive Moats' : '⚔️ Vos avantages concurrentiels'} ({moats.length})
              </p>
              <p className="text-sm text-text-muted mt-1">
                {language === 'en' ? 'Why you win vs competitors (highlight these heavily)' : 'Pourquoi vous gagnez vs concurrents'}
              </p>
            </div>
          </div>
          {expandedSection === 'moats' ? <ChevronUp /> : <ChevronDown />}
        </button>

        <AnimatePresence>
          {expandedSection === 'moats' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mt-3"
            >
              {moats.map((moat, i) => (
                <motion.div
                  key={moat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border"
                  style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-green-900">{moat.title}</p>
                      <p className="text-sm text-green-800 mt-1">{moat.description}</p>
                    </div>
                    <span className="label-xs px-2 py-1 rounded-full font-bold" style={{ background: '#DCFCE7', color: '#15803D' }}>
                      {moat.type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-green-700 mt-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <strong>{language === 'en' ? 'Why it matters:' : 'Pourquoi c\'est important:'}</strong> {moat.impact}
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    {language === 'en' ? 'Supporting docs:' : 'Documents d\'appui:'} {moat.documentsSupporting.join(', ')}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'recommendations' ? null : 'recommendations')}
          className="w-full p-6 rounded-xl border-2 flex items-center justify-between transition-all hover:shadow-md"
          style={{
            background: expandedSection === 'recommendations' ? '#EFF6FF' : 'white',
            borderColor: expandedSection === 'recommendations' ? '#1D4ED8' : '#E5E4E0'
          }}
        >
          <div className="flex items-center gap-3 text-left flex-1">
            <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-nav">
                {language === 'en' ? '💡 Recommendations' : '💡 Recommandations'} ({recommendations.length})
              </p>
              <p className="text-sm text-text-muted mt-1">
                {language === 'en' ? 'Specific actions to strengthen investor confidence' : 'Actions pour renforcer la confiance investisseur'}
              </p>
            </div>
          </div>
          {expandedSection === 'recommendations' ? <ChevronUp /> : <ChevronDown />}
        </button>

        <AnimatePresence>
          {expandedSection === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mt-3"
            >
              {recommendations.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border"
                  style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-blue-900">{rec.action}</p>
                        <span
                          className="label-xs px-2 py-0.5 rounded-full font-bold"
                          style={{
                            background: rec.priority === 'high' ? '#FEE2E2' : rec.priority === 'medium' ? '#FEF3C7' : '#F0FDF4',
                            color: rec.priority === 'high' ? '#DC2626' : rec.priority === 'medium' ? '#B45309' : '#15803D'
                          }}
                        >
                          {rec.priority === 'high' ? '🔴 High' : rec.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">{rec.rationale}</p>
                      <div className="grid md:grid-cols-2 gap-2 mt-2 text-xs text-blue-700">
                        <div>
                          <strong>{language === 'en' ? 'Expected impact:' : 'Impact attendu:'}</strong> {rec.expectedImpact}
                        </div>
                        <div>
                          <strong>{language === 'en' ? 'Effort:' : 'Effort:'}</strong> {rec.estimatedEffort}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Red Flags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'flags' ? null : 'flags')}
          className="w-full p-6 rounded-xl border-2 flex items-center justify-between transition-all hover:shadow-md"
          style={{
            background: expandedSection === 'flags' ? '#FEE2E2' : 'white',
            borderColor: expandedSection === 'flags' ? '#DC2626' : '#E5E4E0'
          }}
        >
          <div className="flex items-center gap-3 text-left flex-1">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-nav">
                {language === 'en' ? '⛔ Red Flags' : '⛔ Drapeaux rouges'} ({redFlags.filter(f => f.dealKiller).length} {language === 'en' ? 'deal-killers' : 'tueurs d\'affaires'})
              </p>
              <p className="text-sm text-text-muted mt-1">
                {language === 'en' ? 'Issues that might kill investor interest (must fix)' : 'Problèmes qui pourraient tuer l\'intérêt des investisseurs'}
              </p>
            </div>
          </div>
          {expandedSection === 'flags' ? <ChevronUp /> : <ChevronDown />}
        </button>

        <AnimatePresence>
          {expandedSection === 'flags' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mt-3"
            >
              {redFlags.map((flag, i) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border"
                  style={{
                    background: flag.severity === 'critical' ? '#FEE2E2' : flag.severity === 'high' ? '#FFEDD5' : '#FEF3C7',
                    borderColor: flag.severity === 'critical' ? '#FECACA' : flag.severity === 'high' ? '#FEED7D' : '#FDE68A'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <XCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: getSeverityColor(flag.severity) }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-nav">{flag.issue}</p>
                      <p className="text-sm text-text-muted mt-1">{flag.why}</p>
                      {flag.dealKiller && (
                        <p className="text-sm font-bold text-red-700 mt-2">🚨 {language === 'en' ? 'DEAL KILLER' : 'TUEUR D\'AFFAIRES'}</p>
                      )}
                      <p className="text-sm font-semibold mt-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
                        <strong>{language === 'en' ? 'Mitigation:' : 'Mitigation:'}</strong> {flag.mitigation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
