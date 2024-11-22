import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

// Define a type for the transaction data
interface Transaction {
  id: number
  title: string
  description: string
  price: string
  category: string
  sold: string
  image: string
}

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

export default function TransactionDashboard() {
  const [selectedMonth, setSelectedMonth] = React.useState(3) 
  const [searchTerm, setSearchTerm] = React.useState('')
  const [pageNo, setPageNo] = React.useState(1)
  const [transactions, setTransactions] = React.useState<Transaction[]>([]) 
  const [loading, setLoading] = React.useState(false)


  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/transactions?month=${selectedMonth}&page=${pageNo}&search=${searchTerm}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data); // Log to inspect
      
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        console.error("Unexpected API response format:", data);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };


  React.useEffect(() => {
    fetchTransactions()
  }, [selectedMonth, searchTerm, pageNo])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-8">
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 text-white py-8 px-6 shadow-lg">
        <h1 className="text-4xl font-bold text-center text-amber-700">Transaction Dashboard</h1>
      </div>

      <div className="px-6 py-6 bg-white shadow-md mt-6 mx-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search transaction..."
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-full md:w-[200px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
              <SelectValue placeholder="Select Month">
                {months.find((month) => month.value === selectedMonth)?.name}
              </SelectValue>
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
      </div>

      <div className="overflow-x-auto bg-white mt-6 shadow-lg rounded-lg mx-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-b border-gray-200">
              <TableHead className="text-blue-800 font-semibold py-4">ID</TableHead>
              <TableHead className="text-blue-800 font-semibold py-4">Title</TableHead>
              <TableHead className="text-blue-800 font-semibold py-4">Description</TableHead>
              <TableHead className="text-blue-800 font-semibold py-4">Price</TableHead>
              <TableHead className="text-blue-800 font-semibold py-4">Category</TableHead>
              <TableHead className="text-blue-800 font-semibold py-4">Sold</TableHead>
              <TableHead className="text-blue-800 font-semibold py-4">Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <TableCell className="font-medium text-gray-900">{transaction.id}</TableCell>
                  <TableCell className="font-bold text-base text-gray-900">{transaction.title}</TableCell>
                  <TableCell className="text-gray-600">{transaction.description}</TableCell>
                  <TableCell className="font-semibold text-gray-900 text-xl flex justify-center items-center whitespace-nowrap pt-9">{(parseFloat(transaction.price)).toFixed(2)} Rs.</TableCell>
                  <TableCell className="font-bold text-teal-700 text-base">{transaction.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      transaction.sold ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.sold? 'Yes' : 'No'} 
                    </span>
                  </TableCell>
                  <TableCell>
                    <img 
                      src={transaction.image} 
                      alt={transaction.title} 
                      className="w-28 h-1/5 object-cover rounded-full border-2 border-gray-200 aspect-square"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex justify-between items-center px-6 py-4 bg-white shadow rounded-lg mx-6">
        <div className="text-gray-600 font-medium">Page: {pageNo}</div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setPageNo(Math.max(1, pageNo - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setPageNo(pageNo + 1)}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="text-gray-600 font-medium">per page: 10</div>
      </div>
    </div>
  )
}
