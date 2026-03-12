import { api, ApiResponse } from '@/lib/api';

// Types
export interface Patient {
  id: number;
  clinic_id: number;
  reference_number: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  date_of_birth?: string;
  diseases?: string;
  prescription?: string;
  notes?: string;
  disease_list?: Disease[];
  reports?: PatientReport[];
  created_at: string;
  updated_at: string;
}

export interface PatientReport {
  id: number;
  report_type_id: number;
  report_type_name?: string;
  value: string;
  notes?: string;
}

export interface Disease {
  id: number;
  clinic_id: number;
  name: string;
  description?: string;
}

export interface PatientFilters {
  search?: string;
  disease_id?: number;
  page?: number;
}

export interface CreatePatientData {
  name: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  date_of_birth?: string;
  diseases?: string;
  prescription?: string;
  notes?: string;
  disease_ids?: number[];
  reports?: {
    report_type_id: number;
    value: string;
    notes?: string;
  }[];
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

// Patient Service
export const patientService = {
  // Get all patients
  async getAll(filters: PatientFilters = {}): Promise<ApiResponse<Patient[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.disease_id) params.append('disease_id', String(filters.disease_id));
    if (filters.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const endpoint = `/v1/patients${queryString ? `?${queryString}` : ''}`;
    
    return api.get<ApiResponse<Patient[]>>(endpoint);
  },

  // Get patient by ID
  async getById(id: number): Promise<ApiResponse<Patient>> {
    return api.get<ApiResponse<Patient>>(`/v1/patients/${id}`);
  },

  // Create patient
  async create(data: CreatePatientData): Promise<ApiResponse<Patient>> {
    return api.post<ApiResponse<Patient>>('/v1/patients', data);
  },

  // Update patient
  async update(id: number, data: UpdatePatientData): Promise<ApiResponse<Patient>> {
    return api.put<ApiResponse<Patient>>(`/v1/patients/${id}`, data);
  },

  // Delete patient
  async delete(id: number): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/v1/patients/${id}`);
  },

  // Get patient balance
  async getBalance(id: number): Promise<ApiResponse<{ patient_id: number; balance: number }>> {
    return api.get<ApiResponse<{ patient_id: number; balance: number }>>(`/v1/patients/${id}/balance`);
  },
};

export default patientService;
