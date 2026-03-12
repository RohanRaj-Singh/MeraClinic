import { useRef, useEffect, useState } from 'react';
import { Camera, ImagePlus, FileImage, X } from 'lucide-react';
import type { File as VisitFile } from '@/services/visit';
import { ImageGallery } from './ImageGallery';

interface PrescriptionSectionProps {
  mode: 'image' | 'text';
  prescription?: string;
  existingImages: VisitFile[];
  onModeChange: (mode: 'image' | 'text') => void;
  onPrescriptionChange: (value: string) => void;
  onImageSelect: (file: globalThis.File | null) => void;
  onDeleteImage: (fileId: number) => Promise<void>;
}

export function PrescriptionSection({
  mode,
  prescription,
  existingImages,
  onModeChange,
  onPrescriptionChange,
  onImageSelect,
  onDeleteImage,
}: PrescriptionSectionProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    onImageSelect(file);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prescription
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Choose image capture/upload or write prescription text.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onModeChange('image')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              mode === 'image'
                ? 'bg-white text-primary-dark shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Image
          </button>
          <button
            type="button"
            onClick={() => onModeChange('text')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              mode === 'text'
                ? 'bg-white text-primary-dark shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Text
          </button>
        </div>
      </div>

      {mode === 'image' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-[#81C784] bg-[#E8F5E9] px-4 py-4 text-center transition hover:bg-[#D7EFD9]"
            >
              <Camera className="h-5 w-5 text-primary-dark" />
              <span className="mt-2 text-sm font-medium text-primary-dark">Capture</span>
              <span className="mt-1 text-xs text-primary-dark">Use mobile camera</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition hover:bg-gray-100"
            >
              <ImagePlus className="h-5 w-5 text-gray-700" />
              <span className="mt-2 text-sm font-medium text-gray-800">Gallery</span>
              <span className="mt-1 text-xs text-gray-500">Upload from photos</span>
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {selectedFile ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    onImageSelect(null);
                  }}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-white hover:text-gray-700"
                  aria-label="Remove prescription image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-5 text-center">
              <FileImage className="mx-auto h-5 w-5 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                No prescription image selected yet.
              </p>
            </div>
          )}

          <ImageGallery images={existingImages} onDeleteImage={onDeleteImage} />
        </div>
      ) : (
        <textarea
          value={prescription || ''}
          onChange={(e) => onPrescriptionChange(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Enter prescription details..."
        />
      )}
    </div>
  );
}
