import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPath, getDefaultRoute } from '@/lib/routing';

function formatExpiry(expiresAt?: string | null): string {
  if (!expiresAt) {
    return '10 minutes';
  }

  const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const minutes = Math.max(1, Math.ceil(diff / 60000));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = location.state?.email as string | undefined;
  const from = location.state?.from;
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(location.state?.otpExpiresAt ?? null);

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const user = await verifyOtp(email, otp);
      const requestedPath = from?.pathname;
      const redirectTo = requestedPath && canAccessPath(user, requestedPath)
        ? requestedPath
        : getDefaultRoute(user);

      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setIsResending(true);

    try {
      const response = await resendOtp(email);
      setOtpExpiresAt(response.otp_expires_at);
      setMessage('A new OTP has been sent. Check your email or server logs.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7FAF8] to-[#E8F5E9] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#38C6A7] to-[#0F8B74] shadow-lg mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#2E7D32]">Verify Login</h1>
          <p className="text-gray-600 mt-2">Enter the 6-digit OTP sent for <span className="font-medium">{email}</span>.</p>
          <p className="text-sm text-gray-500 mt-1">This challenge expires in about {formatExpiry(otpExpiresAt)}.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition tracking-[0.35em] text-center text-xl font-semibold"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-medium rounded-lg transition shadow-lg shadow-[#2E7D32]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full mt-4 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Resending...
              </>
            ) : (
              <>
                <RefreshCcw size={18} />
                Resend OTP
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#2E7D32] hover:text-[#1B5E20] font-medium text-sm">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
