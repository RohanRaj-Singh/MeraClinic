import { useState, useCallback } from 'react';
import { Visit, CreateVisitData, VisitFilters } from '@/services/visit';
import { useVisits, useCreateVisit, useUpdateVisit, useRecordPayment } from '@/hooks/useVisits';
import { VisitList, VisitFiltersComponent, VisitForm, PaymentModal } from '@/components/visits';

export default function VisitsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [filters, setFilters] = useState<VisitFilters>({});

  const { visits, loading, fetchVisits, filterByDate, filterByStatus } = useVisits(filters);
  const { createVisit, loading: creating } = useCreateVisit();
  const { updateVisit, loading: updating } = useUpdateVisit();
  const { recordPayment } = useRecordPayment();

  const handleFilterChange = useCallback((newFilters: VisitFilters) => {
    setFilters(newFilters);
    filterByDate(newFilters.date_from, newFilters.date_to);
    filterByStatus(newFilters.payment_status);
  }, [filterByDate, filterByStatus]);

  const handleCreateVisit = useCallback(async (data: CreateVisitData) => {
    await createVisit(data);
    setShowForm(false);
    fetchVisits();
  }, [createVisit, fetchVisits]);

  const handleUpdateVisit = useCallback(async (data: CreateVisitData) => {
    if (!editingVisit) return;
    await updateVisit(editingVisit.id, data);
    setEditingVisit(undefined);
    setShowForm(false);
    fetchVisits();
  }, [editingVisit, updateVisit, fetchVisits]);

  const handlePayment = useCallback(async (amount: number) => {
    if (!selectedVisit) return;
    await recordPayment(selectedVisit.id, amount);
    setSelectedVisit(null);
    fetchVisits();
  }, [selectedVisit, recordPayment, fetchVisits]);

  const handleVisitClick = useCallback((visit: Visit) => {
    setEditingVisit(visit);
    setShowForm(true);
  }, []);

  const handlePaymentClick = useCallback((visit: Visit) => {
    setSelectedVisit(visit);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingVisit(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Visits</h1>
              <p className="text-sm text-gray-500">Manage patient visits</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                + New Visit
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 pt-4">
          <VisitFiltersComponent
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Visit List */}
      <main className="p-4">
        <VisitList
          visits={visits}
          loading={loading}
          onVisitClick={handleVisitClick}
          onPaymentClick={handlePaymentClick}
        />
      </main>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVisit ? 'Edit Visit' : 'New Visit'}
              </h2>
            </div>
            <div className="p-6">
              <VisitForm
                visit={editingVisit}
                onSubmit={editingVisit ? handleUpdateVisit : handleCreateVisit}
                onCancel={closeForm}
                isLoading={creating || updating}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedVisit && (
        <PaymentModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
}
