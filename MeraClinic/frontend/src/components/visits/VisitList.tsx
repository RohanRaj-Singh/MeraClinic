import { Visit } from '@/services/visit';
import { VisitCard } from './VisitCard';

interface VisitListProps {
  visits: Visit[];
  loading?: boolean;
  onVisitClick?: (visit: Visit) => void;
  onPaymentClick?: (visit: Visit) => void;
}

export function VisitList({ visits, loading, onVisitClick, onPaymentClick }: VisitListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-full mb-3"></div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <div className="h-4 bg-gray-100 rounded w-16"></div>
              <div className="h-4 bg-gray-100 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Visits Found</h3>
        <p className="text-gray-500">Create your first visit to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <VisitCard
          key={visit.id}
          visit={visit}
          onClick={() => onVisitClick?.(visit)}
          onPaymentClick={() => onPaymentClick?.(visit)}
        />
      ))}
    </div>
  );
}

export default VisitList;
