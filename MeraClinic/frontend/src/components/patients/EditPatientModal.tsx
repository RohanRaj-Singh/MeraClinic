import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { patientService, Patient, CreatePatientData } from '@/services/patient';
import { toast } from 'sonner';
import { PatientForm } from './PatientForm';

interface PatientWithBalance extends Patient {
  balance?: number;
  last_visit_date?: string;
}

interface EditPatientModalProps {
  patient: PatientWithBalance;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditPatientModal({ patient, onClose, onSuccess }: EditPatientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreatePatientData) => {
    setIsLoading(true);
    try {
      await patientService.update(patient.id, data);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient updated successfully');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Edit Patient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <PatientForm
            patient={patient}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
