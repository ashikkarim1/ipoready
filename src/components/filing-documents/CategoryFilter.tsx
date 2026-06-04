'use client'

interface CategoryFilterProps {
  categories: {
    id: string
    label: string
    count: number
    total: number
  }[]
  selectedCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="card p-6">
      <p className="label-sm font-semibold text-gray-700 mb-4">
        Filter by Category
      </p>

      <div className="flex flex-wrap gap-3">
        {/* All */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`inline-flex items-center px-4 py-2.5 rounded-full label font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-red-600 text-white border border-red-600'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          All Documents
        </button>

        {/* Category buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`inline-flex items-center px-4 py-2.5 rounded-full label font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white border border-red-600'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            <span>{category.label}</span>
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {category.count}/{category.total}
            </span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="label-sm font-semibold text-gray-700 mb-3">Status Legend</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <p className="caption-sm text-gray-600">Not Started</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <p className="caption-sm text-gray-600">In Progress</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <p className="caption-sm text-gray-600">Ready</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <p className="caption-sm text-gray-600">Uploaded</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-700"></div>
            <p className="caption-sm text-gray-600">Verified</p>
          </div>
        </div>
      </div>
    </div>
  )
}
