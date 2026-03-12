import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Patient } from '@/services/patient';
import { CreateVisitData } from '@/services/visit';
import { fileService } from '@/services/file';
import { usePatients } from '@/hooks/usePatients';
import { useCreateVisit } from '@/hooks/useVisits';
import { PatientList, PatientSearch, PatientModal, ViewPatientModal, EditPatientModal } from '@/components/patients';
import { VisitForm } from '@/components/visits';
import { toast } from 'sonner';

// Urdu translations
const translations = {
  patients: 'Patients / مریض',
  patientsSubtitle: 'Manage your clinic patients / اپنے کلینک کے مریضوں کا انتظام کریں',
};

interface PatientWithReports extends Patient {
  reports?: { id: number; report_type_id: number; report_type_name?: string; value: string; notes?: string }[];
}

export default function PatientsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [selectedPatient, setSelectedPatient] = useState<PatientWithReports | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVisitForm, setShowVisitForm] = useState(false);

  const { patients, loading, fetchPatients, searchPatients } = usePatients();
  const { createVisit, loading: creatingVisit } = useCreateVisit();

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    searchPatients(search);
  }, [searchPatients]);

  const handlePatientClick = useCallback((patient: Patient) => {
    setSelectedPatient(patient as PatientWithReports);
  }, []);

  const handleEditClick = useCallback((patient: Patient) => {
    setSelectedPatient(null);
    setEditingPatient(patient);
  }, []);

  const handleAddVisitClick = useCallback(() => {
    setShowVisitForm(true);
  }, []);

  const handleVisitFormSubmit = useCallback(async (
    data: CreateVisitData,
    options: { prescriptionMode: 'image' | 'text'; prescriptionImageFile?: File | null }
  ) => {
    if (!selectedPatient) return;

    const createdVisit = await createVisit({ ...data, patient_id: selectedPatient.id });

    if (options.prescriptionMode === 'image' && options.prescriptionImageFile) {
      try {
        await fileService.upload(options.prescriptionImageFile, {
          patient_id: selectedPatient.id,
          visit_id: createdVisit.id,
        });
      } catch (error) {
        toast.error('Visit saved, but prescription image upload failed');
      }
    }

    toast.success('Visit added successfully');
    setShowVisitForm(false);
  }, [selectedPatient, createVisit]);

  const closeForm = useCallback(() => {
    setShowCreateForm(false);
    setEditingPatient(undefined);
  }, []);

  const refreshPatients = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{translations.patients}</h1>
              <p className="text-sm text-gray-500">{translations.patientsSubtitle}</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-[#2E7D32] text-white font-medium rounded-lg hover:bg-[#1B5E20] transition-colors shadow-sm"
            >
              + Add Patient
            </button>
          </div>
        </div>
      </header>

      <div className="p-4">
        <PatientSearch onSearch={handleSearch} />
      </div>

      <main className="px-4 pb-4">
        <PatientList
          patients={patients}
          loading={loading}
          onPatientClick={handlePatientClick}
        />
      </main>

      {/* Create Patient Modal */}
      {showCreateForm && (
        <PatientModal onClose={closeForm} onSuccess={refreshPatients} />
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={closeForm}
          onSuccess={refreshPatients}
        />
      )}

      {/* View Patient Modal */}
      {selectedPatient && (
        <ViewPatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={() => handleEditClick(selectedPatient)}
          onAddVisit={handleAddVisitClick}
          onDelete={refreshPatients}
        />
      )}

      {/* Add Visit Modal */}
      {showVisitForm && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
          <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add Visit - {selectedPatient.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.reference_number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVisitForm(false)}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 sm:hidden"
                  aria-label="Close visit modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <VisitForm
                lockedPatient={selectedPatient}
                onSubmit={handleVisitFormSubmit}
                onCancel={() => setShowVisitForm(false)}
                isLoading={creatingVisit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
