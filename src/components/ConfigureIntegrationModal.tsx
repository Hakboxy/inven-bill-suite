
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface ConfigureIntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  integration?: any
}

export const ConfigureIntegrationModal = ({ open, onOpenChange, onSubmit, integration }: ConfigureIntegrationModalProps) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    callbackUrl: '',
    enableLogging: true
  })

  useEffect(() => {
    if (integration) {
      // In a real app, this would load existing configuration
      setFormData({
        apiKey: '',
        apiSecret: '',
        callbackUrl: `https://your-app.com/webhooks/${integration.name.toLowerCase()}`,
        enableLogging: true
      })
    }
  }, [integration, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    toast({
      title: "Configuration Saved",
      description: `${integration?.name} integration has been configured successfully.`,
    })
  }

  const handleTestConnection = () => {
    console.log('Testing connection for:', integration?.name)
    toast({
      title: "Connection Test",
      description: `Testing connection to ${integration?.name}...`,
    })
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${integration?.name}.`,
      })
    }, 2000)
  }

  const handleClose = () => {
    onOpenChange(false)
    setFormData({
      apiKey: '',
      apiSecret: '',
      callbackUrl: '',
      enableLogging: true
    })
  }

  if (!integration) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{integration.icon}</span>
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription>
            Set up your {integration.name} integration with API credentials and webhook settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="Enter your API secret"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callbackUrl">Callback URL</Label>
              <Input
                id="callbackUrl"
                placeholder="Webhook callback URL"
                value={formData.callbackUrl}
                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Use this URL in your {integration.name} webhook settings
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableLogging"
                checked={formData.enableLogging}
                onCheckedChange={(checked) => setFormData({ ...formData, enableLogging: checked })}
              />
              <Label htmlFor="enableLogging">Enable API Logging</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleTestConnection}>
              Test Connection
            </Button>
            <Button type="submit">
              Save Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
