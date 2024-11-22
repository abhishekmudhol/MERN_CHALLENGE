import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { CalendarIcon, ChevronDownIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

interface PriceRangeStatistic {
  range: string;
  count: number;
}

interface ChartData {
  month: string;
  priceRangeStatistics: PriceRangeStatistic[];
}


export function BarChartStats() {
  const [selectedMonth, setSelectedMonth] = React.useState(4)
  const [chartData, setChartData] = React.useState<ChartData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:4000/price-range-statistics?month=${selectedMonth}`)
        const data = await response.json()
        console.log('Fetched stats:', data)
        setChartData(data)
      } catch (err) {
        setError("Failed to fetch statistics. Please try again.")
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedMonth])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-amber-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-amber-900">{`Price Range: ${label}`}</p>
          <p className="text-sm font-medium text-amber-600">{`Count: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-amber-50 to-amber-100 shadow-xl">
      <CardHeader className="space-y-1 pb-6 pt-8 px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-amber-900">
              Bar Chart Stats
            </CardTitle>
            <CardDescription className="text-base text-amber-700">
              Monthly price range distribution for {selectedMonth}
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
      <CardContent className="pb-8 px-6">
        <div className="h-[400px] relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm"
              >
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <p className="text-red-500 bg-red-50 px-4 py-2 rounded-md shadow-sm">{error}</p>
              </motion.div>
            ) : chartData ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.priceRangeStatistics} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FDE68A" />
                    <XAxis
                      dataKey="range"
                      stroke="#92400E"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#F59E0B' }}
                    />
                    <YAxis
                      stroke="#92400E"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#F59E0B' }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {chartData.priceRangeStatistics.map((entry : any, index : any) => (
                        <motion.rect key={`bar-${index}`} initial={{ y: 400 }} animate={{ y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

