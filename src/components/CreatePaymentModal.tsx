
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useCustomers } from "@/hooks/useCustomers"
import { usePayments, CreatePaymentData } from "@/hooks/usePayments"

interface CreatePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPayment?: any
}

interface PaymentFormData {
  customerId: string
  invoiceId?: string
  amount: number
  paymentMethod: string
  paymentDate: Date
  transactionId?: string
  notes?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
}

export function CreatePaymentModal({ open, onOpenChange, editingPayment }: CreatePaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { toast } = useToast()
  const { customers, loading: customersLoading } = useCustomers()
  const { createPayment, updatePayment } = usePayments()
  const isEditing = Boolean(editingPayment)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentDate: new Date(),
      status: 'completed',
      amount: 0,
      customerId: '',
      paymentMethod: '',
      invoiceId: '',
      transactionId: '',
      notes: ''
    }
  })

  // Reset form when editing payment changes
  useEffect(() => {
    if (editingPayment) {
      setValue('customerId', editingPayment.customer_id)
      setValue('invoiceId', editingPayment.invoice_id || '')
      setValue('amount', editingPayment.amount)
      setValue('paymentMethod', editingPayment.payment_method || '')
      setValue('status', editingPayment.status)
      setValue('transactionId', editingPayment.transaction_id || '')
      setValue('notes', editingPayment.notes || '')
      const paymentDate = new Date(editingPayment.payment_date)
      setValue('paymentDate', paymentDate)
      setSelectedDate(paymentDate)
    } else {
      reset({
        paymentDate: new Date(),
        status: 'completed',
        amount: 0,
        customerId: '',
        paymentMethod: '',
        invoiceId: '',
        transactionId: '',
        notes: ''
      })
      setSelectedDate(new Date())
    }
  }, [editingPayment, setValue, reset])

  const watchedCustomerId = watch('customerId')
  const watchedPaymentMethod = watch('paymentMethod')
  const watchedStatus = watch('status')

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    
    try {
      const paymentData: CreatePaymentData = {
        customer_id: data.customerId,
        invoice_id: data.invoiceId || undefined,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_date: data.paymentDate.toISOString().split('T')[0],
        transaction_id: data.transactionId || undefined,
        notes: data.notes || undefined,
        status: data.status
      }

      if (isEditing && editingPayment) {
        await updatePayment(editingPayment.id, paymentData)
      } else {
        await createPayment(paymentData)
      }
      
      handleCancel()
    } catch (error) {
      console.error('Error saving payment:', error)
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
            <DialogTitle>{isEditing ? 'Edit Payment' : 'Create Payment'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update payment details.' : 'Add a new payment record to the system.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              {customersLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select 
                  value={watchedCustomerId} 
                  onValueChange={(value) => setValue('customerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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

            {/* Invoice ID (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="invoiceId">Invoice ID (Optional)</Label>
              <Input
                id="invoiceId"
                placeholder="INV-001"
                {...register('invoiceId')}
              />
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
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <span className="text-sm text-destructive">Payment method is required</span>
              )}
            </div>

            {/* Payment Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={watchedStatus} 
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Transaction ID (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
              <Input
                id="transactionId"
                placeholder="Transaction reference"
                {...register('transactionId')}
              />
            </div>

            {/* Notes (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the payment"
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Payment' : 'Create Payment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
