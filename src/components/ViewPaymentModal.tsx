
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Calendar, User, DollarSign } from "lucide-react"

interface Payment {
  id: string
  customerId: string
  customerName: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
}

interface ViewPaymentModalProps {
  payment: Payment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPaymentModal({ payment, open, onOpenChange }: ViewPaymentModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            View complete payment information for {payment.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            {getStatusBadge(payment.status)}
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Payment ID
                </div>
                <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {payment.id}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Customer ID
                </div>
                <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {payment.customerId}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Customer Name
              </div>
              <div className="text-lg font-semibold">
                {payment.customerName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${payment.amount.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Payment Date
                </div>
                <div className="text-lg">
                  {new Date(payment.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {getPaymentMethodIcon(payment.paymentMethod)}
                Payment Method
              </div>
              <div className="text-lg font-medium">
                {payment.paymentMethod}
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Transaction Details
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              Payment processed on {new Date(payment.date).toLocaleDateString()} via {payment.paymentMethod.toLowerCase()}. 
              {payment.status === 'completed' && ' Transaction completed successfully.'}
              {payment.status === 'pending' && ' Transaction is currently being processed.'}
              {payment.status === 'failed' && ' Transaction failed to process.'}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
