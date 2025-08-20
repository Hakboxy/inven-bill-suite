import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface FinancialReport {
  id: string
  report_name: string
  report_type: string
  start_date: string
  end_date: string
  total_revenue: number | null
  total_expenses: number | null
  net_profit: number | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface CreateFinancialReportData {
  reportName: string
  reportType: string
  startDate: string
  endDate: string
  description?: string
}

export const useFinancialReports = () => {
  const [reports, setReports] = useState<FinancialReportWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  interface FinancialReportWithStatus extends FinancialReport {
    period: string
    status: string
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match UI expectations
      const transformedReports: FinancialReportWithStatus[] = data?.map(report => ({
        ...report,
        period: `${new Date(report.start_date).toLocaleDateString()} - ${new Date(report.end_date).toLocaleDateString()}`,
        status: 'Completed' // All saved reports are completed
      })) || []

      setReports(transformedReports)
    } catch (err) {
      console.error('Error fetching financial reports:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const generateFinancialData = async (startDate: string, endDate: string, reportType: string) => {
    try {
      // Fetch invoices for revenue calculation
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, status, issue_date')
        .gte('issue_date', startDate)
        .lte('issue_date', endDate)
        .eq('status', 'paid')

      // Fetch purchase orders for expenses calculation
      const { data: purchaseOrders } = await supabase
        .from('purchase_orders')
        .select('total_amount, status, order_date')
        .gte('order_date', startDate)
        .lte('order_date', endDate)
        .eq('status', 'completed')

      const totalRevenue = invoices?.reduce((sum, invoice) => sum + (Number(invoice.total_amount) || 0), 0) || 0
      const totalExpenses = purchaseOrders?.reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0) || 0
      const netProfit = totalRevenue - totalExpenses

      return {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: netProfit
      }
    } catch (error) {
      console.error('Error generating financial data:', error)
      return {
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0
      }
    }
  }

  const createReport = async (reportData: CreateFinancialReportData) => {
    try {
      // Generate financial data based on date range
      const financialData = await generateFinancialData(
        reportData.startDate,
        reportData.endDate,
        reportData.reportType
      )

      const { data, error } = await supabase
        .from('financial_reports')
        .insert([{
          report_name: reportData.reportName,
          report_type: reportData.reportType,
          start_date: reportData.startDate,
          end_date: reportData.endDate,
          ...financialData
        }])
        .select()
        .single()

      if (error) throw error

      toast.success(`Financial report "${reportData.reportName}" created successfully`)
      await fetchReports()
      return data
    } catch (err) {
      console.error('Error creating financial report:', err)
      setError(err instanceof Error ? err.message : 'Failed to create report')
      toast.error('Failed to create financial report')
      throw err
    }
  }

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_reports')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Financial report deleted successfully')
      await fetchReports()
    } catch (err) {
      console.error('Error deleting financial report:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete report')
      toast.error('Failed to delete financial report')
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