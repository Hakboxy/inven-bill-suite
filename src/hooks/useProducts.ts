import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  cost?: number
  stock: number
  low_stock_threshold: number
  status: 'active' | 'inactive' | 'out_of_stock'
  image_url?: string
  category_id?: string
  vendor_id?: string
  weight?: number
  dimensions?: string
  barcode?: string
  last_restocked?: string
  created_at: string
  updated_at: string
  category?: { name: string }
  vendor?: { name: string }
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          vendors(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedProducts = data?.map(product => ({
        ...product,
        category: product.categories,
        vendor: product.vendors
      })) || []
      
      setProducts(transformedProducts)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching products",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error

      await fetchProducts() // Refresh the list
      toast({
        title: "Product created",
        description: "Product has been created successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error creating product",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchProducts() // Refresh the list
      toast({
        title: "Product updated",
        description: "Product has been updated successfully"
      })
      return data
    } catch (err: any) {
      toast({
        title: "Error updating product",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchProducts() // Refresh the list
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully"
      })
    } catch (err: any) {
      toast({
        title: "Error deleting product",
        description: err.message,
        variant: "destructive"
      })
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchProducts()

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts() // Refresh data on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}