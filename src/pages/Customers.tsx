
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Filter } from "lucide-react"
import { CreateCustomerModal } from "@/components/CreateCustomerModal"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customerGroup: string
  status: 'active' | 'inactive'
}

const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234-567-8900',
    customerGroup: 'Premium',
    status: 'active'
  },
  {
    id: 'CUST-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 234-567-8901',
    customerGroup: 'Standard',
    status: 'active'
  },
  {
    id: 'CUST-003',
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1 234-567-8902',
    customerGroup: 'VIP',
    status: 'inactive'
  },
  {
    id: 'CUST-004',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 234-567-8903',
    customerGroup: 'Standard',
    status: 'active'
  }
]

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    const matchesGroup = groupFilter === 'all' || customer.customerGroup === groupFilter
    
    return matchesSearch && matchesStatus && matchesGroup
  })

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const handleCreateCustomer = (customerData: any) => {
    const newCustomer: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      ...customerData
    }
    setCustomers([...customers, newCustomer])
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.customerGroup === 'Premium').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.customerGroup === 'VIP').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>View and manage all customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Customer Group</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.customerGroup}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateCustomerModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateCustomer}
      />
    </div>
  )
}

export default Customers
