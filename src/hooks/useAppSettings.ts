import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface AppSetting {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: string | null
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface GeneralSettings {
  language: string
  currency: string
  timezone: string
  dateFormat: string
  timeFormat: string
  theme: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  systemUpdates: boolean
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<GeneralSettings>({
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    systemUpdates: true
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')

      if (error) throw error

      // Convert settings array to object
      const settingsObj: Partial<GeneralSettings> = {}
      data?.forEach((setting) => {
        const key = setting.setting_key as keyof GeneralSettings
        let value: any = setting.setting_value

        // Convert string values to appropriate types
        if (setting.setting_type === 'boolean') {
          value = value === 'true'
        }

        (settingsObj as any)[key] = value
      })

      setSettings(prev => ({ ...prev, ...settingsObj }))
    } catch (error) {
      console.error('Error fetching app settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof GeneralSettings, value: any) => {
    try {
      const stringValue = typeof value === 'boolean' ? value.toString() : value
      const settingType = typeof value === 'boolean' ? 'boolean' : 'string'

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: key,
          setting_value: stringValue,
          setting_type: settingType
        }, {
          onConflict: 'setting_key'
        })

      if (error) throw error

      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error('Error updating setting:', error)
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      })
    }
  }

  const saveAllSettings = async (newSettings: GeneralSettings) => {
    try {
      setLoading(true)

      const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'boolean' ? value.toString() : value,
        setting_type: typeof value === 'boolean' ? 'boolean' : 'string'
      }))

      const { error } = await supabase
        .from('app_settings')
        .upsert(settingsArray, {
          onConflict: 'setting_key'
        })

      if (error) throw error

      setSettings(newSettings)
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
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
    updateSetting,
    saveAllSettings,
    refetch: fetchSettings
  }
}