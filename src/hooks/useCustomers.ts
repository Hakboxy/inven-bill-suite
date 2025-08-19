import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  status: 'active' | 'inactive'
  total_orders: number
  total_spent: number
  last_order_date: string | null
  customer_group_id: string | null
  created_at: string
  updated_at: string
  customer_groups?: { name: string }
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_groups(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedCustomers = data?.map(customer => ({
        ...customer,
        status: customer.status as 'active' | 'inactive'
      })) || []
      
      setCustomers(transformedCustomers)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching customers",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (customerData: any) => {
    try {
      // Map form data to database schema
      const dbCustomerData = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        address: customerData.address,
        status: customerData.status,
        customer_group_id: customerData.customerGroup, // Map customerGroup to customer_group_id
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([dbCustomerData])
        .select()
        .single()

      if (error) throw error

      await fetchCustomers()
      toast({
        title: "Customer created",
        description: "Customer has been created successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error creating customer",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchCustomers()
      toast({
        title: "Customer updated",
        description: "Customer has been updated successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error updating customer",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchCustomers()
      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully"
      })
    } catch (err: any) {
      toast({
        title: "Error deleting customer",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchCustomers()

    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          fetchCustomers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  }
}