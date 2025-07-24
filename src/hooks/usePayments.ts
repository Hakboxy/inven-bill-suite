import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Payment {
  id: string
  payment_number: string
  customer_id: string
  customer_name?: string
  invoice_id?: string
  amount: number
  payment_method?: string
  payment_date: string
  transaction_id?: string
  notes?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentData {
  customer_id: string
  invoice_id?: string
  amount: number
  payment_method?: string
  payment_date: string
  transaction_id?: string
  notes?: string
  status?: 'pending' | 'completed' | 'failed' | 'refunded'
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          customers(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedPayments = data?.map(payment => ({
        ...payment,
        customer_name: payment.customers?.name || 'Unknown Customer'
      })) || []
      
      setPayments(transformedPayments)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching payments",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentById = async (id: string): Promise<Payment | null> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          customers(name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        ...data,
        customer_name: data.customers?.name || 'Unknown Customer'
      }
    } catch (err: any) {
      toast({
        title: "Error fetching payment",
        description: err.message,
        variant: "destructive"
      })
      return null
    }
  }

  const createPayment = async (paymentData: CreatePaymentData) => {
    try {
      // Generate payment number
      const { data: paymentNumber, error: numberError } = await supabase
        .rpc('generate_payment_number')

      if (numberError) throw numberError

      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          payment_number: paymentNumber,
          status: paymentData.status || 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      await fetchPayments()
      toast({
        title: "Payment created",
        description: `Payment ${paymentNumber} has been created successfully`
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error creating payment",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const updatePayment = async (id: string, updates: Partial<CreatePaymentData>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchPayments()
      toast({
        title: "Payment updated",
        description: "Payment has been updated successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error updating payment",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchPayments()
      toast({
        title: "Payment deleted",
        description: "Payment has been deleted successfully"
      })
    } catch (err: any) {
      toast({
        title: "Error deleting payment",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchPayments()

    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          fetchPayments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    fetchPaymentById,
    refetch: fetchPayments
  }
}