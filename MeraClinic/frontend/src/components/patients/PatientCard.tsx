import { Patient } from '@/services/patient';
import { cn } from '@/lib/api';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PatientCard({ patient, onClick, onEdit, onDelete }: PatientCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
          <p className="text-sm text-primary-600 font-medium">
            {patient.reference_number}
          </p>
        </div>
        {patient.age && (
          <span className="text-sm text-gray-500">
            {patient.age} {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {patient.phone && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {patient.phone}
          </p>
        )}
        {patient.address && (
          <p className="text-sm text-gray-500 line-clamp-2">{patient.address}</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Added</p>
          <p className="text-sm text-gray-600">
            {patient.created_at ? formatDate(patient.created_at) : '-'}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientCard;
