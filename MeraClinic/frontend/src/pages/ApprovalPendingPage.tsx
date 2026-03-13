import { Link, useLocation } from 'react-router-dom';

interface ApprovalPendingState {
  email?: string;
  clinicName?: string;
}

export default function ApprovalPendingPage() {
  const location = useLocation();
  const state = (location.state as ApprovalPendingState | null) ?? null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7FAF8] to-[#E8F5E9] px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-[#D9EDE2] bg-white p-8 shadow-xl">
        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
          Approval pending
        </div>
        <h1 className="mt-4 text-3xl font-bold text-[#14532D]">Registration submitted</h1>
        <p className="mt-3 text-gray-600">
          {state?.clinicName
            ? `${state.clinicName} is waiting for super admin approval before login is enabled.`
            : 'Your clinic is waiting for super admin approval before login is enabled.'}
        </p>
        <p className="mt-3 text-gray-600">
          {state?.email
            ? `We have sent a confirmation email to ${state.email}. You will receive another email as soon as your clinic is approved.`
            : 'We have sent a confirmation email. You will receive another email as soon as your clinic is approved.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="inline-flex items-center rounded-lg bg-[#166534] px-4 py-2 font-medium text-white transition hover:bg-[#14532D]"
          >
            Back to login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
          >
            Register another clinic
          </Link>
        </div>
      </div>
    </div>
  );
}
