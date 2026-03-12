import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ToggleLeft,
  ToggleRight,
  X,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { adminService } from '@/services/admin';
import { toast } from 'sonner';

interface Clinic {
  id: number;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  patient_prefix: string;
  reference_counter: number;
  expires_at?: string;
  created_at: string;
}

interface ClinicFormData {
  name: string;
  phone?: string;
  address?: string;
  patient_prefix?: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  expires_at?: string;
}

const initialFormData: ClinicFormData = {
  name: '',
  phone: '',
  address: '',
  patient_prefix: 'MC',
  admin_name: '',
  admin_email: '',
  admin_password: '',
  expires_at: '',
};

export default function Clinics() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState<ClinicFormData>(initialFormData);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminClinics', search],
    queryFn: async () => {
      const response = await adminService.getClinics({ search });
      return response.data as Clinic[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ClinicFormData) => adminService.createClinic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast.success('Clinic created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create clinic');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClinicFormData> }) => 
      adminService.updateClinic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast.success('Clinic updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update clinic');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteClinic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast.success('Clinic deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete clinic');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleClinicStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast.success('Clinic status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const openCreateModal = () => {
    setEditingClinic(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      phone: clinic.phone || '',
      address: clinic.address || '',
      patient_prefix: clinic.patient_prefix,
      admin_name: '',
      admin_email: '',
      admin_password: '',
      expires_at: clinic.expires_at || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClinic(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClinic) {
      updateMutation.mutate({ id: editingClinic.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      deleteMutation.mutate(id);
    }
  };

  const clinics = data || [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinics</h2>
          <p className="text-sm text-gray-500">Manage all registered clinics</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]"
        >
          <Plus className="h-4 w-4" />
          Add Clinic
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clinics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clinic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prefix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </td>
              </tr>
            ) : clinics.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No clinics found
                </td>
              </tr>
            ) : (
              clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9]">
                        <Building2 className="h-5 w-5 text-[#2E7D32]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{clinic.name}</p>
                        <p className="text-sm text-gray-500">{clinic.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {clinic.patient_prefix}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {clinic.is_active ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {clinic.expires_at ? new Date(clinic.expires_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(clinic.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatusMutation.mutate(clinic.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        title={clinic.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {clinic.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(clinic)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(clinic.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Prefix
                    </label>
                    <input
                      type="text"
                      value={formData.patient_prefix}
                      onChange={(e) => setFormData({ ...formData, patient_prefix: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                  />
                </div>

                {!editingClinic && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Admin Account</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.admin_password}
                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expires At
                      </label>
                      <input
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : editingClinic ? (
                      'Save Changes'
                    ) : (
                      'Create Clinic'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
