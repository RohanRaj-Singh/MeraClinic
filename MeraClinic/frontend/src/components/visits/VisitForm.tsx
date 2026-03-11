import { useState, useEffect } from 'react';
import { Visit, CreateVisitData, Patient } from '@/services/visit';
import { patientService } from '@/services/patient';

interface VisitFormProps {
  visit?: Visit;
  onSubmit: (data: CreateVisitData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VisitForm({ visit, onSubmit, onCancel, isLoading }: VisitFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [formData, setFormData] = useState<CreateVisitData>({
    patient_id: visit?.patient_id || 0,
    visit_date: visit?.visit_date || new Date().toISOString().split('T')[0],
    visit_time: visit?.visit_time || new Date().toTimeString().slice(0, 5),
    prescription: visit?.prescription || '',
    notes: visit?.notes || '',
    total_amount: visit?.total_amount || 0,
    received_amount: visit?.received_amount || 0,
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientService.getAll({});
        setPatients(response.data || []);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateVisitData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalAmount = formData.total_amount || 0;
  const receivedAmount = formData.received_amount || 0;
  const balance = totalAmount - receivedAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patient *
        </label>
        {loadingPatients ? (
          <div className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
        ) : (
          <select
            value={formData.patient_id}
            onChange={(e) => handleChange('patient_id', Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={0}>Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.reference_number})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visit Date *
          </label>
          <input
            type="date"
            value={formData.visit_date}
            onChange={(e) => handleChange('visit_date', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visit Time
          </label>
          <input
            type="time"
            value={formData.visit_time}
            onChange={(e) => handleChange('visit_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prescription
        </label>
        <textarea
          value={formData.prescription}
          onChange={(e) => handleChange('prescription', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter prescription details..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Additional notes..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount (PKR)
          </label>
          <input
            type="number"
            value={formData.total_amount}
            onChange={(e) => handleChange('total_amount', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Received Amount (PKR)
          </label>
          <input
            type="number"
            value={formData.received_amount}
            onChange={(e) => handleChange('received_amount', Number(e.target.value))}
            min={0}
            max={totalAmount}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {totalAmount > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Balance:</span>
            <span className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              PKR {balance}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : visit ? 'Update Visit' : 'Create Visit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default VisitForm;
