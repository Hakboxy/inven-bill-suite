import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  customer_email?: string
  customer_address?: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  notes?: string
  terms?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  product_id?: string
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface CreateInvoiceData {
  invoice_number: string
  customer_id: string
  customer_name: string
  customer_email?: string
  customer_address?: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: 'draft' | 'sent'
  notes?: string
  terms?: string
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching invoices",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoiceById = async (id: string): Promise<{ invoice: Invoice | null, items: InvoiceItem[] }> => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()

      if (invoiceError) throw invoiceError

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)

      if (itemsError) throw itemsError

      return {
        invoice: invoiceData,
        items: itemsData || []
      }
    } catch (err: any) {
      toast({
        title: "Error fetching invoice",
        description: err.message,
        variant: "destructive"
      })
      return { invoice: null, items: [] }
    }
  }

  const createInvoice = async (invoiceData: CreateInvoiceData) => {
    try {
      const { items, ...invoice } = invoiceData

      // Create invoice
      const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoice])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const invoiceItems = items.map(item => ({
        ...item,
        invoice_id: createdInvoice.id
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError

      await fetchInvoices()
      toast({
        title: "Invoice created",
        description: `Invoice ${invoice.invoice_number} has been created successfully`
      })
      return createdInvoice
    } catch (err: any) {
      toast({
        title: "Error creating invoice",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateInvoice = async (id: string, invoiceData: Partial<CreateInvoiceData>) => {
    try {
      const { items, ...invoice } = invoiceData

      // Update invoice
      const { data: updatedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id)
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Update invoice items if provided
      if (items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id)

        if (deleteError) throw deleteError

        // Insert new items
        const invoiceItems = items.map(item => ({
          ...item,
          invoice_id: id
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems)

        if (itemsError) throw itemsError
      }

      await fetchInvoices()
      toast({
        title: "Invoice updated",
        description: "Invoice has been updated successfully"
      })
      return updatedInvoice
    } catch (err: any) {
      toast({
        title: "Error updating invoice",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)

      if (itemsError) throw itemsError

      // Delete invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (invoiceError) throw invoiceError

      await fetchInvoices()
      toast({
        title: "Invoice deleted",
        description: "Invoice has been deleted successfully"
      })
    } catch (err: any) {
      toast({
        title: "Error deleting invoice",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchInvoices()

    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          fetchInvoices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    fetchInvoiceById,
    refetch: fetchInvoices
  }
}