
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import { CreateCustomerGroupModal } from "@/components/CreateCustomerGroupModal"

interface CustomerGroup {
  id: string
  groupName: string
  description: string
  createdDate: string
}

const mockCustomerGroups: CustomerGroup[] = [
  {
    id: 'GRP-001',
    groupName: 'Standard',
    description: 'Regular customers with standard pricing',
    createdDate: '2024-01-15'
  },
  {
    id: 'GRP-002',
    groupName: 'Premium',
    description: 'Premium customers with special discounts',
    createdDate: '2024-01-20'
  },
  {
    id: 'GRP-003',
    groupName: 'VIP',
    description: 'VIP customers with exclusive benefits',
    createdDate: '2024-02-01'
  }
]

const CustomerGroups = () => {
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(mockCustomerGroups)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredGroups = customerGroups.filter(group => 
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateGroup = (groupData: any) => {
    const newGroup: CustomerGroup = {
      id: `GRP-${String(customerGroups.length + 1).padStart(3, '0')}`,
      ...groupData,
      createdDate: new Date().toISOString().split('T')[0]
    }
    setCustomerGroups([...customerGroups, newGroup])
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Groups</h1>
          <p className="text-muted-foreground">Manage customer group categories</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Customer Group
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Groups List</CardTitle>
          <CardDescription>View and manage all customer groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.groupName}</TableCell>
                  <TableCell>{group.description}</TableCell>
                  <TableCell>
                    {new Date(group.createdDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateCustomerGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateGroup}
      />
    </div>
  )
}

export default CustomerGroups
