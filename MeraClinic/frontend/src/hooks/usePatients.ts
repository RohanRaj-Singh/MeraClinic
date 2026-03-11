import { useState, useCallback, useEffect } from 'react';
import { patientService, Patient, PatientFilters, CreatePatientData, UpdatePatientData } from '@/services/patient';

export function usePatients(initialFilters?: PatientFilters) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PatientFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });

  const fetchPatients = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getAll({ ...filters, page });
      setPatients(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        perPage: response.meta?.per_page || 15,
        total: response.meta?.total || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const searchPatients = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const filterByDisease = useCallback((diseaseId?: number) => {
    setFilters(prev => ({ ...prev, disease_id: diseaseId }));
  }, []);

  return {
    patients,
    loading,
    error,
    filters,
    pagination,
    fetchPatients,
    searchPatients,
    filterByDisease,
  };
}

export function usePatient(patientId?: number) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getById(id);
      setPatient(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patient');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPatient(patientId);
    }
  }, [patientId, fetchPatient]);

  return { patient, loading, error, fetchPatient };
}

export function useCreatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPatient = useCallback(async (data: CreatePatientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.create(data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create patient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPatient, loading, error };
}

export function useUpdatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePatient = useCallback(async (id: number, data: UpdatePatientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.update(id, data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update patient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updatePatient, loading, error };
}

export function useDeletePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePatient = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await patientService.delete(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete patient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deletePatient, loading, error };
}
