import { api, ApiResponse } from '@/lib/api';

// Types
export interface Clinic {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  patient_prefix: string;
  reference_counter: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  users_count?: number;
  patients_count?: number;
}

export interface SuperAdminStats {
  total_clinics: number;
  active_clinics: number;
  inactive_clinics: number;
  total_patients: number;
  total_visits: number;
  expiring_clinics: number;
  clinics_this_month: number;
  patients_this_month: number;
  visits_this_month: number;
}

export interface ClinicFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
}

// Admin Service
export const adminService = {
  // Get super admin dashboard stats
  async getStats(): Promise<ApiResponse<SuperAdminStats>> {
    return api.get<ApiResponse<SuperAdminStats>>('/v1/admin/dashboard');
  },

  // Get all clinics
  async getClinics(filters: ClinicFilters = {}): Promise<ApiResponse<Clinic[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const endpoint = `/v1/admin/clinics${queryString ? `?${queryString}` : ''}`;
    
    return api.get<ApiResponse<Clinic[]>>(endpoint);
  },

  // Get clinic by ID
  async getClinic(id: number): Promise<ApiResponse<Clinic>> {
    return api.get<ApiResponse<Clinic>>(`/v1/admin/clinics/${id}`);
  },

  // Create clinic
  async createClinic(data: {
    name: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    patient_prefix?: string;
    admin_name: string;
    admin_email: string;
    admin_password: string;
    expires_at?: string;
  }): Promise<ApiResponse<Clinic>> {
    return api.post<ApiResponse<Clinic>>('/v1/admin/clinics', data);
  },

  // Update clinic
  async updateClinic(id: number, data: {
    name?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    patient_prefix?: string;
    expires_at?: string;
  }): Promise<ApiResponse<Clinic>> {
    return api.put<ApiResponse<Clinic>>(`/v1/admin/clinics/${id}`, data);
  },

  // Delete clinic
  async deleteClinic(id: number): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/v1/admin/clinics/${id}`);
  },

  // Toggle clinic status
  async toggleClinicStatus(id: number): Promise<ApiResponse<Clinic>> {
    return api.post<ApiResponse<Clinic>>(`/v1/admin/clinics/${id}/toggle-status`);
  },

  // Reset clinic admin password
  async resetClinicPassword(id: number, newPassword: string): Promise<ApiResponse<null>> {
    return api.post<ApiResponse<null>>(`/v1/admin/clinics/${id}/reset-password`, {
      new_password: newPassword,
    });
  },

  // Get clinic stats
  async getClinicStats(id: number): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>(`/v1/admin/clinics/${id}/stats`);
  },
};

export default adminService;
