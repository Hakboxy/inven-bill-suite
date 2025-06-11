
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import { CreateVendorModal } from "@/components/CreateVendorModal"

interface Vendor {
  id: string
  vendorName: string
  contactPerson: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

const mockVendors: Vendor[] = [
  {
    id: 'VEND-001',
    vendorName: 'Tech Solutions Inc.',
    contactPerson: 'Robert Brown',
    email: 'robert@techsolutions.com',
    phone: '+1 555-0101',
    status: 'active'
  },
  {
    id: 'VEND-002',
    vendorName: 'Office Supplies Co.',
    contactPerson: 'Lisa White',
    email: 'lisa@officesupplies.com',
    phone: '+1 555-0102',
    status: 'active'
  },
  {
    id: 'VEND-003',
    vendorName: 'Manufacturing Partners',
    contactPerson: 'David Green',
    email: 'david@manufacturing.com',
    phone: '+1 555-0103',
    status: 'inactive'
  }
]

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const handleCreateVendor = (vendorData: any) => {
    const newVendor: Vendor = {
      id: `VEND-${String(vendors.length + 1).padStart(3, '0')}`,
      ...vendorData
    }
    setVendors([...vendors, newVendor])
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your vendor relationships</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Vendor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.filter(v => v.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.filter(v => v.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
          <CardDescription>View and manage all vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                  <TableCell>{vendor.contactPerson}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateVendorModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateVendor}
      />
    </div>
  )
}

export default Vendors
