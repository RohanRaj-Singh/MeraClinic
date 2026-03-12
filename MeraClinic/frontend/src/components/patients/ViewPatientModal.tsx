import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, X, Phone, MessageCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Patient, patientService } from '@/services/patient';
import { Visit, visitService } from '@/services/visit';
import { fileService } from '@/services/file';
import { useState, useEffect } from 'react';

// Urdu translations
const translations = {
  patientDetails: 'Patient Details / مریض کی تفصیل',
  phone: 'Phone / فون',
  whatsapp: 'WhatsApp / وہاٹس ایپ',
  address: 'Address / پتہ',
  country: 'Country / ملک',
  notes: 'Notes / نوٹس',
  diseases: 'Disease / بیماری',
  prescription: 'Prescription / نسخہ',
  testReports: 'Test Reports / ٹیسٹ رپورٹس',
  test: 'Test / ٹیسٹ',
  value: 'Value / قدر',
  balanceDue: 'Balance Due / بقایا',
  addVisit: 'Add Visit / ویزیٹ شامل کریں',
  edit: 'Edit / ترمیم',
  delete: 'Delete / حذف',
  noDiseases: 'No diseases recorded',
  noPrescription: 'No prescription recorded',
  recentVisits: 'Recent Visits / حالیہ ویزیٹ',
  noVisitImages: 'No prescription images',
  viewImage: 'View',
};

interface PatientWithBalance extends Patient {
  balance?: number;
  last_visit_date?: string;
}

interface ViewPatientModalProps {
  patient: PatientWithBalance;
  onClose: () => void;
  onEdit: () => void;
  onAddVisit?: () => void;
  onDelete?: () => void;
}

export function ViewPatientModal({ patient, onClose, onEdit, onAddVisit, onDelete }: ViewPatientModalProps) {
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<{ visitId: number; visitNumber: string; visitDate: string; fileId: number; url: string }[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  
  // Fetch recent visits
  const { data: visitsData } = useQuery({
    queryKey: ['visits', 'patient', patient.id],
    queryFn: () => visitService.getAll({ patient_id: patient.id, per_page: 4 }),
    enabled: !!patient.id,
  });

  // Load images from visits
  useEffect(() => {
    const loadImages = async () => {
      const visits = visitsData?.data || [];
      const imageFiles: { visitId: number; visitNumber: string; visitDate: string; fileId: number; url: string }[] = [];
      
      for (const visit of visits) {
        if (visit.files && visit.files.length > 0) {
          for (const file of visit.files) {
            if (file.type === 'image') {
              try {
                const url = await fileService.getImageObjectUrl(file.id);
                imageFiles.push({
                  visitId: visit.id,
                  visitNumber: visit.visit_number,
                  visitDate: visit.visit_date,
                  fileId: file.id,
                  url,
                });
              } catch (error) {
                console.error(`Failed to load image ${file.id}:`, error);
              }
            }
          }
        }
      }
      
      setGalleryImages(imageFiles);
    };

    if (visitsData?.data) {
      loadImages();
    }
  }, [visitsData]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      galleryImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, []);
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to delete patient');
    },
  });

  // Filter out empty reports
  const filledReports = patient.reports?.filter(r => r.value && r.value.trim() !== '') || [];

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    // Remove any non-digit characters and add country code if not present
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Patient Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={22} />
          </button>
        </div>

        {/* Patient Info Header */}
        <div className="flex-shrink-0 bg-white">
          {/* Ref Number, Name, Age Row */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-sm text-[#2E7D32] font-medium">{patient.reference_number}</p>
            <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
            {patient.age && (
              <p className="text-sm text-gray-500">Age: {patient.age} {patient.gender && `• ${patient.gender}`}</p>
            )}
          </div>

          {/* Contact Row with Call/WhatsApp buttons */}
          <div className="px-4 py-2 space-y-2">
            {patient.phone && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{translations.phone}</p>
                  <p className="font-medium text-sm">{patient.phone}</p>
                </div>
                <button
                  onClick={() => handleCall(patient.phone!)}
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                  title="Call"
                >
                  <Phone size={18} />
                </button>
              </div>
            )}
            {patient.whatsapp && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{translations.whatsapp}</p>
                  <p className="font-medium text-sm">{patient.whatsapp}</p>
                </div>
                <button
                  onClick={() => handleWhatsApp(patient.whatsapp!)}
                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                  title="WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Balance Row */}
          {(patient.balance && patient.balance > 0) && (
            <div className="px-4 py-2">
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2 flex justify-between items-center">
                <span className="text-sm text-red-700">{translations.balanceDue}</span>
                <span className="font-semibold text-red-700">Rs. {patient.balance}</span>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-2">
              {onAddVisit && (
                <button
                  onClick={onAddVisit}
                  className="flex-1 px-3 py-2.5 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  {translations.addVisit}
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex-1 px-3 py-2.5 bg-[#1565C0] text-white rounded-lg hover:bg-[#003C8F] transition text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Edit size={16} />
                {translations.edit}
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this patient?')) {
                    deleteMutation.mutate(patient.id);
                    onDelete?.();
                  }
                }}
                className="px-3 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Diseases Section */}
          {patient.diseases && patient.diseases.trim() !== '' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{translations.diseases}</p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{patient.diseases}</p>
              </div>
            </div>
          )}

          {/* Prescription Section */}
          {patient.prescription && patient.prescription.trim() !== '' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{translations.prescription}</p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{patient.prescription}</p>
              </div>
            </div>
          )}

          {/* Visit Images Gallery */}
          {galleryImages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{translations.recentVisits}</p>
              <div className="grid grid-cols-2 gap-2">
                {galleryImages.slice(0, 4).map((img, idx) => (
                  <div
                    key={`${img.visitId}-${img.fileId}`}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img
                      src={img.url}
                      alt={`Visit ${img.visitNumber}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition bg-white/90 rounded-full p-1.5">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                      <p className="text-[10px] text-white truncate">{img.visitNumber}</p>
                      <p className="text-[9px] text-white/80">{img.visitDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Table - Only show filled ones */}
          {filledReports.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{translations.testReports}</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{translations.test}</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{translations.value}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filledReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-3 py-2 text-gray-700">
                          {report.report_type_name || `Report #${report.report_type_id}`}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-[#2E7D32]">
                          {report.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {patient.address && (
            <div>
              <p className="text-sm text-gray-500">{translations.address}</p>
              <p className="font-medium">{patient.address}</p>
            </div>
          )}

          {patient.country && (
            <div>
              <p className="text-sm text-gray-500">{translations.country}</p>
              <p className="font-medium">{patient.country}</p>
            </div>
          )}

          {patient.notes && (
            <div>
              <p className="text-sm text-gray-500">{translations.notes}</p>
              <p className="font-medium">{patient.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X size={28} />
          </button>

          {selectedImageIndex > 0 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {selectedImageIndex < galleryImages.length - 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[selectedImageIndex].url}
              alt={`Visit ${galleryImages[selectedImageIndex].visitNumber}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center mt-3 text-white">
              <p className="font-medium">{galleryImages[selectedImageIndex].visitNumber}</p>
              <p className="text-sm text-white/70">{galleryImages[selectedImageIndex].visitDate}</p>
              <p className="text-xs text-white/50 mt-1">
                {selectedImageIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
