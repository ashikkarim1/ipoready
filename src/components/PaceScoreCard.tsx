'use client'

interface ReadinessFactors {
  cashRunway: number
  teamHiringProgress: number
  auditorEngaged: boolean
}

interface PaceScoreCardProps {
  score: number
  peerPercentile: number
  predictedChange: number
  confidenceLevel: 'low' | 'medium' | 'high'
  readinessFactors: ReadinessFactors
}

export function PaceScoreCard({
  score,
  peerPercentile,
  predictedChange,
  confidenceLevel,
  readinessFactors,
}: PaceScoreCardProps) {
  const getScoreColor = () => {
    if (score <= 30) return 'text-red-600'
    if (score <= 50) return 'text-orange-500'
    if (score <= 70) return 'text-yellow-500'
    if (score <= 90) return 'text-lime-500'
    return 'text-green-600'
  }

  const getScoreBgColor = () => {
    if (score <= 30) return 'bg-red-50'
    if (score <= 50) return 'bg-orange-50'
    if (score <= 70) return 'bg-yellow-50'
    if (score <= 90) return 'bg-lime-50'
    return 'bg-green-50'
  }

  const getConfidenceBadgeColor = () => {
    switch (confidenceLevel) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  const getPredictionArrow = () => {
    if (predictedChange > 0) return '↑'
    if (predictedChange < 0) return '↓'
    return '→'
  }

  const getPredictionColor = () => {
    if (predictedChange > 0) return 'text-green-600'
    if (predictedChange < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className={`rounded-lg p-6 border border-gray-200 ${getScoreBgColor()}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">PACE Readiness Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${getScoreColor()}`}>
              {Math.round(score)}
            </span>
            <span className="text-2xl text-gray-400 font-light">/100</span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-3xl font-bold ${getPredictionColor()}`}>
            {getPredictionArrow()} {Math.abs(predictedChange)} days
          </p>
          <p className="text-xs text-gray-600 mt-1">Predicted change</p>
        </div>
      </div>

      {/* Peer percentile and confidence */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Peer Percentile</p>
          <p className="text-lg font-semibold text-gray-900">
            Top {Math.round(100 - peerPercentile)}%
          </p>
          <p className="text-xs text-gray-600">for TSX companies</p>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Confidence</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConfidenceBadgeColor()}`}>
            {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)}
          </span>
        </div>
      </div>

      {/* Readiness factors snippet */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">Key Readiness Factors</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-600">Cash Runway</p>
            <p className="font-semibold">💰 {Math.round(readinessFactors.cashRunway)} mo</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Team Hiring</p>
            <p className="font-semibold">{Math.round(readinessFactors.teamHiringProgress)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Auditor</p>
            <p className="font-semibold">
              {readinessFactors.auditorEngaged ? '✓' : '⚠'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
