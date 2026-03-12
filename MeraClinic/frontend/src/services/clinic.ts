import { api, ApiResponse } from '@/lib/api';
import type { Clinic, User } from './auth';

// Types
export interface UpdateClinicData {
  name?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  patient_prefix?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

// Clinic Service
export const clinicService = {
  // Get current user's clinic
  async getClinic(): Promise<ApiResponse<Clinic>> {
    return api.get<ApiResponse<Clinic>>('/v1/clinic');
  },

  // Update clinic settings
  async updateClinic(data: UpdateClinicData): Promise<ApiResponse<Clinic>> {
    return api.put<ApiResponse<Clinic>>('/v1/clinic', data);
  },

  // Update user profile
  async updateProfile(data: UpdateUserData): Promise<ApiResponse<User>> {
    return api.put<ApiResponse<User>>('/v1/profile', data);
  },
};

export default clinicService;
