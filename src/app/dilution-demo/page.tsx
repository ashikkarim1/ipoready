import { DilutionScenariosComponent } from '@/components/DilutionScenariosComponent'

export const metadata = {
  title: 'Cap Table Dilution Scenarios - IPOReady',
  description: 'Model ownership impact under typical IPO financing rounds',
}

export default function DilutionDemoPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4', colorScheme: 'light' }}>
      <DilutionScenariosComponent />
    </div>
  )
}
