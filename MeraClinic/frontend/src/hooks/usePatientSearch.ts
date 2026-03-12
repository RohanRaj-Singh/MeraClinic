import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/services/patient';

// Patient data type matching what's used in the UI
interface PatientData {
  id: number;
  name: string;
  reference_number: string;
  phone?: string;
}

interface UsePatientSearchOptions {
  initialPatient?: PatientData | null;
  disabled?: boolean;
}

interface UsePatientSearchReturn {
  patients: PatientData[];
  loading: boolean;
  selectedPatient: PatientData | null;
  searchQuery: string;
  showResults: boolean;
  setSearchQuery: (query: string) => void;
  setShowResults: (show: boolean) => void;
  selectPatient: (patient: PatientData) => void;
  clearSelection: () => void;
}

export function usePatientSearch({
  initialPatient,
  disabled = false,
}: UsePatientSearchOptions = {}): UsePatientSearchReturn {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(!disabled);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(initialPatient || null);
  const [searchQuery, setSearchQuery] = useState(
    initialPatient ? `${initialPatient.name} (${initialPatient.reference_number})` : ''
  );
  const [showResults, setShowResults] = useState(false);

  const fetchPatients = useCallback(async (query: string) => {
    if (disabled) return;

    setLoading(true);
    try {
      const response = await patientService.getAll(
        query.trim() ? { search: query.trim() } : {}
      );

      const fetchedPatients = response.data || [];
      setPatients(
        selectedPatient && !fetchedPatients.some((p) => p.id === selectedPatient.id)
          ? [selectedPatient, ...fetchedPatients]
          : fetchedPatients
      );
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to fetch patients:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [disabled, selectedPatient]);

  useEffect(() => {
    if (disabled) return;

    const timeoutId = window.setTimeout(() => {
      fetchPatients(searchQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery, fetchPatients, disabled]);

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
      setSearchQuery(`${initialPatient.name} (${initialPatient.reference_number})`);
    }
  }, [initialPatient]);

  const selectPatient = useCallback((patient: PatientData) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.name} (${patient.reference_number})`);
    setShowResults(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPatient(null);
    setSearchQuery('');
  }, []);

  return {
    patients,
    loading,
    selectedPatient,
    searchQuery,
    showResults,
    setSearchQuery,
    setShowResults,
    selectPatient,
    clearSelection,
  };
}
