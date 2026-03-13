import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { canAccessPath, getDefaultRoute } from '@/lib/routing';

interface LoginErrorState {
  title: string;
  detail: string;
  hint?: string;
}

function getLoginErrorState(error: unknown): LoginErrorState {
  const message = error instanceof Error ? error.message : 'Unable to sign in right now.';

  switch (message) {
    case 'Invalid credentials':
      return {
        title: 'Login failed',
        detail: 'The email address or password is incorrect.',
        hint: 'Check both fields carefully and try again.',
      };
    case 'Account is disabled':
      return {
        title: 'Account disabled',
        detail: 'This account has been disabled by an administrator.',
        hint: 'Contact support or the super admin to restore access.',
      };
    case 'Your session has expired. Please sign in again.':
      return {
        title: 'Session expired',
        detail: message,
        hint: 'Sign in again to continue.',
      };
    case 'Unable to complete login':
      return {
        title: 'Unexpected login state',
        detail: 'The server did not return a usable login response.',
        hint: 'Try again. If the issue persists, check the backend auth response.',
      };
    default:
      return {
        title: 'Sign-in error',
        detail: message,
      };
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginErrorState | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.otpRequired && result.challenge) {
        navigate('/login/verify-otp', {
          replace: true,
          state: {
            email: result.challenge.email,
            otpExpiresAt: result.challenge.otp_expires_at,
            from: location.state?.from,
          },
        });
        return;
      }

      if (!result.user) {
        throw new Error('Unable to complete login');
      }

      const requestedPath = location.state?.from?.pathname;
      const redirectTo = requestedPath && canAccessPath(result.user, requestedPath)
        ? requestedPath
        : getDefaultRoute(result.user);

      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(getLoginErrorState(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7FAF8] to-[#E8F5E9] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#38C6A7] to-[#0F8B74] shadow-lg mb-4">
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-white" fill="currentColor">
              <path d="M50 10 L50 35 M35 25 L65 25 M50 65 L50 90 M35 75 L65 75 M25 50 L50 50 M75 50 L50 50" 
                    stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#2E7D32]">Mera Clinic</h1>
          <p className="text-gray-600 mt-1">آپ کے کلینک کا ڈیجیٹل رجسٹر</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
              <p className="font-semibold text-red-700">{error.title}</p>
              <p className="mt-1 text-red-600">{error.detail}</p>
              {error.hint && (
                <p className="mt-2 text-red-500">{error.hint}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
                placeholder="doctor@clinic.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-medium rounded-lg transition shadow-lg shadow-[#2E7D32]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#2E7D32] hover:text-[#1B5E20] font-medium">
                Register Clinic
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 Mera Clinic. All rights reserved.
        </p>
      </div>
    </div>
  );
}
