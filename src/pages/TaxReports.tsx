
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Plus, Calculator } from "lucide-react"
import { CreateTaxReportModal } from "@/components/CreateTaxReportModal"

const TaxReports = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [taxTypeFilter, setTaxTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Mock data
  const taxReports = [
    {
      id: 1,
      reportName: "Q4 2024 VAT Report",
      taxType: "VAT",
      filingPeriod: "Q4 2024",
      createdDate: "2024-01-15",
      status: "Filed"
    },
    {
      id: 2,
      reportName: "Annual Income Tax 2024",
      taxType: "Income Tax",
      filingPeriod: "2024",
      createdDate: "2024-01-10",
      status: "In Progress"
    },
    {
      id: 3,
      reportName: "GST Return - December 2024",
      taxType: "GST",
      filingPeriod: "December 2024",
      createdDate: "2024-01-05",
      status: "Filed"
    }
  ]

  const filteredReports = taxReports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = taxTypeFilter === 'all' || report.taxType === taxTypeFilter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateReport = (data: any) => {
    console.log('Creating tax report:', data)
    // Handle report creation logic here
    setIsCreateModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'Filed' ? 'default' : status === 'In Progress' ? 'secondary' : 'destructive'
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage your tax reports and filings
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Tax Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Reports
          </CardTitle>
          <CardDescription>
            View and manage all tax reports and filings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tax reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={taxTypeFilter} onValueChange={setTaxTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tax Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="VAT">VAT</SelectItem>
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="Income Tax">Income Tax</SelectItem>
                <SelectItem value="Corporate Tax">Corporate Tax</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Filed">Filed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Tax Type</TableHead>
                <TableHead>Filing Period</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.reportName}</TableCell>
                  <TableCell>{report.taxType}</TableCell>
                  <TableCell>{report.filingPeriod}</TableCell>
                  <TableCell>{report.createdDate}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateTaxReportModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  )
}

export default TaxReports
