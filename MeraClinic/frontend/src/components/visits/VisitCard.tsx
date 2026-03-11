import { Visit } from '@/services/visit';
import { cn } from '@/lib/api';

interface VisitCardProps {
  visit: Visit;
  onClick?: () => void;
  onPaymentClick?: () => void;
}

export function VisitCard({ visit, onClick, onPaymentClick }: VisitCardProps) {
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    unpaid: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr ? new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
    }) : '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow',
        onClick && 'hover:border-primary-300'
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {visit.patient?.name || `Patient #${visit.patient_id}`}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(visit.visit_date)}
            {visit.visit_time && ` • ${formatTime(visit.visit_time)}`}
          </p>
        </div>
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            statusColors[visit.payment_status]
          )}
        >
          {statusLabels[visit.payment_status]}
        </span>
      </div>

      {visit.prescription && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {visit.prescription.substring(0, 100)}
          {visit.prescription.length > 100 ? '...' : ''}
        </p>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-semibold text-gray-900">{formatCurrency(visit.total_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Balance</p>
          <p className={cn(
            'font-semibold',
            visit.balance > 0 ? 'text-red-600' : 'text-green-600'
          )}>
            {formatCurrency(visit.balance)}
          </p>
        </div>
        {visit.balance > 0 && onPaymentClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPaymentClick();
            }}
            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
          >
            Pay
          </button>
        )}
      </div>
    </div>
  );
}

export default VisitCard;
