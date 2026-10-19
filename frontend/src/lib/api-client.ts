// Native fetch-based HTTP client matching the axios client interface
// Completely zero-dependency to guarantee compatibility in all deployment targets

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseURL}${cleanPath}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }
    return url.toString();
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    try {
      const token = localStorage.getItem('kta_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const userId = localStorage.getItem('kta_user_id') || '1';
      headers['X-User-Id'] = userId;
    } catch {
      // Safe fallback for SSR or restricted environments
    }
    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    const headers = {
      ...this.getAuthHeaders(),
      ...(config?.headers || {}),
    };

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (isFormData) {
      delete headers['Content-Type']; // Let browser set boundary
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config?.timeout || 30000);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type');
      let data: any = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401) {
          try {
            localStorage.removeItem('kta_token');
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          } catch {
            // ignore
          }
        }
        const message =
          data?.message ||
          (data?.errors ? Object.values(data.errors).join(', ') : null) ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
        headers: {},
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw err;
    }
  }

  get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, config);
  }

  post<T>(path: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, config);
  }

  put<T>(path: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, config);
  }

  delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

const apiClient = new HttpClient(`${API_BASE_URL}/api`);
export default apiClient;
