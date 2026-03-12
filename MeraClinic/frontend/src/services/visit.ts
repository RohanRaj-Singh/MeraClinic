import { api, ApiResponse } from '@/lib/api';

// Types
export interface Visit {
  id: number;
  clinic_id: number;
  patient_id: number;
  visit_number: string;
  visit_date: string;
  visit_time: string;
  prescription?: string;
  notes?: string;
  total_amount: number;
  received_amount: number;
  balance: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  patient?: Patient;
  reports?: Report[];
  files?: File[];
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: number;
  name: string;
  reference_number: string;
  phone?: string;
}

export interface Report {
  id: number;
  clinic_id: number;
  patient_id: number;
  visit_id: number;
  report_type_id: number;
  value: string;
  notes?: string;
  report_date: string;
  report_type?: ReportType;
}

export interface ReportType {
  id: number;
  clinic_id: number;
  name: string;
  unit?: string;
  normal_range?: string;
}

export interface File {
  id: number;
  clinic_id: number;
  patient_id?: number;
  visit_id?: number;
  type: 'image' | 'pdf' | 'document';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  url: string;
}

export interface VisitFilters {
  patient_id?: number;
  date_from?: string;
  date_to?: string;
  payment_status?: 'paid' | 'partial' | 'unpaid';
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateVisitData {
  patient_id: number;
  visit_date?: string;
  visit_time?: string;
  prescription?: string;
  notes?: string;
  total_amount?: number;
  received_amount?: number;
  reports?: {
    report_type_id: number;
    value: string;
    notes?: string;
    report_date?: string;
  }[];
}

export interface UpdateVisitData extends Partial<CreateVisitData> {}

// Visit Service
export const visitService = {
  // Get all visits
  async getAll(filters: VisitFilters = {}): Promise<ApiResponse<Visit[]>> {
    const params = new URLSearchParams();
    
    if (filters.patient_id) params.append('patient_id', String(filters.patient_id));
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/v1/visits${queryString ? `?${queryString}` : ''}`;
    
    return api.get<ApiResponse<Visit[]>>(endpoint);
  },

  // Get visit by ID
  async getById(id: number): Promise<ApiResponse<Visit>> {
    return api.get<ApiResponse<Visit>>(`/v1/visits/${id}`);
  },

  // Create visit
  async create(data: CreateVisitData): Promise<ApiResponse<Visit>> {
    return api.post<ApiResponse<Visit>>('/v1/visits', data);
  },

  // Update visit
  async update(id: number, data: UpdateVisitData): Promise<ApiResponse<Visit>> {
    return api.put<ApiResponse<Visit>>(`/v1/visits/${id}`, data);
  },

  // Delete visit
  async delete(id: number): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/v1/visits/${id}`);
  },

  // Record payment
  async recordPayment(id: number, amount: number): Promise<ApiResponse<Visit>> {
    return api.post<ApiResponse<Visit>>(`/v1/visits/${id}/payment`, { amount });
  },

  // Get next visit number for a patient
  async getNextVisitNumber(patientId: number): Promise<ApiResponse<{ visit_number: string }>> {
    return api.get<ApiResponse<{ visit_number: string }>>(`/v1/visits/next-number/${patientId}`);
  },
};

export default visitService;
