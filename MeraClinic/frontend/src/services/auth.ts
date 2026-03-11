import { api, ApiResponse, AuthApiResponse } from '@/lib/api';

// Types
export interface User {
  id: number;
  clinic_id: number;
  name: string;
  email: string;
  role: 'doctor' | 'super_admin';
  phone?: string;
  is_active: boolean;
  clinic?: Clinic;
}

export interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  patient_prefix: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  clinic_name: string;
  phone?: string;
  patient_prefix?: string;
}

// Auth Service
export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthApiResponse<AuthResponse>> {
    return api.post<AuthApiResponse<AuthResponse>>('/v1/auth/login', credentials);
  },

  // Register
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return api.post<ApiResponse<AuthResponse>>('/v1/auth/register', data);
  },

  // Logout
  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/v1/auth/logout');
    api.setToken('');
    return response;
  },

  // Get current user
  async me(): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>('/v1/auth/me');
  },

  // Verify OTP
  async verifyOtp(email: string, otp: number): Promise<ApiResponse<AuthResponse>> {
    return api.post<ApiResponse<AuthResponse>>('/v1/auth/otp/verify', { email, otp });
  },

  // Reset password
  async resetPassword(email: string): Promise<ApiResponse<null>> {
    return api.post<ApiResponse<null>>('/v1/auth/password/reset', { email });
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return api.put<ApiResponse<null>>('/v1/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Set token
  setToken(token: string) {
    api.setToken(token);
  },

  // Get token
  getToken(): string | null {
    return api.getToken();
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!api.getToken();
  },
};

export default authService;
