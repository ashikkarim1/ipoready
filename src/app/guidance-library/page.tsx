import { GuidanceLibraryDashboard } from '@/components/guidance'

export const metadata = {
  title: 'Guidance Library - IPOReady',
  description: 'Learn how to improve your prospectus with real examples from successful IPOs',
}

export default function GuidanceLibraryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GuidanceLibraryDashboard />
      </div>
    </div>
  )
}
