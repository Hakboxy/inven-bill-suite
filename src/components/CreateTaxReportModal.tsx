
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateTaxReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateTaxReportModal({ open, onOpenChange, onSubmit }: CreateTaxReportModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      reportName: '',
      taxType: '',
      filingPeriod: '',
      description: ''
    }
  })

  const taxType = watch('taxType')
  const filingPeriod = watch('filingPeriod')

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
          <DialogTitle>Create Tax Report</DialogTitle>
          <DialogDescription>
            Generate a new tax report for filing
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
            <Label htmlFor="taxType">Tax Type *</Label>
            <Select onValueChange={(value) => setValue('taxType', value)} value={taxType}>
              <SelectTrigger>
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VAT">VAT</SelectItem>
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="Income Tax">Income Tax</SelectItem>
                <SelectItem value="Corporate Tax">Corporate Tax</SelectItem>
                <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                <SelectItem value="Property Tax">Property Tax</SelectItem>
              </SelectContent>
            </Select>
            {errors.taxType && <p className="text-sm text-red-500">{errors.taxType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="filingPeriod">Filing Period *</Label>
            <Select onValueChange={(value) => setValue('filingPeriod', value)} value={filingPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select filing period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="January 2024">January 2024</SelectItem>
                <SelectItem value="February 2024">February 2024</SelectItem>
                <SelectItem value="March 2024">March 2024</SelectItem>
                <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                <SelectItem value="2024">Annual 2024</SelectItem>
              </SelectContent>
            </Select>
            {errors.filingPeriod && <p className="text-sm text-red-500">{errors.filingPeriod.message}</p>}
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
