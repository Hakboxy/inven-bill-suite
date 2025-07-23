import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Vendor {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVendors(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching vendors",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createVendor = async (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single()

      if (error) throw error

      await fetchVendors()
      toast({
        title: "Vendor created",
        description: "Vendor has been created successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error creating vendor",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchVendors()
      toast({
        title: "Vendor updated",
        description: "Vendor has been updated successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error updating vendor",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchVendors()
      toast({
        title: "Vendor deleted",
        description: "Vendor has been deleted successfully"
      })
    } catch (err: any) {
      toast({
        title: "Error deleting vendor",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchVendors()

    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors'
        },
        () => {
          fetchVendors()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    vendors,
    loading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors
  }
}