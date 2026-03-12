import { api, ApiResponse } from '@/lib/api';
import type { File as ClinicFile } from '@/services/visit';

interface UploadFileData {
  patient_id?: number;
  visit_id?: number;
}

export const fileService = {
  async upload(file: File, data: UploadFileData = {}): Promise<ApiResponse<ClinicFile>> {
    return api.uploadFile<ApiResponse<ClinicFile>>('/v1/files', file, {
      ...(data.patient_id !== undefined && { patient_id: data.patient_id }),
      ...(data.visit_id !== undefined && { visit_id: data.visit_id }),
    });
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/v1/files/${id}`);
  },

  async getImageObjectUrl(fileId: number): Promise<string> {
    const token = api.getToken();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/v1/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        Accept: 'image/*,*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to load file ${fileId}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};

export default fileService;
