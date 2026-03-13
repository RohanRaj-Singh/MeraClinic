import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Visits', href: '/visits', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38C6A7] to-[#0F8B74] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M50 10 L50 35 M35 25 L65 25 M50 65 L50 90 M35 75 L65 75 M25 50 L50 50 M75 50 L50 50" 
                        stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <span className="font-bold text-[#2E7D32]">Mera Clinic</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
              <X size={24} />
            </button>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-[#2E7D32] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38C6A7] to-[#0F8B74] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M50 10 L50 35 M35 25 L65 25 M50 65 L50 90 M35 75 L65 75 M25 50 L50 50 M75 50 L50 50" 
                        stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <span className="font-bold text-[#2E7D32]">Mera Clinic</span>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-[#2E7D32] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex items-center h-16 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block">{user?.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
