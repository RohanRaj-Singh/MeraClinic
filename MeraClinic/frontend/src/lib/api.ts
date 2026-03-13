import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// API Base URL - should be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_STORAGE_KEY = 'token';
const TOKEN_EXPIRY_STORAGE_KEY = 'token_expires_at';

export const AUTH_EXPIRED_EVENT = 'meraclinic:auth-expired';

// Helper to merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extended API response with OTP
export interface AuthApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  otp_required?: boolean;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// API Client
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiresAt: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
      this.tokenExpiresAt = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
    }
  }

  setToken(token: string | null, expiresAt?: string | null) {
    this.token = token;
    this.tokenExpiresAt = token ? expiresAt ?? null : null;

    if (typeof window === 'undefined') {
      return;
    }

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (this.tokenExpiresAt) {
        localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, this.tokenExpiresAt);
      } else {
        localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
      }
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getTokenExpiresAt(): string | null {
    return this.tokenExpiresAt;
  }

  isSessionExpired(): boolean {
    return !!this.tokenExpiresAt && new Date(this.tokenExpiresAt).getTime() <= Date.now();
  }

  private notifySessionExpired(message: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { message } }));
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.token && this.isSessionExpired()) {
      this.setToken(null);
      this.notifySessionExpired('Your session has expired. Please sign in again.');
      throw new Error('Your session has expired. Please sign in again.');
    }

    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.token) {
      this.setToken(null);
      this.notifySessionExpired('Your session has expired. Please sign in again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      const validationMessage =
        error?.errors && typeof error.errors === 'object'
          ? Object.values(error.errors).flat().find((value) => typeof value === 'string')
          : null;

      throw new Error(
        validationMessage ||
        error.message ||
        `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, unknown>): Promise<T> {
    if (this.token && this.isSessionExpired()) {
      this.setToken(null);
      this.notifySessionExpired('Your session has expired. Please sign in again.');
      throw new Error('Your session has expired. Please sign in again.');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401 && this.token) {
      this.setToken(null);
      this.notifySessionExpired('Your session has expired. Please sign in again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Create API instance
export const api = new ApiClient(API_BASE_URL);

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Paginated response helper
export function getPaginatedData<T>(response: ApiResponse<T[]>): {
  data: T[];
  meta: ApiResponse<T[]>['meta'];
} {
  return {
    data: response.data,
    meta: response.meta,
  };
}
