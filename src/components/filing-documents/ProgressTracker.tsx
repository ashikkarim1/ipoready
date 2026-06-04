'use client'

interface CategoryProgress {
  name: string
  completed: number
  total: number
}

interface ProgressTrackerProps {
  totalCompleted: number
  totalDocuments: number
  estimatedDaysRemaining?: number
  categoryProgress?: CategoryProgress[]
}

export function ProgressTracker({
  totalCompleted,
  totalDocuments,
  estimatedDaysRemaining,
  categoryProgress = [],
}: ProgressTrackerProps) {
  const completionPercentage = Math.round(
    (totalCompleted / totalDocuments) * 100
  )

  return (
    <div className="card p-6 space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="label-sm font-semibold text-gray-700 mb-1">
              Overall Progress
            </p>
            <p className="body-sm text-gray-600">
              {totalCompleted} of {totalDocuments} documents completed
            </p>
          </div>
          <div className="text-right">
            <p className="h3 font-bold text-gray-900">
              {completionPercentage}%
            </p>
            {estimatedDaysRemaining && (
              <p className="caption-sm text-gray-600">
                ~{estimatedDaysRemaining} days remaining
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Category Progress */}
      {categoryProgress.length > 0 && (
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <p className="label-sm font-semibold text-gray-700">
            Progress by Category
          </p>

          {categoryProgress.map((category) => {
            const percentage = Math.round(
              (category.completed / category.total) * 100
            )
            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="body-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                  <p className="caption-sm text-gray-600">
                    {category.completed}/{category.total}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage === 100
                        ? 'bg-green-600'
                        : percentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Milestones */}
      <div className="border-t border-gray-200 pt-6">
        <p className="label-sm font-semibold text-gray-700 mb-3">Milestones</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-green-600">
              ✓
            </div>
            <div>
              <p className="label text-gray-900">Documents Started</p>
              <p className="caption-sm text-gray-600">
                {totalCompleted > 0 ? 'Completed' : 'Not yet started'}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg ${
              completionPercentage >= 50 ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                completionPercentage >= 50 ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              {completionPercentage >= 50 ? '✓' : '2'}
            </div>
            <div>
              <p className="label text-gray-900">Half Complete</p>
              <p className="caption-sm text-gray-600">
                {completionPercentage >= 50
                  ? 'Achieved'
                  : `${Math.round((50 - completionPercentage))}% to go`}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg ${
              completionPercentage === 100 ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                completionPercentage === 100 ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              {completionPercentage === 100 ? '✓' : '3'}
            </div>
            <div>
              <p className="label text-gray-900">All Documents Complete</p>
              <p className="caption-sm text-gray-600">
                {completionPercentage === 100
                  ? 'Ready for submission'
                  : `${Math.round(100 - completionPercentage)}% to go`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
