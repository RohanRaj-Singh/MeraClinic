import { Patient } from '@/services/patient';

interface PatientListProps {
  patients: Patient[];
  loading?: boolean;
  onPatientClick?: (patient: Patient) => void;
}

export function PatientList({ 
  patients, 
  loading, 
  onPatientClick
}: PatientListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          <p>No patients found. Add your first patient!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-0">
      {/* Mobile Card View - Clickable */}
      <div className="md:hidden space-y-2">
        {patients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition cursor-pointer"
            onClick={() => onPatientClick?.(patient)}
          >
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    {patient.reference_number}
                  </span>
                </div>
                <p className="font-medium text-gray-900 truncate">{patient.name}</p>
                {patient.phone && (
                  <p className="text-sm text-gray-500">{patient.phone}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Clickable rows */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Country
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Added On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onPatientClick?.(patient)}
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary-600">{patient.reference_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      {patient.address && (
                        <p className="text-sm text-gray-500 md:hidden">{patient.address}</p>
                      )}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center text-gray-600">
                      {patient.phone || '-'}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-gray-600">
                    {patient.country || 'Pakistan'}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-gray-600">
                    {patient.created_at 
                      ? new Date(patient.created_at).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PatientList;
