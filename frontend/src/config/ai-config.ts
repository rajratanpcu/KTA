// KTA ERP - AI Assistant Configuration
// Configurable OpenAI-compatible Ollama endpoint running on Kaggle GPU via Cloudflare tunnel

export interface AiConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

const STORAGE_KEY_BASE_URL = 'kta_ai_base_url';
const STORAGE_KEY_MODEL = 'kta_ai_model';

// Default configuration provided for the Kaggle Ollama GPU instance
export const DEFAULT_AI_CONFIG: AiConfig = {
  baseUrl:
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
      ?.VITE_AI_BASE_URL ||
    'https://logic-inexpensive-squad-romance.trycloudflare.com/v1',
  model:
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
      ?.VITE_AI_MODEL || 'qwen3.8-27b-uncensored-mtp',
  timeoutMs: 45000,
};

/**
 * Get active AI configuration from session storage or environment defaults
 */
export function getAiConfig(): AiConfig {
  try {
    const savedBaseUrl = sessionStorage.getItem(STORAGE_KEY_BASE_URL);
    const savedModel = sessionStorage.getItem(STORAGE_KEY_MODEL);

    return {
      baseUrl: savedBaseUrl?.trim() || DEFAULT_AI_CONFIG.baseUrl,
      model: savedModel?.trim() || DEFAULT_AI_CONFIG.model,
      timeoutMs: DEFAULT_AI_CONFIG.timeoutMs,
    };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

/**
 * Save updated tunnel URL or model name in session storage
 */
export function saveAiConfig(config: Partial<AiConfig>): void {
  try {
    if (config.baseUrl !== undefined) {
      sessionStorage.setItem(STORAGE_KEY_BASE_URL, config.baseUrl.trim());
    }
    if (config.model !== undefined) {
      sessionStorage.setItem(STORAGE_KEY_MODEL, config.model.trim());
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Reset AI configuration to default
 */
export function resetAiConfig(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_BASE_URL);
    sessionStorage.removeItem(STORAGE_KEY_MODEL);
  } catch {
    // Ignore
  }
}
