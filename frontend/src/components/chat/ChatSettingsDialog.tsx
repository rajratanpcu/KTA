// Chat Settings Dialog for Kaggle Cloudflare Tunnel & Qwen Model configuration

import React, { useState } from 'react';
import { Settings, CheckCircle2, AlertCircle, RefreshCw, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAiConfig, saveAiConfig, resetAiConfig, DEFAULT_AI_CONFIG } from '../../config/ai-config';
import { testAiConnection } from '../../services/ai-service';

interface ChatSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const ChatSettingsDialog: React.FC<ChatSettingsDialogProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [baseUrl, setBaseUrl] = useState(() => getAiConfig().baseUrl);
  const [model, setModel] = useState(() => getAiConfig().model);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAiConfig({ baseUrl, model });
    onConfigUpdated();
    onClose();
  };

  const handleReset = () => {
    resetAiConfig();
    setBaseUrl(DEFAULT_AI_CONFIG.baseUrl);
    setModel(DEFAULT_AI_CONFIG.model);
    setTestResult(null);
    onConfigUpdated();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnection({ baseUrl, model });
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span>AI Server & Tunnel Settings</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ai-base-url" className="text-xs font-semibold text-gray-700">
              OpenAI-Compatible Tunnel Base URL
            </Label>
            <Input
              id="ai-base-url"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://xxxx.trycloudflare.com/v1"
              className="text-xs font-mono h-9"
            />
            <p className="text-[11px] text-muted-foreground">
              When Kaggle restarts, paste the new Cloudflare tunnel URL here.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-model" className="text-xs font-semibold text-gray-700">
              Model Identifier
            </Label>
            <Input
              id="ai-model"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setTestResult(null);
              }}
              placeholder="qwen3.8-27b-uncensored-mtp"
              className="text-xs font-mono h-9"
            />
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-md text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              )}
              <span className="flex-1 whitespace-pre-wrap">{testResult.message}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting || !baseUrl}
              className="text-xs gap-1.5 h-8"
            >
              <RefreshCw className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-gray-700 gap-1 h-8"
              title="Reset to default settings"
            >
              <Undo2 className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs h-8">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
