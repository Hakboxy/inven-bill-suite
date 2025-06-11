
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface CreateCustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateCustomerModal({ open, onOpenChange, onSubmit }: CreateCustomerModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      customerGroup: 'Standard',
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
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your database
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
              placeholder="Enter customer address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerGroup">Customer Group</Label>
            <Select onValueChange={(value) => setValue('customerGroup', value)} defaultValue="Standard">
              <SelectTrigger>
                <SelectValue placeholder="Select customer group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit">Save Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
