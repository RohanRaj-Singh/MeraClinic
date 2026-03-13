import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  Clock3,
  Users,
  XCircle,
} from 'lucide-react';
import { adminService } from '@/services/admin';

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await adminService.getStats();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <XCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load admin dashboard</p>
            <p className="text-sm text-red-600">Try again after refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Clinics',
      value: data.total_clinics,
      helper: `+${data.clinics_this_month} this month`,
      icon: Building2,
      tone: 'bg-sky-500',
    },
    {
      name: 'Active Clinics',
      value: data.active_clinics,
      helper: `${data.inactive_clinics} inactive`,
      icon: CheckCircle,
      tone: 'bg-emerald-500',
    },
    {
      name: 'Patients',
      value: data.total_patients.toLocaleString(),
      helper: `+${data.patients_this_month} this month`,
      icon: Users,
      tone: 'bg-amber-500',
    },
    {
      name: 'Visits',
      value: data.total_visits.toLocaleString(),
      helper: `+${data.visits_this_month} this month`,
      icon: Calendar,
      tone: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Super Admin</p>
            <h2 className="mt-2 text-3xl font-semibold">Clinic operations command center</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Monitor every clinic, review expiring accounts, and jump directly into account recovery actions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link
              to="/admin/clinics"
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Manage clinics
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-3 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.helper}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.tone}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recently created clinics</h3>
              <p className="text-sm text-gray-500">Newest tenants added to the platform.</p>
            </div>
            <Link to="/admin/clinics" className="text-sm font-medium text-[#2E7D32] hover:text-[#1B5E20]">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {data.recent_clinics.length === 0 ? (
              <p className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-500">No clinics added yet.</p>
            ) : (
              data.recent_clinics.slice(0, 6).map((clinic) => (
                <div key={clinic.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{clinic.name}</p>
                    <p className="text-sm text-gray-500">
                      {clinic.patients_count ?? 0} patients, {clinic.visits_count ?? 0} visits
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(clinic.created_at).toLocaleDateString()}</p>
                    <p className={clinic.is_active ? 'text-emerald-600' : 'text-gray-500'}>
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Expiring soon</h3>
              <p className="text-sm text-gray-500">
                {data.expiring_clinics} clinic{data.expiring_clinics === 1 ? '' : 's'} need attention.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {data.expiring_clinics_list.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
                No active clinic is nearing expiry.
              </div>
            ) : (
              data.expiring_clinics_list.slice(0, 5).map((clinic) => (
                <Link
                  key={clinic.id}
                  to="/admin/clinics"
                  className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 transition hover:bg-amber-100/60"
                >
                  <div>
                    <p className="font-medium text-amber-950">{clinic.name}</p>
                    <p className="text-sm text-amber-800">
                      Expires {clinic.expires_at ? new Date(clinic.expires_at).toLocaleDateString() : 'soon'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-700" />
                </Link>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">Recommended admin workflow</p>
                <p className="text-sm text-slate-500">
                  Review expiring clinics, extend dates, reset credentials, then confirm they can log in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
