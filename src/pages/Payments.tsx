
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Search, Plus, Eye } from "lucide-react"
import { CreatePaymentModal } from "@/components/CreatePaymentModal"
import { ViewPaymentModal } from "@/components/ViewPaymentModal"

interface Payment {
  id: string
  customerId: string
  customerName: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
}

const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    customerId: "CUST-001",
    customerName: "John Smith",
    amount: 1250.00,
    date: "2024-01-15",
    status: "completed",
    paymentMethod: "Credit Card"
  },
  {
    id: "PAY-002",
    customerId: "CUST-002",
    customerName: "Sarah Johnson",
    amount: 850.50,
    date: "2024-01-14",
    status: "pending",
    paymentMethod: "Bank Transfer"
  },
  {
    id: "PAY-003",
    customerId: "CUST-003",
    customerName: "Mike Davis",
    amount: 2100.75,
    date: "2024-01-13",
    status: "completed",
    paymentMethod: "Cash"
  },
  {
    id: "PAY-004",
    customerId: "CUST-004",
    customerName: "Emily Brown",
    amount: 450.00,
    date: "2024-01-12",
    status: "failed",
    paymentMethod: "Credit Card"
  }
]

const Payments = () => {
  const [payments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsViewModalOpen(true)
  }

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = payments.filter(p => p.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage and track all payment transactions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View and manage all payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreatePaymentModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
      
      {selectedPayment && (
        <ViewPaymentModal
          payment={selectedPayment}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        />
      )}
    </div>
  )
}

export default Payments
