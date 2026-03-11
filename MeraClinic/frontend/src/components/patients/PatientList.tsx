import { Patient } from '@/services/patient';

interface PatientListProps {
  patients: Patient[];
  loading?: boolean;
  onPatientClick?: (patient: Patient) => void;
  onEditClick?: (patient: Patient) => void;
  onDeleteClick?: (patient: Patient) => void;
}

export function PatientList({ 
  patients, 
  loading, 
  onPatientClick, 
  onEditClick, 
  onDeleteClick 
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
      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {patients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-1 ml-2">
                {onPatientClick && (
                  <button
                    onClick={() => onPatientClick(patient)}
                    className="p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
                    title="View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}
                {onEditClick && (
                  <button
                    onClick={() => onEditClick(patient)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDeleteClick && (
                  <button
                    onClick={() => onDeleteClick(patient)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
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
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition">
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
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onPatientClick && (
                        <button
                          onClick={() => onPatientClick(patient)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      {onEditClick && (
                        <button
                          onClick={() => onEditClick(patient)}
                          className="p-2 text-gray-400 hover:text-accent-600 hover:bg-blue-50 rounded-lg transition hidden sm:flex"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDeleteClick && (
                        <button
                          onClick={() => onDeleteClick(patient)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition hidden sm:flex"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
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
