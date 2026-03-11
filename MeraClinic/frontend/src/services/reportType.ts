import { api, ApiResponse } from '@/lib/api';

export interface ReportType {
  id: number;
  clinic_id: number;
  name: string;
  unit?: string;
  normal_range?: string;
  is_active: boolean;
}

export const reportTypeService = {
  // Get all report types
  async getAll(): Promise<ApiResponse<ReportType[]>> {
    return api.get<ApiResponse<ReportType[]>>('/v1/report-types');
  },

  // Get active report types only
  async getActive(): Promise<ApiResponse<ReportType[]>> {
    return api.get<ApiResponse<ReportType[]>>('/v1/report-types/active');
  },

  // Get report type by ID
  async getById(id: number): Promise<ApiResponse<ReportType>> {
    return api.get<ApiResponse<ReportType>>(`/v1/report-types/${id}`);
  },

  // Create report type
  async create(data: Partial<ReportType>): Promise<ApiResponse<ReportType>> {
    return api.post<ApiResponse<ReportType>>('/v1/report-types', data);
  },

  // Update report type
  async update(id: number, data: Partial<ReportType>): Promise<ApiResponse<ReportType>> {
    return api.put<ApiResponse<ReportType>>(`/v1/report-types/${id}`, data);
  },

  // Delete report type
  async delete(id: number): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/v1/report-types/${id}`);
  },
};

export default reportTypeService;
