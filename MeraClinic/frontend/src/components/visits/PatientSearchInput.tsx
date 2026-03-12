import { Search, Check, UserRound, X } from 'lucide-react';

interface PatientData {
  id: number;
  name: string;
  reference_number: string;
  phone?: string;
}

interface PatientSearchInputProps {
  patients: PatientData[];
  loading: boolean;
  selectedPatient: PatientData | null;
  searchQuery: string;
  showResults: boolean;
  disabled?: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (patient: PatientData) => void;
  onClear: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function PatientSearchInput({
  patients,
  loading,
  selectedPatient,
  searchQuery,
  showResults,
  disabled = false,
  onSearchChange,
  onSelect,
  onClear,
  onFocus,
  onBlur,
}: PatientSearchInputProps) {
  if (disabled) return null;

  // If patient is selected, show the selected patient card with clear button
  if (selectedPatient && !showResults) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{selectedPatient.name}</p>
            <p className="text-xs text-gray-500">{selectedPatient.reference_number}</p>
            {selectedPatient.phone && (
              <p className="text-xs text-gray-400">{selectedPatient.phone}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
            aria-label="Clear patient selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          required
          placeholder="Search by patient name or reference number"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {showResults && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching patients...</div>
          ) : patients.length > 0 ? (
            patients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(patient);
                }}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.reference_number}</p>
                </div>
                {selectedPatient?.id === patient.id && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No patients found. Search by patient name or reference number.
            </div>
          )}
        </div>
      )}

      {selectedPatient && !showResults && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-gray-600 ring-1 ring-gray-200">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {selectedPatient.name}
            </p>
            <p className="text-xs text-gray-500">{selectedPatient.reference_number}</p>
          </div>
          <Check className="h-5 w-5 text-primary shrink-0" />
        </div>
      )}
    </div>
  );
}

interface PatientLockedDisplayProps {
  patient: PatientData | null;
  visitNumber?: string | null;
  isGeneratingVisitNumber?: boolean;
}

export function PatientLockedDisplay({ patient, visitNumber, isGeneratingVisitNumber }: PatientLockedDisplayProps) {
  if (!patient) return null;
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserRound className="h-4 w-4 text-primary" />
            <span className="truncate">{patient.name}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{patient.reference_number}</p>
          {patient.phone && (
            <p className="mt-1 text-xs text-gray-400">{patient.phone}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {visitNumber && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {visitNumber}
            </span>
          )}
          <span className="rounded-full bg-[#E8F5E9] px-2.5 py-1 text-xs font-medium text-[#1B5E20]">
            Locked
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Patient is preselected for this visit and cannot be changed here.
      </p>
    </div>
  );
}

export function PatientLoadingDisplay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  return <div className="h-12 animate-pulse rounded-xl bg-white" />;
}
