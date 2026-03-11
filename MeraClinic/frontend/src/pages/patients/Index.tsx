import { useState, useCallback } from 'react';
import { Patient, CreatePatientData } from '@/services/patient';
import { Visit, visitService, CreateVisitData } from '@/services/visit';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/usePatients';
import { useCreateVisit } from '@/hooks/useVisits';
import { PatientList, PatientForm, PatientSearch } from '@/components/patients';
import { VisitForm } from '@/components/visits';
import { toast } from 'sonner';

// Urdu translations
const translations = {
  patients: 'Patients / مریض',
  patientsSubtitle: 'Manage your clinic patients / اپنے کلینک کے مریضوں کا انتظام کریں',
  addPatient: 'Add Patient / مریض شامل کریں',
  newPatient: 'New Patient / نیا مریض',
  editPatient: 'Edit Patient / مریض ترمیم کریں',
  patientDetails: 'Patient Details / مریض کی تفصیلات',
  name: 'Name / نام',
  referenceNumber: 'Reference No. / ریفرنس نمبر',
  phone: 'Phone / فون',
  whatsapp: 'WhatsApp / وہاٹس ایپ',
  address: 'Address / پتہ',
  country: 'Country / ملک',
  age: 'Age / عمر',
  gender: 'Gender / صنف',
  diseases: 'Diseases / بیماری',
  prescription: 'Prescription / نسخہ',
  notes: 'Notes / نوٹس',
  addedOn: 'Added On / شامل کیا گیا',
  close: 'Close / بند کریں',
  deleteConfirm: 'Are you sure you want to delete this patient? / کیا آپ واقعی اس مریض کو حذف کرنا چاہتے ہیں؟',
  deleteSuccess: 'Patient deleted successfully / مریض کامیابی سے حذف ہو گیا',
  createSuccess: 'Patient created successfully / مریض کامیابی سے بن گیا',
  updateSuccess: 'Patient updated successfully / مریض کامیابی سے اپڈیٹ ہو گیا',
  noPatients: 'No patients found. Add your first patient! / کوئی مریض نہیں ملدا۔ اپنا پہلا مریض شامل کریں!',
};

export default function PatientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientVisits, setPatientVisits] = useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);

  const { patients, loading, fetchPatients } = usePatients({ search: searchTerm || undefined });
  const { createPatient, loading: creating } = useCreatePatient();
  const { updatePatient, loading: updating } = useUpdatePatient();
  const { deletePatient } = useDeletePatient();
  const { createVisit, loading: creatingVisit } = useCreateVisit();

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleCreatePatient = useCallback(async (data: CreatePatientData) => {
    await createPatient(data);
    setShowForm(false);
    fetchPatients();
    toast.success(translations.createSuccess);
  }, [createPatient, fetchPatients]);

  const handleUpdatePatient = useCallback(async (data: CreatePatientData) => {
    if (!editingPatient) return;
    await updatePatient(editingPatient.id, data);
    setEditingPatient(undefined);
    setShowForm(false);
    fetchPatients();
    toast.success(translations.updateSuccess);
  }, [editingPatient, updatePatient, fetchPatients]);

  const handleDeletePatient = useCallback(async (patient: Patient) => {
    if (confirm(translations.deleteConfirm.replace('{name}', patient.name))) {
      await deletePatient(patient.id);
      fetchPatients();
      toast.success(translations.deleteSuccess);
    }
  }, [deletePatient, fetchPatients]);

  const handleEditClick = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingPatient(undefined);
  }, []);

  // Fetch patient visits when a patient is selected
  const fetchPatientVisits = useCallback(async (patientId: number) => {
    setLoadingVisits(true);
    try {
      const response = await visitService.getAll({ patient_id: patientId });
      if (response.data) {
        setPatientVisits(response.data.slice(0, 5)); // Show last 5 visits
      }
    } catch (error) {
      console.error('Failed to fetch patient visits:', error);
    } finally {
      setLoadingVisits(false);
    }
  }, []);

  const handlePatientClick = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    fetchPatientVisits(patient.id);
  }, [fetchPatientVisits]);

  const handleAddVisitClick = useCallback(() => {
    setShowVisitForm(true);
  }, []);

  const handleVisitFormSubmit = useCallback(async (data: CreateVisitData) => {
    if (!selectedPatient) return;
    
    const visitData = {
      ...data,
      patient_id: selectedPatient.id,
    };
    
    try {
      await createVisit(visitData);
      toast.success('Visit added successfully');
      handleCloseVisitForm();
    } catch (error) {
      toast.error('Failed to create visit');
    }
  }, [selectedPatient, createVisit]);

  const handleCloseVisitForm = useCallback(() => {
    setShowVisitForm(false);
    // Refresh visits after adding
    if (selectedPatient) {
      fetchPatientVisits(selectedPatient.id);
    }
  }, [selectedPatient, fetchPatientVisits]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{translations.patients}</h1>
              <p className="text-sm text-gray-500">{translations.patientsSubtitle}</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[#2E7D32] text-white font-medium rounded-lg hover:bg-[#1B5E20] transition-colors shadow-sm"
            >
              + Add Patient
            </button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <PatientSearch onSearch={handleSearch} />
      </div>

      {/* Patient List */}
      <main className="px-4 pb-4">
        <PatientList
          patients={patients}
          loading={loading}
          onPatientClick={handlePatientClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeletePatient}
        />
      </main>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPatient ? translations.editPatient : translations.newPatient}
              </h2>
            </div>
            <div className="p-6">
              <PatientForm
                patient={editingPatient}
                onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
                onCancel={closeForm}
                isLoading={creating || updating}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedPatient.name}
              </h2>
              <p className="text-sm text-primary-600">
                {translations.referenceNumber}: {selectedPatient.reference_number}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Phone */}
              <div>
                <p className="text-sm text-gray-500">{translations.phone}</p>
                <p className="text-gray-900">{selectedPatient.phone || '-'}</p>
              </div>
              
              {/* WhatsApp */}
              <div>
                <p className="text-sm text-gray-500">{translations.whatsapp}</p>
                <p className="text-gray-900">{selectedPatient.whatsapp || '-'}</p>
              </div>
              
              {/* Age & Gender */}
              {(selectedPatient.age || selectedPatient.gender) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedPatient.age && (
                    <div>
                      <p className="text-sm text-gray-500">{translations.age}</p>
                      <p className="text-gray-900">{selectedPatient.age}</p>
                    </div>
                  )}
                  {selectedPatient.gender && (
                    <div>
                      <p className="text-sm text-gray-500">{translations.gender}</p>
                      <p className="text-gray-900 capitalize">{selectedPatient.gender}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Address */}
              <div>
                <p className="text-sm text-gray-500">{translations.address}</p>
                <p className="text-gray-900">{selectedPatient.address || '-'}</p>
              </div>

              {/* Country */}
              <div>
                <p className="text-sm text-gray-500">{translations.country}</p>
                <p className="text-gray-900">{selectedPatient.country || 'Pakistan'}</p>
              </div>

              {/* Diseases */}
              {selectedPatient.diseases && (
                <div>
                  <p className="text-sm text-gray-500">{translations.diseases}</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPatient.diseases}</p>
                </div>
              )}

              {/* Prescription */}
              {selectedPatient.prescription && (
                <div>
                  <p className="text-sm text-gray-500">{translations.prescription}</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPatient.prescription}</p>
                </div>
              )}

              {/* Notes */}
              {selectedPatient.notes && (
                <div>
                  <p className="text-sm text-gray-500">{translations.notes}</p>
                  <p className="text-gray-900">{selectedPatient.notes}</p>
                </div>
              )}

              {/* Added On */}
              <div>
                <p className="text-sm text-gray-500">{translations.addedOn}</p>
                <p className="text-gray-900">
                  {selectedPatient.created_at ? formatDate(selectedPatient.created_at) : '-'}
                </p>
              </div>

              {/* Last Visits Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Recent Visits</h3>
                  <button
                    onClick={handleAddVisitClick}
                    className="px-3 py-1.5 bg-[#2E7D32] text-white text-sm font-medium rounded-lg hover:bg-[#1B5E20] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Visit
                  </button>
                </div>
                
                {loadingVisits ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : patientVisits.length > 0 ? (
                  <div className="space-y-2">
                    {patientVisits.map((visit) => (
                      <div key={visit.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : 'No date'}
                            </p>
                            {visit.prescription && (
                              <p className="text-sm text-gray-600 line-clamp-2">{visit.prescription}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Rs. {visit.total_amount || 0}
                            </p>
                            <p className={`text-xs ${
                              visit.payment_status === 'paid' ? 'text-green-600' :
                              visit.payment_status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {visit.payment_status === 'paid' ? 'Paid' : 
                               visit.payment_status === 'partial' ? `Rs. ${visit.balance} due` : 'Unpaid'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No visits yet</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setPatientVisits([]);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {translations.close}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Visit Form Modal */}
      {showVisitForm && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Visit - {selectedPatient.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedPatient.reference_number}
              </p>
            </div>
            <div className="p-6">
              <VisitForm
                onSubmit={handleVisitFormSubmit}
                onCancel={handleCloseVisitForm}
                isLoading={creatingVisit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
