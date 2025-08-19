import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface CustomerGroup {
  id: string
  name: string
  description: string | null
  discount_percentage: number | null
  created_at: string
  updated_at: string
}

export const useCustomerGroups = () => {
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCustomerGroups = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customer_groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomerGroups(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching customer groups",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createCustomerGroup = async (groupData: Omit<CustomerGroup, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customer_groups')
        .insert([groupData])
        .select()
        .single()

      if (error) throw error

      await fetchCustomerGroups()
      toast({
        title: "Customer group created",
        description: "Customer group has been created successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error creating customer group",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateCustomerGroup = async (id: string, updates: Partial<CustomerGroup>) => {
    try {
      const { data, error } = await supabase
        .from('customer_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchCustomerGroups()
      toast({
        title: "Customer group updated",
        description: "Customer group has been updated successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error updating customer group",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteCustomerGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_groups')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchCustomerGroups()
      toast({
        title: "Customer group deleted",
        description: "Customer group has been deleted successfully"
      })
    } catch (err: any) {
      toast({
        title: "Error deleting customer group",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchCustomerGroups()

    const channel = supabase
      .channel('customer-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_groups'
        },
        () => {
          fetchCustomerGroups()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    customerGroups,
    loading,
    error,
    createCustomerGroup,
    updateCustomerGroup,
    deleteCustomerGroup,
    refetch: fetchCustomerGroups
  }
}