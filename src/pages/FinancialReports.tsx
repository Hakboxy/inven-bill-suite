
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Plus, FileText } from "lucide-react"
import { CreateFinancialReportModal } from "@/components/CreateFinancialReportModal"

const FinancialReports = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [reportTypeFilter, setReportTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Mock data
  const financialReports = [
    {
      id: 1,
      reportName: "Q4 2024 Income Statement",
      reportType: "Income Statement",
      period: "Q4 2024",
      createdDate: "2024-01-15",
      status: "Completed"
    },
    {
      id: 2,
      reportName: "Annual Balance Sheet 2024",
      reportType: "Balance Sheet",
      period: "2024",
      createdDate: "2024-01-10",
      status: "In Progress"
    },
    {
      id: 3,
      reportName: "Monthly Cash Flow - Dec 2024",
      reportType: "Cash Flow",
      period: "December 2024",
      createdDate: "2024-01-05",
      status: "Completed"
    }
  ]

  const filteredReports = financialReports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = reportTypeFilter === 'all' || report.reportType === reportTypeFilter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateReport = (data: any) => {
    console.log('Creating financial report:', data)
    // Handle report creation logic here
    setIsCreateModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'Completed' ? 'default' : status === 'In Progress' ? 'secondary' : 'destructive'
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage your financial reports
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Financial Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Financial Reports
          </CardTitle>
          <CardDescription>
            View and manage all financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Income Statement">Income Statement</SelectItem>
                <SelectItem value="Balance Sheet">Balance Sheet</SelectItem>
                <SelectItem value="Cash Flow">Cash Flow</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.reportName}</TableCell>
                  <TableCell>{report.reportType}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.createdDate}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateFinancialReportModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  )
}

export default FinancialReports
