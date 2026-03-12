import { useState, useCallback, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Visit, CreateVisitData, VisitFilters } from '@/services/visit';
import { fileService } from '@/services/file';
import { useVisits, useCreateVisit, useUpdateVisit, useRecordPayment } from '@/hooks/useVisits';
import { VisitList, VisitFiltersComponent, VisitForm, PaymentModal } from '@/components/visits';
import { toast } from 'sonner';

export default function VisitsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [filters, setFilters] = useState<VisitFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { visits, loading, fetchVisits, filterByDate, filterByStatus } = useVisits(filters);
  const { createVisit, loading: creating } = useCreateVisit();
  const { updateVisit, loading: updating } = useUpdateVisit();
  const { recordPayment } = useRecordPayment();

  const handleFilterChange = useCallback((newFilters: VisitFilters) => {
    setFilters(newFilters);
    filterByDate(newFilters.date_from, newFilters.date_to);
    filterByStatus(newFilters.payment_status);
  }, [filterByDate, filterByStatus]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters = { ...filters };
      if (searchQuery) {
        newFilters.search = searchQuery;
      } else {
        delete newFilters.search;
      }
      setFilters(newFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    const newFilters = { ...filters };
    delete newFilters.search;
    setFilters(newFilters);
  }, [filters]);

  const handleCreateVisit = useCallback(async (
    data: CreateVisitData,
    options: { prescriptionMode: 'image' | 'text'; prescriptionImageFile?: File | null }
  ) => {
    const createdVisit = await createVisit(data);

    if (options.prescriptionMode === 'image' && options.prescriptionImageFile) {
      try {
        await fileService.upload(options.prescriptionImageFile, {
          patient_id: data.patient_id,
          visit_id: createdVisit.id,
        });
      } catch (error) {
        toast.error('Visit saved, but prescription image upload failed');
      }
    }

    setShowForm(false);
    fetchVisits();
  }, [createVisit, fetchVisits]);

  const handleUpdateVisit = useCallback(async (
    data: CreateVisitData,
    options: { prescriptionMode: 'image' | 'text'; prescriptionImageFile?: File | null }
  ) => {
    if (!editingVisit) return;

    const updatedVisit = await updateVisit(editingVisit.id, data);

    if (options.prescriptionMode === 'image' && options.prescriptionImageFile) {
      try {
        await fileService.upload(options.prescriptionImageFile, {
          patient_id: editingVisit.patient_id,
          visit_id: updatedVisit.id,
        });
      } catch (error) {
        toast.error('Visit updated, but prescription image upload failed');
      }
    }

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Visits</h1>
              <p className="text-sm text-gray-500">Manage patient visits</p>
            </div>
            <div className="flex items-center gap-2 sm:self-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search patient, ref or visit #"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-8 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Toggle filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark sm:flex-none"
              >
                Add Visit
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
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
          <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingVisit ? 'Edit Visit' : 'New Visit'}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 sm:hidden"
                  aria-label="Close visit modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
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
