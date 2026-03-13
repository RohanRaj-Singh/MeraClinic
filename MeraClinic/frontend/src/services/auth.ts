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
  expires_at: string | null;
}

export interface RegisterResponse {
  user: User;
  clinic: Clinic;
  waiting_approval: boolean;
}

export interface OtpChallengeResponse {
  email: string;
  otp_expires_at: string | null;
}

export type LoginResponse = AuthResponse | OtpChallengeResponse;

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
  async login(credentials: LoginCredentials): Promise<AuthApiResponse<LoginResponse>> {
    return api.post<AuthApiResponse<LoginResponse>>('/v1/auth/login', credentials);
  },

  async resendOtp(email: string): Promise<ApiResponse<OtpChallengeResponse>> {
    return api.post<ApiResponse<OtpChallengeResponse>>('/v1/auth/otp/resend', { email });
  },

  // Register
  async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    return api.post<ApiResponse<RegisterResponse>>('/v1/auth/register', data);
  },

  // Logout
  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/v1/auth/logout');
    api.setToken(null);
    return response;
  },

  // Get current user
  async me(): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>('/v1/auth/me');
  },

  // Verify OTP
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<AuthResponse>> {
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
  setToken(token: string | null, expiresAt?: string | null) {
    api.setToken(token, expiresAt);
  },

  // Get token
  getToken(): string | null {
    return api.getToken();
  },

  getTokenExpiresAt(): string | null {
    return api.getTokenExpiresAt();
  },

  isSessionExpired(): boolean {
    return api.isSessionExpired();
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!api.getToken();
  },
};

export default authService;
