
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateCustomerGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateCustomerGroupModal({ open, onOpenChange, onSubmit }: CreateCustomerGroupModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      groupName: '',
      description: ''
    }
  })

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
          <DialogTitle>Create New Customer Group</DialogTitle>
          <DialogDescription>
            Add a new customer group category
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              {...register('groupName', { required: 'Group name is required' })}
              placeholder="Enter group name"
            />
            {errors.groupName && <p className="text-sm text-red-500">{errors.groupName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter group description"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
