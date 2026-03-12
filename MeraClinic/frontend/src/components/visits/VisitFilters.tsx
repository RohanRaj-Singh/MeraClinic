import { useState, useCallback } from 'react';
import { VisitFilters } from '@/services/visit';

interface VisitFiltersProps {
  filters: VisitFilters;
  onFilterChange: (filters: VisitFilters) => void;
}

export function VisitFiltersComponent({ filters, onFilterChange }: VisitFiltersProps) {
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [status, setStatus] = useState<string>(filters.payment_status || '');

  const applyFilters = useCallback(() => {
    onFilterChange({
      ...filters,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      payment_status: (status || undefined) as 'paid' | 'partial' | 'unpaid' | undefined,
    });
  }, [dateFrom, dateTo, status, filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setDateFrom('');
    setDateTo('');
    setStatus('');
    onFilterChange({});
  }, [onFilterChange]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisitFiltersComponent;
