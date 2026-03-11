import { useState, useEffect } from 'react';
import { Patient, CreatePatientData } from '@/services/patient';
import { ReportType, reportTypeService } from '@/services/reportType';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: CreatePatientData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Urdu translations
const translations = {
  patientName: 'Patient Name / مریض کا نام',
  referenceNumber: 'Reference No. / ریفرنس نمبر',
  age: 'Age / عمر',
  phoneNumber: 'Phone No. / فون نمبر',
  whatsappNumber: 'WhatsApp / وہاٹس ایپ نمبر',
  sameAsPhone: 'Same as phone / فون نمبر کے ساتھ',
  address: 'Address / پتہ',
  country: 'Country / ملک',
  gender: 'Gender / صنف',
  male: 'Male / مرد',
  female: 'Female / عورت',
  other: 'Other / دیگر',
  diseases: 'Disease / بیماری',
  diseasesPlaceholder: 'Enter disease details... / بیماری کی تفصیل لکھیں...',
  prescription: 'Prescription / نسخہ',
  prescriptionPlaceholder: 'Enter prescription... / دوا کی تفصیل لکھیں...',
  notes: 'Notes / نوٹس',
  selectGender: 'Select Gender / صنف انتخاب کریں',
  createPatient: 'Save Patient / مریض بنائیں',
  updatePatient: 'Update Patient / مریض اپڈیٹ کریں',
  saving: 'Saving... / محفوظ ہو رہا ہے...',
  cancel: 'Cancel / منسوخ',
  reports: 'Reports / رپورٹس',
  reportsDescription: 'Add report values / رپورٹ کی قدر شامل کریں',
  normalRange: 'Normal Range / عام حد',
  addReport: 'Add Report / رپورٹ شامل کریں',
};

interface ReportValue {
  report_type_id: number;
  value: string;
  notes?: string;
}

export function PatientForm({ patient, onSubmit, onCancel, isLoading }: PatientFormProps) {
  const [sameAsPhone, setSameAsPhone] = useState(!!patient?.phone && patient?.phone === patient?.whatsapp);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [reportValues, setReportValues] = useState<ReportValue[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  useEffect(() => {
    // Fetch active report types
    const fetchReportTypes = async () => {
      setLoadingReports(true);
      try {
        const response = await reportTypeService.getActive();
        if (response.data) {
          setReportTypes(response.data);
          
          // Initialize report values for each report type
          const initialValues = response.data.map(rt => ({
            report_type_id: rt.id,
            value: '',
            notes: '',
          }));
          setReportValues(initialValues);
        }
      } catch (error) {
        console.error('Failed to fetch report types:', error);
      } finally {
        setLoadingReports(false);
      }
    };
    
    fetchReportTypes();
  }, []);
  
  const [formData, setFormData] = useState<CreatePatientData>({
    name: patient?.name || '',
    phone: patient?.phone || '',
    whatsapp: sameAsPhone ? patient?.phone : (patient?.whatsapp || ''),
    address: patient?.address || '',
    country: patient?.country || 'Pakistan',
    gender: patient?.gender || undefined,
    age: patient?.age || undefined,
    date_of_birth: patient?.date_of_birth || undefined,
    diseases: patient?.diseases || '',
    prescription: patient?.prescription || '',
    notes: patient?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty report values
    const reports = reportValues
      .filter(rv => rv.value && rv.value.trim() !== '')
      .map(rv => ({
        report_type_id: rv.report_type_id,
        value: rv.value,
        notes: rv.notes || undefined,
      }));
    
    const submitData = {
      ...formData,
      ...(reports.length > 0 && { reports }),
    };
    onSubmit(submitData);
  };

  const handleChange = (field: keyof CreatePatientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    if (sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: value }));
    }
  };

  const handleReportValueChange = (reportTypeId: number, field: 'value' | 'notes', value: string) => {
    setReportValues(prev => 
      prev.map(rv => 
        rv.report_type_id === reportTypeId 
          ? { ...rv, [field]: value }
          : rv
      )
    );
  };

  const handleSameAsPhoneChange = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.patientName} *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={translations.patientName}
        />
      </div>

      {/* Reference Number (Read-only) */}
      {patient?.reference_number && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.referenceNumber}
          </label>
          <input
            type="text"
            value={patient.reference_number}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
      )}

      {/* Age and Gender Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.age}
          </label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : undefined)}
            min={0}
            max={150}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={translations.age}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.gender}
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">{translations.selectGender}</option>
            <option value="male">{translations.male}</option>
            <option value="female">{translations.female}</option>
            <option value="other">{translations.other}</option>
          </select>
        </div>
      </div>

      {/* Phone and WhatsApp Row */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.phoneNumber}
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="0300-1234567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.whatsappNumber}
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="sameAsPhone"
            checked={sameAsPhone}
            onChange={(e) => handleSameAsPhoneChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="sameAsPhone" className="text-sm text-gray-600">
            {translations.sameAsPhone}
          </label>
        </div>
        <input
          type="tel"
          value={formData.whatsapp}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          disabled={sameAsPhone}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="0300-1234567"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.address}
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={translations.address}
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.country}
        </label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Diseases */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.diseases}
        </label>
        <textarea
          value={formData.diseases}
          onChange={(e) => handleChange('diseases', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={translations.diseasesPlaceholder}
        />
      </div>

      {/* Prescription */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.prescription}
        </label>
        <textarea
          value={formData.prescription}
          onChange={(e) => handleChange('prescription', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={translations.prescriptionPlaceholder}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.notes}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={translations.notes}
        />
      </div>

      {/* Reports Section */}
      {reportTypes.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="mb-3">
            <h3 className="text-lg font-medium text-gray-900">{translations.reports}</h3>
            <p className="text-sm text-gray-500">{translations.reportsDescription}</p>
          </div>
          
          {loadingReports ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {reportTypes.map((reportType) => {
                const reportValue = reportValues.find(rv => rv.report_type_id === reportType.id);
                return (
                  <div key={reportType.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {reportType.name}
                        {reportType.unit && (
                          <span className="text-gray-400 ml-1">({reportType.unit})</span>
                        )}
                      </label>
                      {reportType.normal_range && (
                        <span className="text-xs text-gray-500">
                          {translations.normalRange}: {reportType.normal_range}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={reportValue?.value || ''}
                        onChange={(e) => handleReportValueChange(reportType.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder="Enter value..."
                      />
                      <input
                        type="text"
                        value={reportValue?.notes || ''}
                        onChange={(e) => handleReportValueChange(reportType.id, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-[#2E7D32] text-white font-medium rounded-lg hover:bg-[#1B5E20] disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? translations.saving : patient ? translations.updatePatient : translations.createPatient}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          {translations.cancel}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;
