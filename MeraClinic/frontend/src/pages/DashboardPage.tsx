import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, DashboardData } from '@/services/dashboard';
import { Users, Calendar, FileText, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardService.getDashboard();
      return res.data as DashboardData;
    },
  });

  const stats = response?.stats;
  const recentVisits = response?.recent_visits || [];

  const statsCards = [
    {
      title: 'Total Patients',
      value: stats?.total_patients || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Today\'s Visits',
      value: stats?.today_visits || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      trend: '+5%',
    },
    {
      title: 'This Month',
      value: stats?.monthly_visits || 0,
      icon: FileText,
      color: 'bg-orange-500',
      trend: '+8%',
    },
    {
      title: 'Pending Balance',
      value: `Rs. ${(stats?.total_balance || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-red-500',
      trend: '-3%',
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening at your clinic today.
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp size={16} className="mr-1" />
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/patients"
            className="flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-[#2E7D32] hover:shadow-md transition group"
          >
            <div className="p-3 rounded-lg bg-[#E8F5E9] group-hover:bg-[#2E7D32] transition">
              <Users className="w-6 h-6 text-[#2E7D32] group-hover:text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">Add Patient</h3>
              <p className="text-sm text-gray-500">Register new patient</p>
            </div>
          </Link>

          <Link
            to="/visits"
            className="flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-[#2E7D32] hover:shadow-md transition group"
          >
            <div className="p-3 rounded-lg bg-[#E3F2FD] group-hover:bg-[#1565C0] transition">
              <Calendar className="w-6 h-6 text-[#1565C0] group-hover:text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">New Visit</h3>
              <p className="text-sm text-gray-500">Create visit record</p>
            </div>
          </Link>

          <Link
            to="/patients"
            className="flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-[#2E7D32] hover:shadow-md transition group"
          >
            <div className="p-3 rounded-lg bg-[#FFF3E0] group-hover:bg-[#F57C00] transition">
              <FileText className="w-6 h-6 text-[#F57C00] group-hover:text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">View Patients</h3>
              <p className="text-sm text-gray-500">Browse patient list</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Visits</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {recentVisits.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentVisits.slice(0, 5).map((visit) => (
                <div key={visit.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#2E7D32]" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">{visit.patient?.name || 'Patient'}</p>
                      <p className="text-sm text-gray-500">{visit.patient?.reference_number || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Rs. {visit.total_amount}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      {new Date(visit.visit_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No visits yet. Start by adding a patient!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
