import { useState, useCallback, useEffect } from 'react';
import { Visit, CreateVisitData, visitService } from '@/services/visit';
import { fileService } from '@/services/file';
import { toast } from 'sonner';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { PatientSearchInput, PatientLockedDisplay, PatientLoadingDisplay } from './PatientSearchInput';
import { PrescriptionSection } from './PrescriptionSection';

// Local patient type matching what PatientSearchInput expects
interface PatientData {
  id: number;
  name: string;
  reference_number: string;
  phone?: string;
}

interface VisitFormProps {
  visit?: Visit;
  lockedPatient?: PatientData;
  onSubmit: (
    data: CreateVisitData,
    options: {
      prescriptionMode: 'image' | 'text';
      prescriptionImageFile?: File | null;
    }
  ) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const normalizeVisitTime = (value?: string) => {
  if (!value) return new Date().toTimeString().slice(0, 5);
  const timeMatch = value.match(/(\d{2}:\d{2})/);
  return timeMatch ? timeMatch[1] : new Date().toTimeString().slice(0, 5);
};

const normalizeVisitDate = (value?: string) => {
  if (!value) return new Date().toISOString().split('T')[0];
  const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  return dateMatch ? dateMatch[0] : new Date(value).toISOString().split('T')[0];
};

export function VisitForm({
  visit,
  lockedPatient,
  onSubmit,
  onCancel,
  isLoading,
}: VisitFormProps) {
  const isPatientLocked = Boolean(lockedPatient || visit?.patient);
  const initialPatient = lockedPatient || visit?.patient || null;

  // Use local state for patient selection when not locked
  const [localSelectedPatient, setLocalSelectedPatient] = useState<PatientData | null>(initialPatient);

  const {
    patients,
    loading: loadingPatients,
    searchQuery,
    showResults,
    setSearchQuery,
    setShowResults,
  } = usePatientSearch({
    disabled: isPatientLocked,
  });

  // When not locked, use local selected patient
  // When locked, use the locked/visit patient
  const selectedPatient = isPatientLocked ? initialPatient : localSelectedPatient;

  // Set initial search query for locked patients
  useEffect(() => {
    if (initialPatient) {
      setSearchQuery(`${initialPatient.name} (${initialPatient.reference_number})`);
    }
  }, [initialPatient, setSearchQuery]);

  const [prescriptionMode, setPrescriptionMode] = useState<'image' | 'text'>(
    visit?.prescription ? 'text' : 'image'
  );
  const [prescriptionImageFile, setPrescriptionImageFile] = useState<File | null>(null);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [generatedVisitNumber, setGeneratedVisitNumber] = useState<string | null>(visit?.visit_number || null);
  const [generatingVisitNumber, setGeneratingVisitNumber] = useState(false);

  const [formData, setFormData] = useState<CreateVisitData>({
    patient_id: initialPatient?.id || visit?.patient_id || 0,
    visit_date: normalizeVisitDate(visit?.visit_date),
    visit_time: normalizeVisitTime(visit?.visit_time),
    prescription: visit?.prescription || undefined,
    notes: visit?.notes || '',
    total_amount: visit?.total_amount || 0,
    received_amount: visit?.received_amount || 0,
  });

  const existingImages = (visit?.files || []).filter(
    (file) => file.type === 'image' && !deletedImageIds.includes(file.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateVisitData = {
      ...formData,
      prescription: prescriptionMode === 'text' ? formData.prescription : undefined,
    };

    onSubmit(payload, {
      prescriptionMode,
      prescriptionImageFile,
    });
  };

  const handleChange = (field: keyof CreateVisitData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatientSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(true);
  };

  const handlePatientSelect = async (patient: PatientData) => {
    if (isPatientLocked) return;
    setLocalSelectedPatient(patient);
    setSearchQuery(`${patient.name} (${patient.reference_number})`);
    setShowResults(false);
    setFormData((prev) => ({ ...prev, patient_id: patient.id }));

    // Generate visit number for new visits
    if (!visit) {
      setGeneratingVisitNumber(true);
      try {
        const response = await visitService.getNextVisitNumber(patient.id);
        if (response.success && response.data?.visit_number) {
          setGeneratedVisitNumber(response.data.visit_number);
        }
      } catch (error) {
        console.error('Failed to generate visit number:', error);
      } finally {
        setGeneratingVisitNumber(false);
      }
    }
  };

  const handleClearPatient = () => {
    if (isPatientLocked) return;
    setLocalSelectedPatient(null);
    setSearchQuery('');
    setFormData((prev) => ({ ...prev, patient_id: 0 }));
    setGeneratedVisitNumber(null);
  };

  const handleDeleteImage = useCallback(async (fileId: number) => {
    try {
      await fileService.delete(fileId);
      setDeletedImageIds((currentIds) => [...currentIds, fileId]);
    } catch {
      toast.error('Failed to delete image');
    }
  }, []);

  const totalAmount = formData.total_amount || 0;
  const receivedAmount = formData.received_amount || 0;
  const balance = totalAmount - receivedAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      {/* Patient Section */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Patient *
        </label>
        {isPatientLocked && selectedPatient ? (
          <PatientLockedDisplay 
            patient={selectedPatient} 
            visitNumber={visit?.visit_number || generatedVisitNumber}
          />
        ) : loadingPatients && patients.length === 0 ? (
          <PatientLoadingDisplay isLoading={true} />
        ) : (
          <PatientSearchInput
            patients={patients}
            loading={loadingPatients}
            selectedPatient={selectedPatient}
            searchQuery={searchQuery}
            showResults={showResults}
            disabled={isPatientLocked}
            onSearchChange={handlePatientSearchChange}
            onSelect={handlePatientSelect}
            onClear={handleClearPatient}
            onFocus={() => setShowResults(true)}
            onBlur={() => window.setTimeout(() => setShowResults(false), 150)}
          />
        )}
      </div>

      {/* Generated Visit Number */}
      {(generatedVisitNumber || generatingVisitNumber) && (
        <div className="flex items-center justify-center">
          {generatingVisitNumber ? (
            <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-500">
              Generating...
            </span>
          ) : generatedVisitNumber && (
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {generatedVisitNumber}
            </span>
          )}
        </div>
      )}

      {/* Date & Time */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Visit Date *
          </label>
          <input
            type="date"
            value={formData.visit_date}
            onChange={(e) => handleChange('visit_date', e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Visit Time
          </label>
          <input
            type="time"
            value={formData.visit_time}
            onChange={(e) => handleChange('visit_time', e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Prescription Section */}
      <PrescriptionSection
        mode={prescriptionMode}
        prescription={formData.prescription}
        existingImages={existingImages}
        onModeChange={setPrescriptionMode}
        onPrescriptionChange={(value) => handleChange('prescription', value)}
        onImageSelect={setPrescriptionImageFile}
        onDeleteImage={handleDeleteImage}
      />

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Additional notes..."
        />
      </div>

      {/* Financial Section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Total Amount (PKR)
          </label>
          <input
            type="number"
            value={formData.total_amount}
            onChange={(e) => handleChange('total_amount', Number(e.target.value))}
            min={0}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Received Amount (PKR)
          </label>
          <input
            type="number"
            value={formData.received_amount}
            onChange={(e) => handleChange('received_amount', Number(e.target.value))}
            min={0}
            max={totalAmount}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Balance Display */}
      {totalAmount > 0 && (
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Balance:</span>
            <span className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              PKR {balance}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 px-4 pb-2 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || formData.patient_id === 0}
            className="w-full flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : visit ? 'Update Visit' : 'Create Visit'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default VisitForm;
