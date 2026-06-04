'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  Clock,
  Zap,
  Eye,
  BookOpen,
  ChevronDown,
  X,
} from 'lucide-react'
import type { GuidanceCategory, GuidanceDifficulty } from '@/lib/types/guidance.types'
import { GUIDANCE_ARTICLES, CATEGORY_INFO, getGuidanceByCategory, searchGuidance } from '@/lib/guidance-data'
import { GuidanceCardView } from './GuidanceCardView'
import { GuidanceDetailView } from './GuidanceDetailView'

type SortOption = 'helpful' | 'newest' | 'views'

interface GuidanceLibraryFilters {
  searchQuery: string
  selectedCategories: GuidanceCategory[]
  selectedDifficulties: GuidanceDifficulty[]
  sortBy: SortOption
}

const DIFFICULTIES: GuidanceDifficulty[] = ['beginner', 'intermediate', 'advanced']

const difficultyColors: Record<GuidanceDifficulty, { badge: string; text: string }> = {
  beginner: { badge: 'bg-green-100', text: 'text-green-700' },
  intermediate: { badge: 'bg-blue-100', text: 'text-blue-700' },
  advanced: { badge: 'bg-purple-100', text: 'text-purple-700' },
}

export function GuidanceLibraryDashboard() {
  const [filters, setFilters] = useState<GuidanceLibraryFilters>({
    searchQuery: '',
    selectedCategories: [],
    selectedDifficulties: [],
    sortBy: 'helpful',
  })
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // ── Filtered & Sorted Articles ──────────────────────────────────────────

  const filteredArticles = useMemo(() => {
    let results = GUIDANCE_ARTICLES

    // Search
    if (filters.searchQuery.trim()) {
      results = searchGuidance(filters.searchQuery)
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      results = results.filter((article) => filters.selectedCategories.includes(article.category))
    }

    // Difficulty filter
    if (filters.selectedDifficulties.length > 0) {
      results = results.filter((article) => filters.selectedDifficulties.includes(article.difficulty))
    }

    // Sort
    const sorted = [...results]
    if (filters.sortBy === 'helpful') {
      sorted.sort((a, b) => {
        const aRating = a.helpfulCount / a.totalRatings || 0
        const bRating = b.helpfulCount / b.totalRatings || 0
        return bRating - aRating
      })
    } else if (filters.sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    } else {
      sorted.sort((a, b) => b.views - a.views)
    }

    return sorted
  }, [filters])

  const categories = Array.from(new Set(GUIDANCE_ARTICLES.map((a) => a.category)))

  // ── Toggle Category ──────────────────────────────────────────────────────

  const toggleCategory = (category: GuidanceCategory) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
    }))
  }

  // ── Toggle Difficulty ──────────────────────────────────────────────────

  const toggleDifficulty = (difficulty: GuidanceDifficulty) => {
    setFilters((prev) => ({
      ...prev,
      selectedDifficulties: prev.selectedDifficulties.includes(difficulty)
        ? prev.selectedDifficulties.filter((d) => d !== difficulty)
        : [...prev.selectedDifficulties, difficulty],
    }))
  }

  // ── Clear Filters ──────────────────────────────────────────────────────

  const hasActiveFilters =
    filters.searchQuery.trim() ||
    filters.selectedCategories.length > 0 ||
    filters.selectedDifficulties.length > 0

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategories: [],
      selectedDifficulties: [],
      sortBy: 'helpful',
    })
  }

  // ── Show Detail View if Article Selected ──────────────────────────────

  if (selectedArticleId) {
    return (
      <GuidanceDetailView
        articleId={selectedArticleId}
        onBack={() => setSelectedArticleId(null)}
      />
    )
  }

  // ── Main Dashboard View ──────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Guidance Library</h1>
        </div>
        <p className="text-lg text-gray-600">
          Learn from real IPO prospectuses and improve your document with proven examples
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search guidance by section or topic..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                {filters.selectedCategories.length + filters.selectedDifficulties.length}
              </span>
            )}
          </motion.button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="helpful">Most Helpful</option>
              <option value="newest">Newest</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
          >
            {/* Category Filters */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sections</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      {CATEGORY_INFO[category].name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Filters */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((difficulty) => (
                  <motion.button
                    key={difficulty}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDifficulty(difficulty)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.selectedDifficulties.includes(difficulty)
                        ? `${difficultyColors[difficulty].badge} ${difficultyColors[difficulty].text} ring-2 ring-offset-2 ring-current`
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs - if no search results or default view */}
      {!filters.searchQuery.trim() && filters.selectedCategories.length === 0 && (
        <div className="mb-8 space-y-6">
          {categories.map((category) => {
            const categoryArticles = getGuidanceByCategory(category)
            const categoryInfo = CATEGORY_INFO[category]

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{categoryInfo.name}</h2>
                    <p className="text-sm text-gray-600">
                      {categoryArticles.length} guidance{categoryArticles.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryArticles.map((article, idx) => (
                    <GuidanceCardView
                      key={article.id}
                      article={article}
                      onClick={() => setSelectedArticleId(article.id)}
                      delay={idx * 0.05}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filtered Results Grid */}
      {(filters.searchQuery.trim() || filters.selectedCategories.length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredArticles.length} Result{filteredArticles.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article, idx) => (
                <GuidanceCardView
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticleId(article.id)}
                  delay={idx * 0.05}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200"
            >
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No guidance found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find relevant guidance
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}
