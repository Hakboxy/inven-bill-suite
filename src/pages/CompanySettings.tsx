
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Upload, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCompanySettings } from "@/hooks/useCompanySettings"

const CompanySettings = () => {
  const { toast } = useToast()
  const { settings, saveSettings, uploadLogo, loading } = useCompanySettings()
  
  // Local state for form fields
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '', 
    taxId: '',
    logoUrl: null as string | null
  })

  // Update local state when settings are loaded
  useEffect(() => {
    setCompanyData({
      name: settings.company_name || '',
      email: settings.company_email || '',
      phone: settings.company_phone || '',
      address: settings.company_address || '',
      taxId: settings.tax_id || '',
      logoUrl: settings.logo_url
    })
  }, [settings])

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveSettings = async () => {
    await saveSettings({
      company_name: companyData.name,
      company_email: companyData.email || null,
      company_phone: companyData.phone || null,
      company_address: companyData.address || null,
      tax_id: companyData.taxId || null
    })
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await uploadLogo(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage your company information and details
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {companyData.logoUrl ? (
                      <img 
                        src={companyData.logoUrl} 
                        alt="Company Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={loading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {loading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Company address and location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                value={companyData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full company address"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Legal Information</CardTitle>
            <CardDescription>
              Contact details and legal identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={companyData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID / Registration Number</Label>
              <Input
                id="tax-id"
                value={companyData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CompanySettings
