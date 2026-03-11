import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitService, Visit, CreateVisitData } from '@/services/visit';
import { patientService, Patient } from '@/services/patient';
import { 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2,
  CreditCard,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function VisitsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid' | ''>('');
  const queryClient = useQueryClient();

  const { data: visitsResponse, isLoading } = useQuery({
    queryKey: ['visits', searchTerm, dateFrom, dateTo, paymentStatus],
    queryFn: () => visitService.getAll({
      patient_id: searchTerm ? undefined : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      payment_status: paymentStatus || undefined,
    }),
  });

  const { data: patientsResponse } = useQuery({
    queryKey: ['patients', ''],
    queryFn: () => patientService.getAll({}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => visitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success('Visit deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete visit');
    },
  });

  const visits = visitsResponse?.data || [];
  const patients = patientsResponse?.data || [];

  const filteredVisits = searchTerm
    ? visits.filter((v: Visit) => 
        v.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.patient?.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : visits;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-gray-600 mt-1">Manage patient visits and prescriptions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition shadow-lg shadow-[#2E7D32]/25"
        >
          <Plus size={20} className="mr-2" />
          New Visit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by patient name or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Filter size={20} className="text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              placeholder="From"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              placeholder="To"
            />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'partial' | 'unpaid' | '')}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Visits</p>
              <p className="text-xl font-bold text-gray-900">{visits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">
                Rs. {visits.reduce((sum: number, v: Visit) => sum + v.total_amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Received</p>
              <p className="text-xl font-bold text-gray-900">
                Rs. {visits.reduce((sum: number, v: Visit) => sum + v.received_amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-xl font-bold text-gray-900">
                Rs. {visits.reduce((sum: number, v: Visit) => sum + v.balance, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32] mx-auto" />
            <p className="mt-2 text-gray-600">Loading visits...</p>
          </div>
        ) : filteredVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Prescription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisits.map((visit: Visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{visit.visit_time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{visit.patient?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{visit.patient?.reference_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 max-w-[200px] truncate">
                        {visit.prescription || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Rs. {visit.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Rs. {visit.received_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${visit.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rs. {visit.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        visit.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : visit.payment_status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {visit.payment_status.charAt(0).toUpperCase() + visit.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVisit(visit)}
                          className="p-2 text-gray-400 hover:text-[#2E7D32] hover:bg-[#E8F5E9] rounded-lg transition"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        {visit.balance > 0 && (
                          <button
                            onClick={() => {
                              setSelectedVisit(visit);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-[#1565C0] hover:bg-[#E3F2FD] rounded-lg transition"
                            title="Record Payment"
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-400 hover:text-[#1565C0] hover:bg-[#E3F2FD] rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this visit?')) {
                              deleteMutation.mutate(visit.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No visits found. Record your first patient visit!</p>
          </div>
        )}
      </div>

      {/* Add Visit Modal */}
      {showModal && (
        <VisitModal 
          patients={patients} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {/* View Visit Modal */}
      {selectedVisit && !showPaymentModal && (
        <ViewVisitModal 
          visit={selectedVisit} 
          onClose={() => setSelectedVisit(null)} 
          onPayment={() => {
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedVisit && (
        <PaymentModal 
          visit={selectedVisit}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedVisit(null);
          }}
        />
      )}
    </div>
  );
}

function VisitModal({ patients, onClose }: { patients: Patient[]; onClose: () => void }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: new Date().toTimeString().slice(0, 5),
    prescription: '',
    notes: '',
    total_amount: '',
    received_amount: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    setIsLoading(true);
    try {
      const data: CreateVisitData = {
        patient_id: Number(formData.patient_id),
        visit_date: formData.visit_date,
        visit_time: formData.visit_time,
        prescription: formData.prescription || undefined,
        notes: formData.notes || undefined,
        total_amount: formData.total_amount ? Number(formData.total_amount) : undefined,
        received_amount: formData.received_amount ? Number(formData.received_amount) : 0,
      };
      await visitService.create(data);
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success('Visit recorded successfully');
      onClose();
    } catch {
      toast.error('Failed to record visit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">New Visit</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.reference_number})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={formData.visit_time}
                onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
            <textarea
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              rows={4}
              placeholder="Enter prescription details..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (Rs.)</label>
              <input
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Received Amount (Rs.)</label>
              <input
                type="number"
                value={formData.received_amount}
                onChange={(e) => setFormData({ ...formData, received_amount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Record Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewVisitModal({ visit, onClose, onPayment }: { visit: Visit; onClose: () => void; onPayment: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Visit Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Patient</p>
              <p className="font-medium text-lg">{visit.patient?.name}</p>
              <p className="text-sm text-gray-500">{visit.patient?.reference_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium">{new Date(visit.visit_date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{visit.visit_time}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500 mb-2">Prescription</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{visit.prescription || 'No prescription recorded'}</p>
            </div>
          </div>

          {visit.notes && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Notes</p>
              <p className="text-gray-700">{visit.notes}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-lg">Rs. {visit.total_amount.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Received</p>
              <p className="font-bold text-lg text-green-600">Rs. {visit.received_amount.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Balance</p>
              <p className={`font-bold text-lg ${visit.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rs. {visit.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          {visit.balance > 0 && (
            <button
              onClick={onPayment}
              className="flex-1 px-4 py-3 bg-[#1565C0] text-white rounded-lg hover:bg-[#0D47A1] transition flex items-center justify-center"
            >
              <CreditCard size={20} className="mr-2" />
              Record Payment
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsLoading(true);
    try {
      await visitService.recordPayment(visit.id, Number(amount));
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success('Payment recorded successfully');
      onClose();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Outstanding balance: Rs. {visit.balance.toLocaleString()}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (Rs.)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${visit.balance}`}
              max={visit.balance}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            {[100, 500, 1000, visit.balance].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Rs. {val}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
