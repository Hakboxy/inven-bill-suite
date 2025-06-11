
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateInventoryReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateInventoryReportModal({ open, onOpenChange, onSubmit }: CreateInventoryReportModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      reportName: '',
      warehouse: '',
      reportType: '',
      startDate: '',
      endDate: ''
    }
  })

  const warehouse = watch('warehouse')
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
          <DialogTitle>Create Inventory Report</DialogTitle>
          <DialogDescription>
            Generate a new inventory report for your warehouse
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
            <Label htmlFor="warehouse">Warehouse *</Label>
            <Select onValueChange={(value) => setValue('warehouse', value)} value={warehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                <SelectItem value="Secondary Warehouse">Secondary Warehouse</SelectItem>
                <SelectItem value="Distribution Center">Distribution Center</SelectItem>
                <SelectItem value="Retail Store">Retail Store</SelectItem>
              </SelectContent>
            </Select>
            {errors.warehouse && <p className="text-sm text-red-500">{errors.warehouse.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select onValueChange={(value) => setValue('reportType', value)} value={reportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stock Summary">Stock Summary</SelectItem>
                <SelectItem value="Stock Movement">Stock Movement</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
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
