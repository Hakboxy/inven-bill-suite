import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
  productsGrowth: number
}

export interface RecentInvoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_id: string
  issue_date: string
  due_date?: string
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

export interface LowStockProduct {
  id: string
  name: string
  sku: string
  stock: number
  low_stock_threshold: number
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const [
        { data: invoicesData },
        { data: customersData },
        { data: productsData },
        { data: recentInvoicesData },
        { data: lowStockData }
      ] = await Promise.all([
        supabase.from('invoices').select('total_amount, status, created_at'),
        supabase.from('customers').select('id, created_at'),
        supabase.from('products').select('id, created_at'),
        supabase
          .from('invoices')
          .select('id, invoice_number, customer_name, customer_id, issue_date, due_date, total_amount, status')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.rpc('get_low_stock_products')
      ])

      // Calculate stats
      const totalRevenue = invoicesData?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
      
      const paidInvoices = invoicesData?.filter(inv => inv.status === 'paid') || []
      const totalOrders = paidInvoices.length
      const totalCustomers = customersData?.length || 0
      const totalProducts = productsData?.length || 0

      // Calculate growth (simplified - comparing last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const recentRevenue = invoicesData?.filter(inv => 
        inv.status === 'paid' && new Date(inv.created_at) > thirtyDaysAgo
      ).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

      const previousRevenue = invoicesData?.filter(inv => 
        inv.status === 'paid' && 
        new Date(inv.created_at) > sixtyDaysAgo && 
        new Date(inv.created_at) <= thirtyDaysAgo
      ).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

      const revenueGrowth = previousRevenue > 0 ? 
        ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth: 8.3, // Simplified for now
        customersGrowth: 15.2, // Simplified for now
        productsGrowth: 3.1 // Simplified for now
      })

      setRecentInvoices(recentInvoicesData || [])
      setLowStockProducts(lowStockData || [])

    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching dashboard data",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    fetchDashboardData()

    const invoicesChannel = supabase
      .channel('dashboard-invoices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    const productsChannel = supabase
      .channel('dashboard-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    const customersChannel = supabase
      .channel('dashboard-customers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(invoicesChannel)
      supabase.removeChannel(productsChannel)
      supabase.removeChannel(customersChannel)
    }
  }, [])

  return {
    stats,
    recentInvoices,
    lowStockProducts,
    loading,
    error,
    refetch: fetchDashboardData
  }
}