import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import PublicOnlyRoute from '@/components/PublicOnlyRoute'
import Layout from '@/components/Layout'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminClinics from '@/pages/admin/Clinics'
import LoginPage from '@/pages/LoginPage'
import OtpVerificationPage from '@/pages/OtpVerificationPage'
import RegisterPage from '@/pages/RegisterPage'
import ApprovalPendingPage from '@/pages/ApprovalPendingPage'
import DashboardPage from '@/pages/DashboardPage'
import PatientsPage from '@/pages/patients/Index'
import VisitsPage from '@/pages/visits/Index'
import SettingsPage from '@/pages/SettingsPage'
import { getDefaultRoute } from '@/lib/routing'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  return <Navigate to={isAuthenticated ? getDefaultRoute(user) : '/login'} replace />
}

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  const fallbackRoute = isAuthenticated ? getDefaultRoute(user) : '/login'

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login/verify-otp"
        element={
          <PublicOnlyRoute>
            <OtpVerificationPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/approval-pending"
        element={
          <PublicOnlyRoute>
            <ApprovalPendingPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="clinics" element={<AdminClinics />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/visits" element={<VisitsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={fallbackRoute} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
