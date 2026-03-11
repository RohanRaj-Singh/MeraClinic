import { api, ApiResponse } from '@/lib/api';

// Types
export interface DashboardStats {
  total_patients: number;
  total_visits: number;
  total_revenue: number;
  total_received: number;
  total_balance: number;
  today_visits: number;
  monthly_patients: number;
  monthly_visits: number;
  monthly_revenue: number;
}

export interface RecentPatient {
  id: number;
  name: string;
  reference_number: string;
  phone?: string;
  created_at: string;
}

export interface RecentVisit {
  id: number;
  visit_date: string;
  visit_time: string;
  total_amount: number;
  payment_status: string;
  patient: {
    id: number;
    name: string;
    reference_number: string;
  };
}

export interface ChartData {
  date: string;
  day: string;
  visits: number;
  revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_patients: RecentPatient[];
  recent_visits: RecentVisit[];
  unpaid_visits: RecentVisit[];
  chart_data: ChartData[];
}

export interface SuperAdminStats {
  total_clinics: number;
  active_clinics: number;
  total_patients: number;
  total_visits: number;
  total_revenue: number;
}

export interface Clinic {
  id: number;
  name: string;
  phone?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface SuperAdminDashboard {
  stats: SuperAdminStats;
  recent_clinics: Clinic[];
  expiring_clinics: Clinic[];
}

// Dashboard Service
export const dashboardService = {
  // Get doctor dashboard
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return api.get<ApiResponse<DashboardData>>('/v1/dashboard');
  },

  // Get super admin dashboard
  async getSuperAdminDashboard(): Promise<ApiResponse<SuperAdminDashboard>> {
    return api.get<ApiResponse<SuperAdminDashboard>>('/v1/admin/dashboard');
  },
};

export default dashboardService;
