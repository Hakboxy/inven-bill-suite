
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Plus, ArrowUpDown } from "lucide-react"

interface SalesOrder {
  id: string
  customerId: string
  customerName: string
  orderDate: string
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: number
}

const mockSalesOrders: SalesOrder[] = [
  {
    id: "SO-001",
    customerId: "CUST-001",
    customerName: "John Smith",
    orderDate: "2024-01-15",
    total: 1250.00,
    status: "delivered",
    items: 3
  },
  {
    id: "SO-002",
    customerId: "CUST-002",
    customerName: "Sarah Johnson",
    orderDate: "2024-01-14",
    total: 850.50,
    status: "shipped",
    items: 2
  },
  {
    id: "SO-003",
    customerId: "CUST-003",
    customerName: "Mike Davis",
    orderDate: "2024-01-13",
    total: 2100.75,
    status: "confirmed",
    items: 5
  },
  {
    id: "SO-004",
    customerId: "CUST-004",
    customerName: "Emily Brown",
    orderDate: "2024-01-12",
    total: 450.00,
    status: "pending",
    items: 1
  },
  {
    id: "SO-005",
    customerId: "CUST-005",
    customerName: "David Wilson",
    orderDate: "2024-01-11",
    total: 750.25,
    status: "cancelled",
    items: 2
  }
]

const SalesOrders = () => {
  const [orders, setOrders] = useState<SalesOrder[]>(mockSalesOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof SalesOrder>("orderDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: keyof SalesOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case 'shipped':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Shipped</Badge>
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">Manage and track all sales orders</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From active orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Orders</CardTitle>
          <CardDescription>View and manage all sales orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or order ID..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Order ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center">
                      Order Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No sales orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>${order.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.items} items</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesOrders
