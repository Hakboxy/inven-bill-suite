
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface CreatePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PaymentFormData {
  customerId: string
  amount: number
  paymentMethod: string
  paymentDate: Date
  reference?: string
}

const mockCustomers = [
  { id: "CUST-001", name: "John Smith" },
  { id: "CUST-002", name: "Sarah Johnson" },
  { id: "CUST-003", name: "Mike Davis" },
  { id: "CUST-004", name: "Emily Brown" },
  { id: "CUST-005", name: "David Wilson" }
]

export function CreatePaymentModal({ open, onOpenChange }: CreatePaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentDate: new Date()
    }
  })

  const watchedCustomerId = watch('customerId')
  const watchedPaymentMethod = watch('paymentMethod')

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const customerName = mockCustomers.find(c => c.id === data.customerId)?.name || 'Unknown'
      
      toast({
        title: "Payment Created",
        description: `Payment of $${data.amount} for ${customerName} has been recorded successfully.`,
      })
      
      reset()
      setSelectedDate(new Date())
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setValue('paymentDate', date)
    }
  }

  const handleCancel = () => {
    reset()
    setSelectedDate(new Date())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
            <DialogDescription>
              Add a new payment record to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Customer Selection */}
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select 
                value={watchedCustomerId} 
                onValueChange={(value) => setValue('customerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <span className="text-sm text-destructive">Customer is required</span>
              )}
            </div>

            {/* Payment Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { 
                  required: 'Payment amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
              />
              {errors.amount && (
                <span className="text-sm text-destructive">{errors.amount.message}</span>
              )}
            </div>

            {/* Payment Method */}
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={watchedPaymentMethod} 
                onValueChange={(value) => setValue('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <span className="text-sm text-destructive">Payment method is required</span>
              )}
            </div>

            {/* Payment Date */}
            <div className="grid gap-2">
              <Label>Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reference (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Payment reference or note"
                {...register('reference')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
