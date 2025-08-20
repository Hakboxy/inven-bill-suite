import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface InventoryReport {
  id: string
  report_name: string
  report_type: string
  total_products: number | null
  total_stock_value: number | null
  low_stock_items: number | null
  out_of_stock_items: number | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface CreateInventoryReportData {
  reportName: string
  warehouse: string
  reportType: string
  startDate: string
  endDate: string
}

export const useInventoryReports = () => {
  const [reports, setReports] = useState<InventoryReportWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  interface InventoryReportWithDetails extends InventoryReport {
    warehouse: string
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match UI expectations
      const transformedReports: InventoryReportWithDetails[] = data?.map(report => ({
        ...report,
        warehouse: report.report_name.includes('Main') ? 'Main Warehouse' : 
                  report.report_name.includes('Secondary') ? 'Secondary Warehouse' : 'Main Warehouse'
      })) || []

      setReports(transformedReports)
    } catch (err) {
      console.error('Error fetching inventory reports:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const generateInventoryData = async (warehouse: string, reportType: string, startDate: string, endDate: string) => {
    try {
      // Fetch all products for inventory calculations
      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku, stock, price, low_stock_threshold, status')
        .eq('status', 'active')

      if (!products) return {
        total_products: 0,
        total_stock_value: 0,
        low_stock_items: 0,
        out_of_stock_items: 0
      }

      const totalProducts = products.length
      const totalStockValue = products.reduce((sum, product) => {
        const stock = Number(product.stock) || 0
        const price = Number(product.price) || 0
        return sum + (stock * price)
      }, 0)

      const lowStockItems = products.filter(product => {
        const stock = Number(product.stock) || 0
        const threshold = Number(product.low_stock_threshold) || 10
        return stock <= threshold && stock > 0
      }).length

      const outOfStockItems = products.filter(product => {
        const stock = Number(product.stock) || 0
        return stock === 0
      }).length

      return {
        total_products: totalProducts,
        total_stock_value: totalStockValue,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems
      }
    } catch (error) {
      console.error('Error generating inventory data:', error)
      return {
        total_products: 0,
        total_stock_value: 0,
        low_stock_items: 0,
        out_of_stock_items: 0
      }
    }
  }

  const createReport = async (reportData: CreateInventoryReportData) => {
    try {
      // Generate inventory data based on warehouse and type
      const inventoryData = await generateInventoryData(
        reportData.warehouse,
        reportData.reportType,
        reportData.startDate,
        reportData.endDate
      )

      const { data, error } = await supabase
        .from('inventory_reports')
        .insert([{
          report_name: reportData.reportName,
          report_type: reportData.reportType,
          ...inventoryData
        }])
        .select()
        .single()

      if (error) throw error

      toast.success(`Inventory report "${reportData.reportName}" created successfully`)
      await fetchReports()
      return data
    } catch (err) {
      console.error('Error creating inventory report:', err)
      setError(err instanceof Error ? err.message : 'Failed to create report')
      toast.error('Failed to create inventory report')
      throw err
    }
  }

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_reports')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Inventory report deleted successfully')
      await fetchReports()
    } catch (err) {
      console.error('Error deleting inventory report:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete report')
      toast.error('Failed to delete inventory report')
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return {
    reports,
    loading,
    error,
    createReport,
    deleteReport,
    refetch: fetchReports
  }
}