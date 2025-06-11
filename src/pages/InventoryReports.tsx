
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Plus, Package } from "lucide-react"
import { CreateInventoryReportModal } from "@/components/CreateInventoryReportModal"

const InventoryReports = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [reportTypeFilter, setReportTypeFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Mock data
  const inventoryReports = [
    {
      id: 1,
      reportName: "Monthly Stock Summary - Jan 2024",
      warehouse: "Main Warehouse",
      reportType: "Stock Summary",
      createdDate: "2024-01-15"
    },
    {
      id: 2,
      reportName: "Low Stock Alert Report",
      warehouse: "Secondary Warehouse",
      reportType: "Low Stock",
      createdDate: "2024-01-10"
    },
    {
      id: 3,
      reportName: "Stock Movement - December 2024",
      warehouse: "Main Warehouse",
      reportType: "Stock Movement",
      createdDate: "2024-01-05"
    }
  ]

  const filteredReports = inventoryReports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesWarehouse = warehouseFilter === 'all' || report.warehouse === warehouseFilter
    const matchesType = reportTypeFilter === 'all' || report.reportType === reportTypeFilter
    return matchesSearch && matchesWarehouse && matchesType
  })

  const handleCreateReport = (data: any) => {
    console.log('Creating inventory report:', data)
    // Handle report creation logic here
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage inventory and stock reports
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Inventory Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Reports
          </CardTitle>
          <CardDescription>
            View and manage all inventory reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                <SelectItem value="Secondary Warehouse">Secondary Warehouse</SelectItem>
                <SelectItem value="Distribution Center">Distribution Center</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Stock Summary">Stock Summary</SelectItem>
                <SelectItem value="Stock Movement">Stock Movement</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Created Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.reportName}</TableCell>
                  <TableCell>{report.warehouse}</TableCell>
                  <TableCell>{report.reportType}</TableCell>
                  <TableCell>{report.createdDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateInventoryReportModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  )
}

export default InventoryReports
