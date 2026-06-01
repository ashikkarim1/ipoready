'use client'

interface ReadinessFactorsCardProps {
  cashRunway: number
  hiringProgress: number
  auditorEngaged: boolean
  boardSize: number
  boardIndependentCount: number
  secondIndependent: boolean
}

export function ReadinessFactorsCard({
  cashRunway,
  hiringProgress,
  auditorEngaged,
  boardSize,
  boardIndependentCount,
  secondIndependent,
}: ReadinessFactorsCardProps) {
  const getCashColor = () => {
    if (cashRunway < 3) return 'bg-red-50 border-red-200'
    if (cashRunway < 6) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  const getCashTextColor = () => {
    if (cashRunway < 3) return 'text-red-900'
    if (cashRunway < 6) return 'text-yellow-900'
    return 'text-green-900'
  }

  const getHiringProgressColor = () => {
    if (hiringProgress < 33) return 'bg-red-500'
    if (hiringProgress < 67) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Readiness Factors</h3>

      {/* Responsive grid: 1 col mobile, 2x2 tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Runway */}
        <div className={`rounded-lg border p-4 ${getCashColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${getCashTextColor()}`}>💰 Cash Runway</p>
          </div>
          <p className={`text-2xl font-bold ${getCashTextColor()}`}>
            {cashRunway.toFixed(1)}
          </p>
          <p className={`text-xs ${getCashTextColor()}`}>months</p>
          {cashRunway < 3 && (
            <p className="text-xs text-red-700 font-medium mt-2">⚠ Critical: Plan fundraising</p>
          )}
          {cashRunway >= 3 && cashRunway < 6 && (
            <p className="text-xs text-yellow-700 font-medium mt-2">→ Monitor closely</p>
          )}
        </div>

        {/* Hiring Progress */}
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-3">Team Hiring</p>
          <div className="w-full bg-gray-300 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={`h-full ${getHiringProgressColor()} transition-all`}
              style={{ width: `${hiringProgress}%` }}
            />
          </div>
          <p className="text-lg font-bold text-gray-900">{Math.round(hiringProgress)}%</p>
          <p className="text-xs text-gray-600">of planned hires</p>
        </div>

        {/* Auditor Engagement */}
        <div className={`rounded-lg border p-4 ${
          auditorEngaged ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-sm font-semibold mb-3 ${
            auditorEngaged ? 'text-green-900' : 'text-amber-900'
          }`}>Auditor</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl ${auditorEngaged ? 'text-green-600' : 'text-amber-600'}`}>
              {auditorEngaged ? '✓' : '⚠'}
            </span>
            <span className={`text-sm font-semibold ${
              auditorEngaged ? 'text-green-900' : 'text-amber-900'
            }`}>
              {auditorEngaged ? 'Engaged' : 'Not engaged'}
            </span>
          </div>
          {auditorEngaged && (
            <p className="text-xs text-green-700">CPAB-registered auditor</p>
          )}
        </div>

        {/* Board Composition */}
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-3">Board Composition</p>
          <div className="mb-2">
            <p className="text-lg font-bold text-gray-900">
              {boardIndependentCount}/{boardSize}
            </p>
            <p className="text-xs text-gray-600">independent directors</p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className={secondIndependent ? 'text-green-600 font-semibold' : 'text-gray-500'}>
              {secondIndependent ? '✓' : '○'}
            </span>
            <span className={secondIndependent ? 'text-green-700 font-medium' : 'text-gray-600'}>
              2nd independent
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
