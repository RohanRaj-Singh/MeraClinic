import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminService } from '@/services/admin';

interface Stats {
  total_clinics: number;
  active_clinics: number;
  inactive_clinics: number;
  total_patients: number;
  total_visits: number;
  expiring_clinics: number;
  clinics_this_month: number;
  patients_this_month: number;
  visits_this_month: number;
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await adminService.getStats();
      return response.data as Stats;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-semibold text-red-800">Failed to load dashboard</h3>
        <p className="mt-1 text-sm text-red-600">Please try again later.</p>
      </div>
    );
  }

  const stats = data || {
    total_clinics: 0,
    active_clinics: 0,
    inactive_clinics: 0,
    total_patients: 0,
    total_visits: 0,
    expiring_clinics: 0,
    clinics_this_month: 0,
    patients_this_month: 0,
    visits_this_month: 0,
  };

  const statCards = [
    {
      name: 'Total Clinics',
      value: stats.total_clinics,
      change: `+${stats.clinics_this_month} this month`,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Clinics',
      value: stats.active_clinics,
      change: `${stats.inactive_clinics} inactive`,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Total Patients',
      value: stats.total_patients.toLocaleString(),
      change: `+${stats.patients_this_month} this month`,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Visits',
      value: stats.total_visits.toLocaleString(),
      change: `+${stats.visits_this_month} this month`,
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.change}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {stats.expiring_clinics > 0 && (
        <div className="rounded-xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Expiring Subscriptions</h3>
              <p className="text-sm text-amber-700">
                {stats.expiring_clinics} clinic{stats.expiring_clinics > 1 ? 's' : ''} {stats.expiring_clinics > 1 ? 'have' : 'has'} subscription expiring soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href="/admin/clinics"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-3 text-sm font-medium text-white hover:bg-[#1B5E20]"
          >
            <Building2 className="h-4 w-4" />
            Manage Clinics
          </a>
        </div>
      </div>
    </div>
  );
}
