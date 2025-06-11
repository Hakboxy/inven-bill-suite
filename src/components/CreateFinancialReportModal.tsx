
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateFinancialReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateFinancialReportModal({ open, onOpenChange, onSubmit }: CreateFinancialReportModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      reportName: '',
      reportType: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  })

  const reportType = watch('reportType')

  const onFormSubmit = (data: any) => {
    onSubmit(data)
    reset()
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Financial Report</DialogTitle>
          <DialogDescription>
            Generate a new financial report for your business
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name *</Label>
            <Input
              id="reportName"
              {...register('reportName', { required: 'Report name is required' })}
              placeholder="Enter report name"
            />
            {errors.reportName && <p className="text-sm text-red-500">{errors.reportName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select onValueChange={(value) => setValue('reportType', value)} value={reportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Income Statement">Income Statement</SelectItem>
                <SelectItem value="Balance Sheet">Balance Sheet</SelectItem>
                <SelectItem value="Cash Flow">Cash Flow</SelectItem>
              </SelectContent>
            </Select>
            {errors.reportType && <p className="text-sm text-red-500">{errors.reportType.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate', { required: 'End date is required' })}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter report description (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Generate Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
