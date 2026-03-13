import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle,
  Edit2,
  Eye,
  KeyRound,
  Loader2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { adminService, type Clinic } from '@/services/admin';
import { toast } from 'sonner';

interface ClinicFormData {
  name: string;
  phone?: string;
  whatsapp?: string;
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
  whatsapp: '',
  address: '',
  patient_prefix: 'MC',
  admin_name: '',
  admin_email: '',
  admin_password: '',
  expires_at: '',
};

const strongPasswordHint = 'Use at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.';

function formatDate(date?: string | null) {
  return date ? new Date(date).toLocaleDateString() : '-';
}

export default function Clinics() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [viewClinicId, setViewClinicId] = useState<number | null>(null);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [resetClinic, setResetClinic] = useState<Clinic | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState<ClinicFormData>(initialFormData);

  const clinicsQuery = useQuery({
    queryKey: ['adminClinics', search, statusFilter],
    queryFn: async () => {
      const response = await adminService.getClinics({
        search,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      });
      return response.data;
    },
  });

  const clinicDetailQuery = useQuery({
    queryKey: ['adminClinic', viewClinicId],
    queryFn: async () => {
      if (!viewClinicId) {
        throw new Error('Clinic not selected');
      }

      const response = await adminService.getClinic(viewClinicId);
      return response.data;
    },
    enabled: !!viewClinicId,
  });

  const clinicStatsQuery = useQuery({
    queryKey: ['adminClinicStats', viewClinicId],
    queryFn: async () => {
      if (!viewClinicId) {
        throw new Error('Clinic not selected');
      }

      const response = await adminService.getClinicStats(viewClinicId);
      return response.data;
    },
    enabled: !!viewClinicId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: ClinicFormData) => adminService.createClinic(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Clinic created successfully');
      closeFormModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create clinic');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ClinicFormData> }) =>
      adminService.updateClinic(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminClinic', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Clinic updated successfully');
      closeFormModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update clinic');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteClinic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Clinic deleted successfully');
      closeDetails();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete clinic');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleClinicStatus(id),
    onSuccess: (_, clinicId) => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      queryClient.invalidateQueries({ queryKey: ['adminClinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Clinic status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update clinic status');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ clinicId, password }: { clinicId: number; password: string }) =>
      adminService.resetClinicPassword(clinicId, password),
    onSuccess: () => {
      toast.success('Clinic admin password reset successfully');
      closeResetModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const clinics = clinicsQuery.data ?? [];
  const selectedClinic = clinicDetailQuery.data ?? null;
  const clinicStats = clinicStatsQuery.data;
  const selectedAdmin = useMemo(() => selectedClinic?.users?.[0] ?? null, [selectedClinic]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateModal = () => {
    setEditingClinic(null);
    setFormData(initialFormData);
    setShowFormModal(true);
  };

  const openEditModal = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      phone: clinic.phone ?? '',
      whatsapp: clinic.whatsapp ?? '',
      address: clinic.address ?? '',
      patient_prefix: clinic.patient_prefix,
      admin_name: '',
      admin_email: '',
      admin_password: '',
      expires_at: clinic.expires_at ? clinic.expires_at.slice(0, 10) : '',
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingClinic(null);
    setFormData(initialFormData);
  };

  const closeDetails = () => setViewClinicId(null);

  const openResetModal = (clinic: Clinic) => {
    setResetClinic(clinic);
    setNewPassword('');
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setResetClinic(null);
    setNewPassword('');
    setShowResetModal(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (editingClinic) {
      updateMutation.mutate({
        id: editingClinic.id,
        payload: {
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address,
          patient_prefix: formData.patient_prefix,
          expires_at: formData.expires_at,
        },
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleDelete = (clinic: Clinic) => {
    if (window.confirm(`Delete ${clinic.name}? This removes its users and cannot be undone.`)) {
      deleteMutation.mutate(clinic.id);
    }
  };

  const handleResetPassword = (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetClinic) {
      return;
    }

    resetPasswordMutation.mutate({
      clinicId: resetClinic.id,
      password: newPassword,
    });
  };

  const statTiles = clinicStats
    ? [
        { label: 'Patients', value: clinicStats.total_patients },
        { label: 'Visits', value: clinicStats.total_visits },
        { label: 'Revenue', value: clinicStats.total_revenue.toLocaleString() },
        { label: 'Balance', value: clinicStats.total_balance.toLocaleString() },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Management</h2>
          <p className="text-sm text-gray-500">
            Create clinics, update expiry, inspect usage, and recover clinic admin access.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]"
        >
          <Plus className="h-4 w-4" />
          Add Clinic
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by clinic name or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
          />
        </div>
        <div className="flex rounded-2xl border border-gray-200 bg-white p-1">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                statusFilter === status ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Clinic</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clinicsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                    No clinics match the current filters.
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => {
                  const admin = clinic.users?.[0];

                  return (
                    <tr key={clinic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                            <Building2 className="h-5 w-5 text-[#2E7D32]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{clinic.name}</p>
                            <p className="text-sm text-gray-500">{clinic.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900">{admin?.name ?? 'Not available'}</p>
                        <p className="text-gray-500">{admin?.email ?? clinic.email ?? '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>{clinic.patients_count ?? 0} patients</p>
                        <p>{clinic.visits_count ?? 0} visits</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(clinic.expires_at)}</td>
                      <td className="px-6 py-4">
                        {clinic.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewClinicId(clinic.id)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100" title="View clinic details">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => toggleStatusMutation.mutate(clinic.id)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100" title={clinic.is_active ? 'Deactivate clinic' : 'Activate clinic'}>
                            {clinic.is_active ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                          </button>
                          <button onClick={() => openEditModal(clinic)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100" title="Edit clinic">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => openResetModal(clinic)} className="rounded-xl p-2 text-amber-600 hover:bg-amber-50" title="Reset clinic admin password">
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(clinic)} className="rounded-xl p-2 text-red-500 hover:bg-red-50" title="Delete clinic">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{editingClinic ? 'Edit clinic' : 'Add clinic'}</h3>
                <p className="text-sm text-gray-500">{editingClinic ? 'Update clinic details and expiry.' : 'Create a new clinic with its first admin account.'}</p>
              </div>
              <button onClick={closeFormModal} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Clinic name</span>
                  <input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Patient prefix</span>
                  <input value={formData.patient_prefix} onChange={(event) => setFormData({ ...formData, patient_prefix: event.target.value.toUpperCase() })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Phone</span>
                  <input value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</span>
                  <input value={formData.whatsapp} onChange={(event) => setFormData({ ...formData, whatsapp: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Address</span>
                <textarea rows={3} value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Expiry date</span>
                <input type="date" value={formData.expires_at} onChange={(event) => setFormData({ ...formData, expires_at: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
              </label>

              {!editingClinic && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-900">Initial clinic admin account</p>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-gray-700">Admin name</span>
                      <input required value={formData.admin_name} onChange={(event) => setFormData({ ...formData, admin_name: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-gray-700">Admin email</span>
                      <input type="email" required value={formData.admin_email} onChange={(event) => setFormData({ ...formData, admin_email: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-gray-700">Admin password</span>
                      <input type="password" required value={formData.admin_password} onChange={(event) => setFormData({ ...formData, admin_password: event.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                      <p className="mt-1 text-xs text-gray-500">{strongPasswordHint}</p>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeFormModal} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#2E7D32] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20] disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : editingClinic ? 'Save changes' : 'Create clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && resetClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Reset clinic admin password</h3>
                <p className="text-sm text-gray-500">{resetClinic.name}</p>
              </div>
              <button onClick={closeResetModal} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">New password</span>
                <input type="password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20" />
                <p className="mt-1 text-xs text-gray-500">{strongPasswordHint}</p>
              </label>

              <div className="flex gap-3">
                <button type="button" onClick={closeResetModal} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={resetPasswordMutation.isPending} className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
                  {resetPasswordMutation.isPending ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewClinicId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Clinic details</h3>
                <p className="text-sm text-gray-500">Inspect usage, admin access, and recovery actions.</p>
              </div>
              <button onClick={closeDetails} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              {(clinicDetailQuery.isLoading || clinicStatsQuery.isLoading) && (
                <div className="py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}

              {selectedClinic && (
                <>
                  <div className="rounded-3xl bg-slate-900 p-6 text-white">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{selectedClinic.slug}</p>
                        <h4 className="mt-2 text-3xl font-semibold">{selectedClinic.name}</h4>
                        <p className="mt-2 text-sm text-slate-300">Prefix {selectedClinic.patient_prefix} · Created {formatDate(selectedClinic.created_at)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => toggleStatusMutation.mutate(selectedClinic.id)} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15">
                          {selectedClinic.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => openResetModal(selectedClinic)} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                          Reset password
                        </button>
                      </div>
                    </div>
                  </div>

                  {clinicStats && (
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                      {statTiles.map((tile) => (
                        <div key={tile.label} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm text-gray-500">{tile.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-gray-900">{tile.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 p-5">
                      <h5 className="text-lg font-semibold text-gray-900">Clinic profile</h5>
                      <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-900">Email:</span> {selectedClinic.email ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Phone:</span> {selectedClinic.phone ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">WhatsApp:</span> {selectedClinic.whatsapp ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Address:</span> {selectedClinic.address ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Expires:</span> {formatDate(selectedClinic.expires_at)}</p>
                        <p><span className="font-medium text-gray-900">Users:</span> {selectedClinic.users_count ?? 0}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-gray-500" />
                        <h5 className="text-lg font-semibold text-gray-900">Clinic admin</h5>
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-900">Name:</span> {selectedAdmin?.name ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Email:</span> {selectedAdmin?.email ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Phone:</span> {selectedAdmin?.phone ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Last login:</span> {formatDate(selectedAdmin?.last_login_at)}</p>
                        <p><span className="font-medium text-gray-900">Last IP:</span> {selectedAdmin?.last_login_ip ?? '-'}</p>
                        <p><span className="font-medium text-gray-900">Status:</span> {selectedAdmin?.is_active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>

                  {clinicStats && (
                    <div className="rounded-2xl border border-gray-200 p-5">
                      <h5 className="text-lg font-semibold text-gray-900">Monthly activity</h5>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <p className="text-sm text-emerald-700">Patients this month</p>
                          <p className="mt-2 text-2xl font-semibold text-emerald-950">{clinicStats.patients_this_month}</p>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-4">
                          <p className="text-sm text-sky-700">Visits this month</p>
                          <p className="mt-2 text-2xl font-semibold text-sky-950">{clinicStats.visits_this_month}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-4">
                          <p className="text-sm text-amber-700">Revenue this month</p>
                          <p className="mt-2 text-2xl font-semibold text-amber-950">{clinicStats.revenue_this_month.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
