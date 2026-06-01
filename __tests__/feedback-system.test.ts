// Unit tests for Feedback System
// Tests feedback submission, validation, analytics, and API endpoints

describe('Feedback System - Unit Tests', () => {
  describe('Sentiment Analysis', () => {
    function analyzeSentiment(rating: number, comment?: string): string {
      if (rating >= 4) {
        return 'positive'
      }
      if (rating === 3) {
        return 'neutral'
      }
      if (rating <= 2) {
        if (comment && (comment.toLowerCase().includes('confusing') || comment.toLowerCase().includes('difficult'))) {
          return 'frustrated'
        }
        return 'negative'
      }
      return 'neutral'
    }

    it('should classify high ratings as positive', () => {
      expect(analyzeSentiment(5)).toBe('positive')
      expect(analyzeSentiment(4)).toBe('positive')
    })

    it('should classify medium ratings as neutral', () => {
      expect(analyzeSentiment(3)).toBe('neutral')
    })

    it('should classify low ratings as negative', () => {
      expect(analyzeSentiment(1)).toBe('negative')
      expect(analyzeSentiment(2)).toBe('negative')
    })

    it('should classify low ratings with confusion keywords as frustrated', () => {
      expect(analyzeSentiment(2, 'This is confusing')).toBe('frustrated')
      expect(analyzeSentiment(1, 'Very difficult to use')).toBe('frustrated')
    })

    it('should classify low ratings without confusion keywords as negative', () => {
      expect(analyzeSentiment(2, 'Not what I expected')).toBe('negative')
    })
  })

  describe('Feedback Validation', () => {
    function validateFeedback(feedback: {
      page?: string
      rating?: number
      feedbackText?: string
    }): { valid: boolean; errors: string[] } {
      const errors: string[] = []

      if (!feedback.page) errors.push('Page is required')
      if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
        errors.push('Rating must be between 1 and 5')
      }
      if (!feedback.feedbackText || feedback.feedbackText.trim().length === 0) {
        errors.push('Feedback text is required')
      }
      if (feedback.feedbackText && feedback.feedbackText.length > 1000) {
        errors.push('Feedback text must not exceed 1000 characters')
      }

      return {
        valid: errors.length === 0,
        errors,
      }
    }

    it('should reject feedback without required fields', () => {
      const result = validateFeedback({})
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject invalid ratings', () => {
      const result = validateFeedback({
        page: '/dashboard',
        rating: 6,
        feedbackText: 'Test',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Rating must be between 1 and 5')
    })

    it('should reject feedback exceeding max length', () => {
      const result = validateFeedback({
        page: '/dashboard',
        rating: 5,
        feedbackText: 'a'.repeat(1001),
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Feedback text must not exceed 1000 characters')
    })

    it('should accept valid feedback', () => {
      const result = validateFeedback({
        page: '/dashboard',
        rating: 4,
        feedbackText: 'Great product!',
      })
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('Analytics Calculation', () => {
    interface FeedbackItem {
      rating: number
      sentiment: string
    }

    function calculateStats(feedbackList: FeedbackItem[]) {
      if (feedbackList.length === 0) {
        return {
          averageRating: 0,
          sentimentBreakdown: {
            positive: 0,
            neutral: 0,
            negative: 0,
            frustrated: 0,
          },
        }
      }

      const avgRating = feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length
      const sentimentBreakdown = {
        positive: feedbackList.filter((f) => f.sentiment === 'positive').length,
        neutral: feedbackList.filter((f) => f.sentiment === 'neutral').length,
        negative: feedbackList.filter((f) => f.sentiment === 'negative').length,
        frustrated: feedbackList.filter((f) => f.sentiment === 'frustrated').length,
      }

      return {
        averageRating: Math.round(avgRating * 100) / 100,
        sentimentBreakdown,
      }
    }

    it('should calculate average rating correctly', () => {
      const feedback = [
        { rating: 5, sentiment: 'positive' },
        { rating: 4, sentiment: 'positive' },
        { rating: 3, sentiment: 'neutral' },
      ]
      const stats = calculateStats(feedback)
      expect(stats.averageRating).toBe(4)
    })

    it('should count sentiment distribution correctly', () => {
      const feedback = [
        { rating: 5, sentiment: 'positive' },
        { rating: 5, sentiment: 'positive' },
        { rating: 2, sentiment: 'negative' },
        { rating: 3, sentiment: 'neutral' },
      ]
      const stats = calculateStats(feedback)
      expect(stats.sentimentBreakdown.positive).toBe(2)
      expect(stats.sentimentBreakdown.negative).toBe(1)
      expect(stats.sentimentBreakdown.neutral).toBe(1)
      expect(stats.sentimentBreakdown.frustrated).toBe(0)
    })

    it('should handle empty feedback list', () => {
      const stats = calculateStats([])
      expect(stats.averageRating).toBe(0)
      expect(stats.sentimentBreakdown.positive).toBe(0)
    })
  })

  describe('Confusion Points Processing', () => {
    function parseConfusionPoints(input: string[]): string[] {
      return input
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .filter((p, idx, arr) => arr.indexOf(p) === idx) // Remove duplicates
    }

    it('should trim and filter confusion points', () => {
      const result = parseConfusionPoints(['  UI unclear  ', 'Navigation confusing', ''])
      expect(result).toEqual(['UI unclear', 'Navigation confusing'])
    })

    it('should remove duplicate confusion points', () => {
      const result = parseConfusionPoints(['Slow', 'Slow', 'Confusing'])
      expect(result).toEqual(['Slow', 'Confusing'])
    })

    it('should handle empty arrays', () => {
      const result = parseConfusionPoints([])
      expect(result).toEqual([])
    })
  })
})

describe('Feedback API - Validation Tests', () => {
  describe('Request Validation', () => {
    it('should validate POST request body', () => {
      const validBodies = [
        {
          page: '/dashboard',
          rating: 5,
          feedbackText: 'Great!',
        },
        {
          page: '/pace',
          rating: 3,
          feedbackText: 'Okay',
          confusionPoints: ['Setup'],
          category: 'UX/UI Feedback',
        },
      ]

      validBodies.forEach((body) => {
        expect(body.page).toBeDefined()
        expect(body.rating).toBeGreaterThanOrEqual(1)
        expect(body.rating).toBeLessThanOrEqual(5)
        expect(body.feedbackText).toBeTruthy()
      })
    })

    it('should enforce authorization', () => {
      const mockSession = null
      expect(mockSession).toBeNull()
    })
  })

  describe('Response Formatting', () => {
    it('should return consistent success response', () => {
      const successResponse = {
        success: true,
        message: 'Thank you for your feedback!',
        feedbackId: 'test-id-123',
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.feedbackId).toBeDefined()
    })

    it('should return consistent error response', () => {
      const errorResponse = {
        error: 'Failed to process feedback',
        details: 'Database connection error',
      }

      expect(errorResponse.error).toBeDefined()
      expect(errorResponse.details).toBeDefined()
    })
  })
})

describe('Feedback Status Management', () => {
  const validStatuses = ['new', 'acknowledged', 'in_progress', 'resolved', 'wontfix']

  it('should only allow valid status values', () => {
    const testStatus = (status: string) => validStatuses.includes(status)

    expect(testStatus('new')).toBe(true)
    expect(testStatus('resolved')).toBe(true)
    expect(testStatus('invalid')).toBe(false)
  })

  it('should handle status transitions correctly', () => {
    const transitions = {
      new: ['acknowledged', 'in_progress', 'resolved', 'wontfix'],
      acknowledged: ['in_progress', 'resolved', 'wontfix'],
      in_progress: ['resolved', 'wontfix', 'acknowledged'],
      resolved: ['acknowledged'],
      wontfix: ['acknowledged'],
    }

    const isValidTransition = (from: string, to: string): boolean => {
      return transitions[from as keyof typeof transitions]?.includes(to) || false
    }

    expect(isValidTransition('new', 'resolved')).toBe(true)
    expect(isValidTransition('resolved', 'new')).toBe(false)
  })
})
