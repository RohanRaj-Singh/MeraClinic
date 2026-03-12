import { useState, useCallback, useEffect } from 'react';
import { visitService, Visit, VisitFilters, CreateVisitData, UpdateVisitData } from '@/services/visit';

export function useVisits(initialFilters?: VisitFilters) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VisitFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });

  const fetchVisits = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.getAll({ ...filters, page });
      setVisits(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        perPage: response.meta?.per_page || 15,
        total: response.meta?.total || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visits');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const searchVisits = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  }, []);

  const filterByDate = useCallback((fromDate?: string, toDate?: string) => {
    setFilters(prev => ({ ...prev, date_from: fromDate, date_to: toDate }));
  }, []);

  const filterByStatus = useCallback((paymentStatus?: 'paid' | 'partial' | 'unpaid') => {
    setFilters(prev => ({ ...prev, payment_status: paymentStatus }));
  }, []);

  return {
    visits,
    loading,
    error,
    filters,
    pagination,
    fetchVisits,
    searchVisits,
    filterByDate,
    filterByStatus,
  };
}

export function useVisit(visitId?: number) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisit = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.getById(id);
      setVisit(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visitId) {
      fetchVisit(visitId);
    }
  }, [visitId, fetchVisit]);

  return { visit, loading, error, fetchVisit };
}

export function useCreateVisit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVisit = useCallback(async (data: CreateVisitData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.create(data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create visit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createVisit, loading, error };
}

export function useUpdateVisit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVisit = useCallback(async (id: number, data: UpdateVisitData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.update(id, data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update visit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateVisit, loading, error };
}

export function useDeleteVisit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteVisit = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await visitService.delete(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete visit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteVisit, loading, error };
}

export function useRecordPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordPayment = useCallback(async (id: number, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.recordPayment(id, amount);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { recordPayment, loading, error };
}
