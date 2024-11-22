import TransactionDashboard from '@/components/transaction-dashboard'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TransactionStatistics } from './components/transaction-statistics'
import { BarChartStats } from './components/bar-chart-stats'

export default function Home() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<TransactionDashboard />}/>
        <Route path='/statistics' element={<Statistics />}/>
        <Route path='/barchart' element={<BarChart />}/>

        {/*undefined paths */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

function Statistics(){
  return(
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-amber-900 text-center">
          Transaction Overview
        </h1>
        <TransactionStatistics/>
      </div>
    </main> 
  )
}

function BarChart(){
  return(
    <main className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 p-8">
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-amber-900 text-center">
        Transaction Analytics Dashboard
      </h1>
      <BarChartStats/>
    </div>
  </main>
  )
}