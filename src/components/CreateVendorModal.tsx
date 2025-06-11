
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface CreateVendorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateVendorModal({ open, onOpenChange, onSubmit }: CreateVendorModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      vendorName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    }
  })

  const status = watch('status')

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
          <DialogTitle>Create New Vendor</DialogTitle>
          <DialogDescription>
            Add a new vendor to your database
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name *</Label>
            <Input
              id="vendorName"
              {...register('vendorName', { required: 'Vendor name is required' })}
              placeholder="Enter vendor name"
            />
            {errors.vendorName && <p className="text-sm text-red-500">{errors.vendorName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input
              id="contactPerson"
              {...register('contactPerson', { required: 'Contact person is required' })}
              placeholder="Enter contact person name"
            />
            {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter vendor address"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={status === 'active'}
              onCheckedChange={(checked) => setValue('status', checked ? 'active' : 'inactive')}
            />
            <Label htmlFor="status">Active Status</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Vendor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
