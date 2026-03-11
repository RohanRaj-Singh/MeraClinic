import { useState } from 'react';
import { Visit } from '@/services/visit';

interface PaymentModalProps {
  visit: Visit;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}

export function PaymentModal({ visit, onClose, onSubmit }: PaymentModalProps) {
  const [amount, setAmount] = useState(visit.balance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > visit.balance) {
      setError('Invalid amount');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(amount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <p className="text-sm text-gray-500 mt-1">
            {visit.patient?.name || `Patient #${visit.patient_id}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">PKR {visit.total_amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Already Paid:</span>
              <span className="font-medium">PKR {visit.received_amount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Balance:</span>
              <span className="font-semibold text-red-600">PKR {visit.balance}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (PKR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              max={visit.balance}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(visit.balance)}
                className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Full Amount
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.ceil(visit.balance / 2))}
                className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Half
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
