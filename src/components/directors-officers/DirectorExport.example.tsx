/**
 * DirectorExport Component - Usage Examples
 *
 * This file demonstrates various ways to use the DirectorExport component
 * in different contexts within the IPOReady application.
 */

import DirectorExport from './DirectorExport'

// Example 1: Standalone Component Usage
export function Example1_BasicUsage() {
  const mockDirectors = [
    {
      id: 'dir-1',
      name: 'Jennifer Wong',
      role: 'Chief Executive Officer',
      independence: 'management' as const,
      experience: 15,
      status: 'complete' as const,
      principalOccupation: 'Chief Executive Officer, TechCorp Inc.',
      education: 'MBA, Stanford Graduate School of Business',
      certifications: 'CFA, FCA',
      boardExperience:
        'Board member, Tech Innovation Fund; Former board member, Global Tech Alliance',
      compensation: 500000,
      stockOwnership: 25,
      email: 'jennifer.wong@techcorp.com',
      phone: '+1-555-0100',
    },
    {
      id: 'dir-2',
      name: 'Sarah Chen',
      role: 'Independent Director',
      independence: 'independent' as const,
      experience: 20,
      status: 'complete' as const,
      principalOccupation: 'Senior Advisor, Technology and Innovation',
      education: 'MSc Computer Science, Massachusetts Institute of Technology',
      certifications: 'PMP, ITIL Foundation',
      boardExperience:
        'Board member, 3 public technology companies; Audit Committee Chair, Enterprise Software Corp',
      compensation: 150000,
      email: 'sarah.chen@advisors.com',
      phone: '+1-555-0101',
    },
    {
      id: 'dir-3',
      name: 'Michael Thompson',
      role: 'Independent Director, Audit Committee Chair',
      independence: 'independent' as const,
      experience: 25,
      status: 'pending' as const,
      principalOccupation: 'Partner, Thompson & Associates LLP (Retired)',
      education: 'BA Accounting, University of Toronto',
      certifications: 'CPA, CA',
      compensation: 175000,
      email: 'mthompson@example.com',
    },
  ]

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Director Export - Basic Example</h1>
      <DirectorExport
        directors={mockDirectors}
        companyName="TechCorp Inc."
        targetExchange="tsx"
      />
    </div>
  )
}

// Example 2: Using with Context/State Management
export function Example2_WithContextIntegration() {
  // This would typically come from a context provider
  const companyContext = {
    name: 'Innovation Labs Ltd.',
    targetExchange: 'nasdaq' as const,
    directors: [
      {
        id: 'lab-1',
        name: 'Dr. Priya Patel',
        role: 'Founder & CEO',
        independence: 'management' as const,
        experience: 12,
        status: 'complete' as const,
        principalOccupation:
          'Founder and Chief Executive Officer of Innovation Labs',
        education:
          'PhD Artificial Intelligence, Stanford University; BS Computer Science, UC Berkeley',
        certifications: 'Lean Six Sigma Black Belt',
        boardExperience: 'Board member, AI Ethics Foundation',
        compensation: 600000,
        stockOwnership: 45,
      },
      {
        id: 'lab-2',
        name: 'James Morrison',
        role: 'CFO',
        independence: 'management' as const,
        experience: 18,
        status: 'complete' as const,
        principalOccupation: 'Chief Financial Officer',
        education: 'MBA Finance, Harvard Business School; BBA Accounting, McGill',
        certifications: 'CPA, CFA',
        compensation: 400000,
      },
      {
        id: 'lab-3',
        name: 'Lisa Rodriguez',
        role: 'Lead Independent Director',
        independence: 'independent' as const,
        experience: 28,
        status: 'complete' as const,
        principalOccupation: 'Executive Coach and Board Advisor',
        education: 'MA Organizational Psychology, University of British Columbia',
        certifications: 'Executive Coach Certification (ICF)',
        boardExperience:
          'Chair, Governance Committee; Board member, 5 Canadian public companies',
        compensation: 180000,
        relatedPartyTransactions: false,
      },
    ],
  }

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">
        {companyContext.name} - Director Export
      </h1>
      <p className="text-gray-600 mb-6">
        Listing on {companyContext.targetExchange.toUpperCase()}
      </p>
      <DirectorExport
        directors={companyContext.directors}
        companyName={companyContext.name}
        targetExchange={companyContext.targetExchange}
      />
    </div>
  )
}

// Example 3: Multiple Exchange Scenarios
export function Example3_MultipleExchanges() {
  const directors = [
    {
      id: 'dir-1',
      name: 'Alice Johnson',
      role: 'President & CEO',
      independence: 'management' as const,
      experience: 16,
      status: 'complete' as const,
      principalOccupation: 'President and Chief Executive Officer',
      education: 'MBA, Ivey Business School',
      certifications: 'ICD.D',
      compensation: 550000,
      stockOwnership: 30,
    },
    {
      id: 'dir-2',
      name: 'Robert Singh',
      role: 'Independent Director',
      independence: 'independent' as const,
      experience: 22,
      status: 'complete' as const,
      principalOccupation: 'Consultant, Business Strategy',
      education: 'MBA, Rotman School of Management',
      certifications: 'CPA, CA; ICD.D',
      boardExperience: 'Board experience in technology and mining sectors',
      compensation: 160000,
    },
  ]

  const exchanges = [
    { id: 'tsx', label: 'TSX (Toronto Stock Exchange)' },
    { id: 'tsxv', label: 'TSX Venture' },
    { id: 'nasdaq', label: 'NASDAQ' },
    { id: 'nyse', label: 'NYSE' },
  ] as const

  return (
    <div className="w-full p-6 bg-gray-50 space-y-8">
      <h1 className="text-3xl font-bold">Director Export - Multiple Exchange Examples</h1>

      {exchanges.map((exchange) => (
        <div key={exchange.id} className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">{exchange.label}</h2>
          <DirectorExport
            directors={directors}
            companyName="Global Corp Inc."
            targetExchange={exchange.id}
          />
        </div>
      ))}
    </div>
  )
}

// Example 4: Incomplete Director Data
export function Example4_IncompleteData() {
  const directorsWithMissingData = [
    {
      id: 'dir-1',
      name: 'Mark Davis',
      role: 'CEO',
      independence: 'management' as const,
      experience: 10,
      status: 'pending' as const,
      // Minimal data - other fields missing
    },
    {
      id: 'dir-2',
      name: 'Elena Volkov',
      role: 'Independent Director',
      independence: 'independent' as const,
      experience: 15,
      status: 'complete' as const,
      principalOccupation: 'Investment Advisor',
      education: 'CFA',
      compensation: 120000,
      // Some fields filled in
    },
  ] as any

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">Incomplete Director Data</h1>
      <p className="text-gray-600 mb-6">
        The component gracefully handles missing director information
      </p>
      <DirectorExport
        directors={directorsWithMissingData}
        companyName="StartUp Corp"
        targetExchange="tsxv"
      />
    </div>
  )
}

// Example 5: Large Board of Directors
export function Example5_LargeBoard() {
  const generateDirectors = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `dir-${i + 1}`,
      name: `Director ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`,
      role: i === 0 ? 'CEO' : i < 3 ? 'Management' : 'Independent',
      independence: (i === 0 || i < 3 ? 'management' : 'independent') as const,
      experience: 10 + i * 2,
      status: 'complete' as const,
      principalOccupation: `Director ${i + 1}'s Professional Title`,
      compensation: 100000 + i * 10000,
      education: `Advanced Degree, University ${i}`,
    }))

  const directors = generateDirectors(12)

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">Large Board Example</h1>
      <p className="text-gray-600 mb-6">
        Board with {directors.length} directors - showing scrollable director list
      </p>
      <DirectorExport
        directors={directors}
        companyName="Enterprise Solutions Inc."
        targetExchange="nyse"
      />
    </div>
  )
}

// Example 6: Use in Modal/Dialog
export function Example6_InModal() {
  const directors = [
    {
      id: 'dir-1',
      name: 'Victoria Lee',
      role: 'Chairperson',
      independence: 'independent' as const,
      experience: 30,
      status: 'complete' as const,
      principalOccupation: 'Chairperson and Board Advisor',
      education: 'MBA, INSEAD',
      certifications: 'ICD.D',
      compensation: 200000,
    },
  ]

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Director Export in Modal</h1>
      <div className="max-w-3xl mx-auto border rounded-lg bg-white shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Export Director Information</h2>
        <DirectorExport
          directors={directors}
          companyName="Premium Holdings Ltd."
          targetExchange="tsx"
        />
      </div>
    </div>
  )
}

// Example 7: Controlled Component Pattern (Future Enhancement)
export interface DirectorExportControlledProps {
  directors: any[]
  companyName: string
  targetExchange: 'tsx' | 'tsxv' | 'nasdaq' | 'nyse'
  onExport?: (data: { format: string; directors: string[]; content: string }) => void
  onFormatChange?: (format: string) => void
}

/**
 * This example shows how the component could be enhanced
 * to support controlled component pattern for better integration
 * with parent state management systems
 */
export function Example7_ControlledComponent() {
  // const handleExport = (data: ExportData) => {
  //   console.log('Export triggered:', data)
  //   // Send to API, log analytics, update parent state, etc.
  // }
  //
  // return (
  //   <DirectorExport
  //     {...props}
  //     onExport={handleExport}
  //     onFormatChange={(format) => console.log('Format:', format)}
  //   />
  // )
  return <div>This example shows the controlled component pattern pattern.</div>
}

// Example 8: Full Featured Dashboard Section
export function Example8_DashboardIntegration() {
  const directors = [
    {
      id: 'dir-1',
      name: 'Katherine Bennett',
      role: 'Chief Executive Officer',
      independence: 'management' as const,
      experience: 14,
      status: 'complete' as const,
      principalOccupation: 'CEO and President',
      education: 'MBA, McGill University; BBA, University of Alberta',
      certifications: 'CPA, CA; ICD.D',
      boardExperience: 'Board member of 2 public companies; Audit Committee member',
      compensation: 480000,
      stockOwnership: 28,
      relatedPartyTransactions: false,
      email: 'katherine@example.com',
      phone: '+1-555-0102',
    },
    {
      id: 'dir-2',
      name: 'Dr. Hassan Al-Rashid',
      role: 'Independent Director',
      independence: 'independent' as const,
      experience: 26,
      status: 'complete' as const,
      principalOccupation: 'Professor and Research Scientist',
      education: 'PhD Physics, University of Cambridge; MSc, University of Waterloo',
      certifications: 'Fellow of the Royal Society',
      compensation: 140000,
    },
    {
      id: 'dir-3',
      name: 'Natasha Volkov',
      role: 'Independent Director, Audit Committee Chair',
      independence: 'independent' as const,
      experience: 24,
      status: 'complete' as const,
      principalOccupation: 'Managing Director, Volkov Capital Partners',
      education: 'MBA, London Business School; BA Economics, University of Toronto',
      certifications: 'CFA Level III, FCA',
      boardExperience: 'Audit Committee Chair, 3 public companies; Risk oversight',
      compensation: 165000,
    },
    {
      id: 'dir-4',
      name: 'David Park',
      role: 'Independent Director',
      independence: 'independent' as const,
      experience: 20,
      status: 'pending' as const,
      principalOccupation: 'Former Executive Vice President, Operations',
      education: 'MBA, Schulich School of Business; BBA, Ryerson University',
      certifications: 'Lean Six Sigma Master Black Belt',
      compensation: 130000,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <div className="px-6">
        <h1 className="text-3xl font-bold">Board of Directors Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and export director information for regulatory filings
        </p>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{directors.length}</div>
            <div className="text-sm text-blue-700">Total Directors</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {directors.filter((d) => d.status === 'complete').length}
            </div>
            <div className="text-sm text-green-700">Complete</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">
              {directors.filter((d) => d.independence === 'independent').length}
            </div>
            <div className="text-sm text-yellow-700">Independent</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {directors.reduce((sum, d) => sum + (d.compensation || 0), 0) / 1000000}M
            </div>
            <div className="text-sm text-purple-700">Total Compensation</div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <DirectorExport
          directors={directors}
          companyName="Premium Tech Solutions Inc."
          targetExchange="nasdaq"
        />
      </div>
    </div>
  )
}
