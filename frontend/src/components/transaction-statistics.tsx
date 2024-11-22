import * as React from "react"
import { CalendarIcon, ChevronDownIcon, PackageIcon, PackageXIcon ,IndianRupeeIcon } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const months = [
  { name: 'January', value: 1 },
  { name: 'February', value: 2 },
  { name: 'March', value: 3 },
  { name: 'April', value: 4 },
  { name: 'May', value: 5 },
  { name: 'June', value: 6 },
  { name: 'July', value: 7 },
  { name: 'August', value: 8 },
  { name: 'September', value: 9 },
  { name: 'October', value: 10 },
  { name: 'November', value: 11 },
  { name: 'December', value: 12 },
]

interface MonthlyStats {
  totalSales: number
  totalSoldItems: number
  totalNotSoldItems: number
}

export function TransactionStatistics() {
  const [selectedMonth, setSelectedMonth] = React.useState(4)
  const [stats, setStats] = React.useState<MonthlyStats | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:4000/statistics?month=${selectedMonth}`)
        const data = await response.json()
        console.log('Fetched stats:', data)
        setStats(data)
      } catch (err) {
        setError("Failed to fetch statistics. Please try again.")
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedMonth])

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden">
      <CardHeader className="space-y-1 bg-gradient-to-r from-amber-100 to-amber-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-amber-900">
              Statistics - {months[selectedMonth-1].name}
            </CardTitle>
            <CardDescription className="text-amber-700">
              Monthly transaction statistics overview
            </CardDescription>
          </div>
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-[180px] bg-white border-amber-200 text-amber-900">
              <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
              <SelectValue placeholder="Select Month">
                {months.find((month) => month.value === selectedMonth)?.name}
              </SelectValue>
              <ChevronDownIcon className="ml-auto h-4 w-4 text-amber-500" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={String(month.value)}>
                  {month.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-center p-4 bg-red-50 rounded-lg"
            >
              {error}
            </motion.div>
          ) : stats ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6"
            >
  
              <StatCard
                icon={IndianRupeeIcon}
                title="Total sale"
                value={`₹${stats.totalSales?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                color="text-green-600"
                bgColor="bg-green-100"
              />
              <StatCard
                icon={PackageIcon}
                title="Total sold items"
                value={stats.totalSoldItems?.toString() ?? '0'}
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatCard
                icon={PackageXIcon}
                title="Total not sold items"
                value={stats.totalNotSoldItems?.toString() ?? '0'}
                color="text-red-600"
                bgColor="bg-red-100"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  icon: React.ElementType
  title: string
  value: string
  color: string
  bgColor: string
}

function StatCard({ icon: Icon, title, value, color, bgColor }: StatCardProps) {
  return (
    <motion.div
      className={`flex items-center justify-between p-4 rounded-lg ${bgColor}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${color} bg-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  )
}
