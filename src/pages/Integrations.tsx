
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Settings as SettingsIcon, Zap } from "lucide-react"
import { ConfigureIntegrationModal } from "@/components/ConfigureIntegrationModal"

const Integrations = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)

  // Mock data
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: "Stripe",
      description: "Accept online payments and manage subscriptions",
      status: "Connected",
      enabled: true,
      icon: "💳",
      category: "Payment"
    },
    {
      id: 2,
      name: "PayPal",
      description: "Alternative payment processing solution",
      status: "Disconnected",
      enabled: false,
      icon: "🅿️",
      category: "Payment"
    },
    {
      id: 3,
      name: "QuickBooks",
      description: "Sync accounting data and financial reports",
      status: "Connected",
      enabled: true,
      icon: "📊",
      category: "Accounting"
    },
    {
      id: 4,
      name: "Zapier",
      description: "Automate workflows with 5000+ apps",
      status: "Disconnected",
      enabled: false,
      icon: "⚡",
      category: "Automation"
    },
    {
      id: 5,
      name: "Mailchimp",
      description: "Email marketing and customer communication",
      status: "Connected",
      enabled: true,
      icon: "📧",
      category: "Marketing"
    },
    {
      id: 6,
      name: "Slack",
      description: "Team communication and notifications",
      status: "Disconnected",
      enabled: false,
      icon: "💬",
      category: "Communication"
    }
  ])

  const handleToggleIntegration = (id: number) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, enabled: !integration.enabled }
        : integration
    ))
  }

  const handleConfigureIntegration = (integration: any) => {
    setSelectedIntegration(integration)
    setIsConfigModalOpen(true)
  }

  const handleSaveConfiguration = (data: any) => {
    console.log('Saving integration configuration:', data)
    setIsConfigModalOpen(false)
    setSelectedIntegration(null)
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'Connected' ? 'default' : 'secondary'
    return <Badge variant={variant}>{status}</Badge>
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Payment': 'bg-green-100 text-green-800',
      'Accounting': 'bg-blue-100 text-blue-800',
      'Automation': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Communication': 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = []
    }
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your business tools and automate workflows
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedIntegrations).map(([category, integrations]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category}</h2>
              <Badge className={getCategoryColor(category)}>
                {integrations.length} integration{integrations.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <span>{integration.name}</span>
                      </div>
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={() => handleToggleIntegration(integration.id)}
                      />
                    </CardTitle>
                    <CardDescription>
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(integration.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigureIntegration(integration)}
                        >
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfigureIntegrationModal
        open={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        onSubmit={handleSaveConfiguration}
        integration={selectedIntegration}
      />
    </div>
  )
}

export default Integrations
