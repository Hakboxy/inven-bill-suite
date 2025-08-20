import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface CompanySettings {
  id?: string
  company_name: string
  company_email: string | null
  company_phone: string | null
  company_address: string | null
  tax_id: string | null
  currency: string | null
  timezone: string | null
  logo_url: string | null
  fiscal_year_start: string | null
  created_at?: string | null
  updated_at?: string | null
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    company_email: null,
    company_phone: null,
    company_address: null,
    tax_id: null,
    currency: 'USD',
    timezone: 'UTC',
    logo_url: null,
    fiscal_year_start: null
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
      toast({
        title: "Error",
        description: "Failed to load company settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('company_settings')
        .upsert({
          ...settings,
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setSettings(data)
      toast({
        title: "Settings Saved",
        description: "Company settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving company settings:', error)
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File) => {
    try {
      setLoading(true)

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `company-logo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      // Update settings with new logo URL
      await saveSettings({ logo_url: publicUrl })

      toast({
        title: "Logo Uploaded",
        description: `Logo "${file.name}" has been uploaded successfully.`,
      })
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    setSettings,
    loading,
    saveSettings,
    uploadLogo,
    refetch: fetchSettings
  }
}