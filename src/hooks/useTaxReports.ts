import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface TaxReport {
  id: string
  report_name: string
  tax_period: string
  start_date: string
  end_date: string
  taxable_income: number | null
  tax_rate: number | null
  tax_amount: number | null
  status: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface CreateTaxReportData {
  reportName: string
  taxPeriod: string
  startDate: string
  endDate: string
  taxType: string
}

export const useTaxReports = () => {
  const [reports, setReports] = useState<TaxReportWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  interface TaxReportWithDetails extends TaxReport {
    taxType: string
    filingPeriod: string
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tax_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match UI expectations
      const transformedReports: TaxReportWithDetails[] = data?.map(report => ({
        ...report,
        taxType: report.tax_period.includes('VAT') ? 'VAT' : 
                report.tax_period.includes('GST') ? 'GST' : 'Income Tax',
        filingPeriod: report.tax_period,
        status: report.status || 'Filed'
      })) || []

      setReports(transformedReports)
    } catch (err) {
      console.error('Error fetching tax reports:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const calculateTaxData = async (startDate: string, endDate: string, taxType: string) => {
    try {
      // Fetch paid invoices for taxable income calculation
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, tax_amount, status, issue_date')
        .gte('issue_date', startDate)
        .lte('issue_date', endDate)
        .eq('status', 'paid')

      const taxableIncome = invoices?.reduce((sum, invoice) => {
        const amount = Number(invoice.total_amount) || 0
        const tax = Number(invoice.tax_amount) || 0
        return sum + (amount - tax) // Subtract tax to get pre-tax amount
      }, 0) || 0

      const totalTaxCollected = invoices?.reduce((sum, invoice) => 
        sum + (Number(invoice.tax_amount) || 0), 0) || 0

      // Default tax rates based on type
      let taxRate = 0
      switch (taxType.toLowerCase()) {
        case 'vat':
          taxRate = 0.20 // 20% VAT
          break
        case 'gst':
          taxRate = 0.10 // 10% GST
          break
        case 'income tax':
          taxRate = 0.25 // 25% Corporate Income Tax
          break
        default:
          taxRate = 0.15 // Default 15%
      }

      return {
        taxable_income: taxableIncome,
        tax_rate: taxRate,
        tax_amount: totalTaxCollected || (taxableIncome * taxRate)
      }
    } catch (error) {
      console.error('Error calculating tax data:', error)
      return {
        taxable_income: 0,
        tax_rate: 0,
        tax_amount: 0
      }
    }
  }

  const createReport = async (reportData: CreateTaxReportData) => {
    try {
      // Calculate tax data based on date range and type
      const taxData = await calculateTaxData(
        reportData.startDate,
        reportData.endDate,
        reportData.taxType
      )

      const { data, error } = await supabase
        .from('tax_reports')
        .insert([{
          report_name: reportData.reportName,
          tax_period: reportData.taxPeriod,
          start_date: reportData.startDate,
          end_date: reportData.endDate,
          status: 'draft',
          ...taxData
        }])
        .select()
        .single()

      if (error) throw error

      toast.success(`Tax report "${reportData.reportName}" created successfully`)
      await fetchReports()
      return data
    } catch (err) {
      console.error('Error creating tax report:', err)
      setError(err instanceof Error ? err.message : 'Failed to create report')
      toast.error('Failed to create tax report')
      throw err
    }
  }

  const updateReportStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tax_reports')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      toast.success('Tax report status updated successfully')
      await fetchReports()
    } catch (err) {
      console.error('Error updating tax report status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update report status')
      toast.error('Failed to update report status')
    }
  }

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_reports')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Tax report deleted successfully')
      await fetchReports()
    } catch (err) {
      console.error('Error deleting tax report:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete report')
      toast.error('Failed to delete tax report')
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
    updateReportStatus,
    deleteReport,
    refetch: fetchReports
  }
}