'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Eye,
  Star,
  Clock,
  AlertCircle,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react'
import type { GuidanceDetail, ProspectusExample, ExampleQuality } from '@/lib/types/guidance.types'
import { getDetailedGuidance } from '@/lib/guidance-data'
import { ComparisonViewer } from './ComparisonViewer'
import { TemplateCustomizer } from './TemplateCustomizer'

interface GuidanceDetailViewProps {
  articleId: string
  onBack: () => void
}

export function GuidanceDetailView({ articleId, onBack }: GuidanceDetailViewProps) {
  const guidance = getDetailedGuidance(articleId)
  const [selectedExample, setSelectedExample] = useState<ExampleQuality>('strong')
  const [showWhyItMatters, setShowWhyItMatters] = useState(true)
  const [showBenchmarks, setShowBenchmarks] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [copiedExample, setCopiedExample] = useState(false)

  if (!guidance) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Guidance not found</p>
      </motion.div>
    )
  }

  const currentExample = guidance.examples.find((ex) => ex.quality === selectedExample)

  const handleCopyExample = () => {
    if (currentExample) {
      navigator.clipboard.writeText(currentExample.text)
      setCopiedExample(true)
      setTimeout(() => setCopiedExample(false), 2000)
    }
  }

  // Quality progression order
  const qualityOrder: ExampleQuality[] = ['weak', 'passable', 'defendable', 'strong']
  const availableQualities = qualityOrder.filter((quality) =>
    guidance.examples.some((ex) => ex.quality === quality)
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header with Back Button */}
      <div className="mb-8">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Library
        </motion.button>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{guidance.article.title}</h1>
            <p className="text-lg text-gray-600">{guidance.article.description}</p>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{guidance.article.readingTimeMinutes} min read</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-5 h-5" />
            <span>{guidance.article.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(guidance.article.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span>{guidance.article.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200"
      >
        <h2 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
          <Zap className="w-5 h-5" />
          Key Summary
        </h2>
        <p className="text-blue-800 leading-relaxed">{guidance.summary}</p>
      </motion.div>

      {/* What Makes It Strong */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 p-6 bg-white rounded-lg border border-gray-200"
      >
        <button
          onClick={() => setShowWhyItMatters(!showWhyItMatters)}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            What Makes It Strong
          </h2>
          <motion.div
            animate={{ rotate: showWhyItMatters ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showWhyItMatters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="space-y-3">
                {guidance.whatMakesItStrong.map((point, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Why It Matters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-6 bg-amber-50 rounded-lg border border-amber-200"
      >
        <h2 className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
          <AlertCircle className="w-5 h-5" />
          Why This Matters
        </h2>
        <p className="text-amber-800 leading-relaxed">{guidance.whyItMatters}</p>
      </motion.div>

      {/* Industry Benchmarks */}
      {guidance.industryBenchmarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Industry Benchmarks
            </h2>
            <motion.div
              animate={{ rotate: showBenchmarks ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showBenchmarks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guidance.industryBenchmarks.map((benchmark, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{benchmark.metric}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Industry Average:</span>
                          <span className="font-medium text-gray-900">
                            {benchmark.average} {benchmark.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Your Score:</span>
                          <span className="font-medium text-blue-600">
                            {benchmark.yourScore} {benchmark.unit}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                        {benchmark.explanation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quality Progression Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          See Examples Across Quality Levels
        </h2>
        <p className="text-gray-600 mb-4">
          Watch how quality improves through each level. Start with "Weak" to understand what NOT to do,
          then progress through "Strong" to see best practices.
        </p>

        {/* Quality Toggle */}
        <div className="flex flex-wrap gap-2 mb-6">
          {availableQualities.map((quality) => {
            const qualityColors: Record<ExampleQuality, { active: string; inactive: string }> = {
              weak: {
                active: 'bg-red-100 text-red-700 border-red-300',
                inactive: 'bg-gray-100 text-gray-700 border-gray-300',
              },
              passable: {
                active: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                inactive: 'bg-gray-100 text-gray-700 border-gray-300',
              },
              defendable: {
                active: 'bg-blue-100 text-blue-700 border-blue-300',
                inactive: 'bg-gray-100 text-gray-700 border-gray-300',
              },
              strong: {
                active: 'bg-green-100 text-green-700 border-green-300',
                inactive: 'bg-gray-100 text-gray-700 border-gray-300',
              },
            }

            const colors = qualityColors[quality]
            const isActive = selectedExample === quality

            return (
              <motion.button
                key={quality}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedExample(quality)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  isActive ? colors.active : colors.inactive
                }`}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </motion.button>
            )
          })}
        </div>

        {/* Example Display with Comparison */}
        <AnimatePresence mode="wait">
          {currentExample && (
            <motion.div
              key={selectedExample}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ComparisonViewer
                example={currentExample}
                onCopy={handleCopyExample}
                copied={copiedExample}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Templates Section */}
      {guidance.templates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
              <Target className="w-5 h-5 text-blue-600" />
              Templates You Can Use
            </h2>
            <motion.div
              animate={{ rotate: showTemplates ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {guidance.templates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <TemplateCustomizer
                      template={template}
                      isExpanded={selectedTemplate === template.id}
                      onToggle={() =>
                        setSelectedTemplate(
                          selectedTemplate === template.id ? null : template.id
                        )
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Related Topics */}
      {guidance.relatedTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {guidance.relatedTopics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyExample}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copiedExample ? 'Copied!' : 'Copy Example'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          Mark as Helpful
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
