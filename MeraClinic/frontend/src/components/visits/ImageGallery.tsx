import { useState, useEffect, useRef } from 'react';
import { Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { File as VisitFile } from '@/services/visit';
import { fileService } from '@/services/file';
import { toast } from 'sonner';

interface ImageGalleryProps {
  images: VisitFile[];
  onDeleteImage: (fileId: number) => Promise<void>;
}

export function ImageGallery({ images, onDeleteImage }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<Record<number, string>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const objectUrlsRef = useRef<Record<number, string>>({});

  const loadImages = async () => {
    const pendingImages = images.filter((file) => !objectUrlsRef.current[file.id]);

    if (pendingImages.length === 0) {
      setGalleryUrls({ ...objectUrlsRef.current });
      return;
    }

    const entries = await Promise.all(
      pendingImages.map(async (file) => {
        try {
          const objectUrl = await fileService.getImageObjectUrl(file.id);
          return [file.id, objectUrl] as const;
        } catch (error) {
          console.error(`Failed to load image ${file.id}:`, error);
          return [file.id, ''] as const;
        }
      })
    );

    entries.forEach(([fileId, url]) => {
      if (url) {
        objectUrlsRef.current[fileId] = url;
      }
    });

    setGalleryUrls({ ...objectUrlsRef.current });
  };

  useEffect(() => {
    loadImages();
    return () => {
      Object.values(objectUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleDelete = async (fileId: number) => {
    setDeletingId(fileId);
    try {
      await onDeleteImage(fileId);
      const objectUrl = objectUrlsRef.current[fileId];
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        delete objectUrlsRef.current[fileId];
      }
      setGalleryUrls({ ...objectUrlsRef.current });
      setSelectedIndex(null);
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const showPrevious = () => {
    if (selectedIndex === null || images.length === 0) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const showNext = () => {
    if (selectedIndex === null || images.length === 0) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;
  const selectedImageUrl = selectedImage ? galleryUrls[selectedImage.id] : undefined;

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          This visit already has {images.length} image attachment{images.length > 1 ? 's' : ''}.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {images.map((file, index) => (
            <div
              key={file.id}
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                disabled={!galleryUrls[file.id]}
                className="block w-full"
                aria-label={`Open ${file.file_name}`}
              >
                {galleryUrls[file.id] ? (
                  <img
                    src={galleryUrls[file.id]}
                    alt={file.file_name}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center text-xs text-gray-500">
                    Loading...
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(file.id);
                }}
                disabled={deletingId === file.id}
                className="absolute left-1 top-1 z-10 rounded-full bg-white/90 p-1.5 text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Delete image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && selectedImageUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-3"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute left-3 top-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {selectedIndex! + 1} / {images.length}
            </div>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selectedImage.id)}
              disabled={deletingId === selectedImage.id}
              className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-red-600/80 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
              aria-label="Delete image"
            >
              <Trash2 className="mr-2 inline h-4 w-4" />
              Delete Image
            </button>
            {images.length > 1 && (
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <img
              src={selectedImageUrl}
              alt={selectedImage.file_name}
              className="max-h-[82vh] w-full rounded-2xl bg-black object-contain"
            />
            {images.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-white backdrop-blur">
              {selectedImage.file_name}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
