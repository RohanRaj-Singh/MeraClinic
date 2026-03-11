import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, Patient } from '@/services/patient';
import { Search, Plus, Phone, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PatientWithBalance extends Patient {
  balance?: number;
  last_visit_date?: string;
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithBalance | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: () => patientService.getAll({ search: searchTerm }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete patient');
    },
  });

  const patients = response?.data || [];
  const meta = response?.meta;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage your clinic patients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition shadow-lg shadow-[#2E7D32]/25"
        >
          <Plus size={20} className="mr-2" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search patients by name, phone, or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32] mx-auto" />
            <p className="mt-2 text-gray-600">Loading patients...</p>
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Added On
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#2E7D32]">{patient.reference_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        {patient.address && (
                          <p className="text-sm text-gray-500">{patient.address}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="mr-2" />
                        {patient.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {patient.country || 'Pakistan'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {patient.created_at 
                        ? new Date(patient.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient as PatientWithBalance)}
                          className="p-2 text-gray-400 hover:text-[#2E7D32] hover:bg-[#E8F5E9] rounded-lg transition"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-[#1565C0] hover:bg-[#E3F2FD] rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this patient?')) {
                              deleteMutation.mutate(patient.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No patients found. Add your first patient!</p>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((meta.current_page - 1) * meta.per_page) + 1} to {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} results
            </p>
            <div className="flex gap-2">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    page === meta.current_page
                      ? 'bg-[#2E7D32] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <PatientModal onClose={() => setShowModal(false)} />
      )}

      {/* View Patient Modal */}
      {selectedPatient && (
        <ViewPatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  );
}

function PatientModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    country: 'Pakistan',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await patientService.create(formData);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient added successfully');
      onClose();
    } catch {
      toast.error('Failed to add patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add New Patient</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewPatientModal({ patient, onClose }: { patient: PatientWithBalance; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Patient Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center pb-4">
            <div className="w-20 h-20 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-2xl font-bold">
              {patient.name.charAt(0)}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-[#2E7D32] font-medium">{patient.reference_number}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{patient.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">WhatsApp</p>
              <p className="font-medium">{patient.whatsapp || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{patient.country || 'Pakistan'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{patient.gender || '-'}</p>
            </div>
          </div>
          {patient.address && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{patient.address}</p>
            </div>
          )}
          {patient.notes && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{patient.notes}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
