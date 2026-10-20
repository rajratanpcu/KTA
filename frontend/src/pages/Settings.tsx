import { useState } from 'react'
import { User, Building, Bell, Bot, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { getAiConfig, saveAiConfig, resetAiConfig, DEFAULT_AI_CONFIG } from '@/config/ai-config'
import { testAiConnection } from '@/services/ai-service'

export default function Settings() {
  const [aiBaseUrl, setAiBaseUrl] = useState(() => getAiConfig().baseUrl)
  const [aiModel, setAiModel] = useState(() => getAiConfig().model)
  const [isTestingAi, setIsTestingAi] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [aiSaved, setAiSaved] = useState(false)

  const handleSaveAi = () => {
    saveAiConfig({ baseUrl: aiBaseUrl, model: aiModel })
    setAiSaved(true)
    setTimeout(() => setAiSaved(false), 3000)
  }

  const handleTestAi = async () => {
    setIsTestingAi(true)
    setAiTestResult(null)
    try {
      const res = await testAiConnection({ baseUrl: aiBaseUrl, model: aiModel })
      setAiTestResult(res)
    } catch (err: unknown) {
      setAiTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection failed',
      })
    } finally {
      setIsTestingAi(false)
    }
  }

  const handleResetAi = () => {
    resetAiConfig()
    setAiBaseUrl(DEFAULT_AI_CONFIG.baseUrl)
    setAiModel(DEFAULT_AI_CONFIG.model)
    setAiTestResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure system preferences, AI copilot, and business settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users & Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Users & Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage user accounts and role-based permissions
            </p>
            <Button variant="outline" className="w-full">Manage Users</Button>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Company name, address, GST number, and tax settings
            </p>
            <Button variant="outline" className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Low stock alerts, transfer updates, and system notifications
            </p>
            <Button variant="outline" className="w-full">Configure</Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Copilot Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant Configuration (Qwen 27B / Kaggle GPU Tunnel)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure the OpenAI-compatible endpoint used by the floating AI assistant. When your Kaggle session restarts, paste the new Cloudflare Quick Tunnel URL here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aiTunnelUrl">OpenAI Base URL</Label>
              <Input
                id="aiTunnelUrl"
                value={aiBaseUrl}
                onChange={(e) => {
                  setAiBaseUrl(e.target.value)
                  setAiTestResult(null)
                }}
                placeholder="https://xxxx.trycloudflare.com/v1"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiModelIdentifier">Model Identifier</Label>
              <Input
                id="aiModelIdentifier"
                value={aiModel}
                onChange={(e) => {
                  setAiModel(e.target.value)
                  setAiTestResult(null)
                }}
                placeholder="qwen3.8-27b-uncensored-mtp"
                className="font-mono text-xs"
              />
            </div>
          </div>

          {aiTestResult && (
            <div
              className={`p-3 rounded-md text-xs flex items-start gap-2 border ${
                aiTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {aiTestResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              )}
              <span className="flex-1 whitespace-pre-wrap">{aiTestResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestAi}
                disabled={isTestingAi || !aiBaseUrl}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
                {isTestingAi ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetAi}
                className="text-muted-foreground"
              >
                Reset Default
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {aiSaved && <span className="text-xs text-emerald-600 font-medium">Saved to session!</span>}
              <Button size="sm" onClick={handleSaveAi}>
                Save AI Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select id="currency" defaultValue="INR">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select id="timezone" defaultValue="Asia/Kolkata">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select id="dateFormat" defaultValue="DD/MM/YYYY">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select id="language" defaultValue="en">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
