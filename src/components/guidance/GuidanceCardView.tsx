'use client'

import { motion } from 'framer-motion'
import { Clock, Eye, Star, TrendingUp, ArrowRight } from 'lucide-react'
import type { GuidanceArticle, GuidanceDifficulty } from '@/lib/types/guidance.types'

interface GuidanceCardViewProps {
  article: GuidanceArticle
  onClick: () => void
  delay?: number
}

const difficultyConfig: Record<GuidanceDifficulty, { badge: string; text: string }> = {
  beginner: { badge: 'bg-green-100', text: 'text-green-700' },
  intermediate: { badge: 'bg-blue-100', text: 'text-blue-700' },
  advanced: { badge: 'bg-purple-100', text: 'text-purple-700' },
}

export function GuidanceCardView({ article, onClick, delay = 0 }: GuidanceCardViewProps) {
  const diffConfig = difficultyConfig[article.difficulty]
  const avgRating = article.totalRatings > 0 ? article.rating : 0
  const helpfulPercentage =
    article.totalRatings > 0 ? Math.round((article.helpfulCount / article.totalRatings) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
      onClick={onClick}
      className="h-full bg-white rounded-lg border border-gray-200 p-5 cursor-pointer transition-all hover:border-blue-300 group"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </div>

        {/* Difficulty Badge */}
        <div>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${diffConfig.badge} ${diffConfig.text}`}>
            {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>

      {/* Metadata Row 1 */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{article.readingTimeMinutes} min read</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{article.views.toLocaleString()} views</span>
        </div>
      </div>

      {/* Rating & Helpful */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(avgRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-1">
            {avgRating.toFixed(1)} ({article.totalRatings})
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
          <TrendingUp className="w-4 h-4" />
          <span>{helpfulPercentage}% helpful</span>
        </div>
      </div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ x: 4 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors group/btn"
      >
        <span>View Guidance</span>
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  )
}
