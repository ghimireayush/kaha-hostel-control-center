import { API_CONFIG, buildApiUrl } from '../config/api.ts';

/**
 * Centralized API Service
 * Handles all HTTP requests with proper error handling and response formatting
 */
export class ApiService {
  private static instance: ApiService;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Generic API request handler
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
    
    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats from NestJS server
      // NestJS returns: { status, data } or { status, result } or { status, stats }
      if (data.data !== undefined) {
        return data.data;
      } else if (data.result !== undefined) {
        return data.result;
      } else if (data.stats !== undefined) {
        return data.stats;
      } else {
        return data;
      }
    } catch (error) {
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Get API configuration
   */
  getConfig() {
    return {
      baseUrl: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    };
  }
}

export const apiService = ApiService.getInstance();