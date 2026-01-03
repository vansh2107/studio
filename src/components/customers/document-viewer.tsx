
'use client';

import { Client, FamilyMember } from '@/lib/types';
import { Download, Trash2, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const DetailItem = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-base">{value || 'N/A'}</p>
  </div>
);

// New component to handle each document slot
const DocumentSlot = ({
  label,
  url,
  filename,
  onDelete,
  onView,
}: {
  label: string;
  url?: string | null;
  filename?: string;
  onDelete: () => void;
  onView: () => void;
}) => {
  if (!url) {
    return <DetailItem label={label} value="Not uploaded" />;
  }

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="relative group w-20 h-20 rounded-md overflow-hidden border">
          <Image
            src={url}
            alt={filename || label}
            fill
            className="object-cover"
            data-ai-hint="document scan"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col">
            <p className="text-sm font-semibold truncate max-w-[120px]">{filename || label}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
};


const TheatreMode = ({ src, onClose }: { src: string; onClose: () => void }) => (
    <div 
        className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative max-w-[90vw] max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <Image 
            src={src} 
            alt="Document full view" 
            width={1200}
            height={1600}
            className="w-auto h-auto max-w-full max-h-full object-contain"
            data-ai-hint="document scan"
        />
      </motion.div>
       <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white z-[101] p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors"
        >
            <X className="h-6 w-6" />
      </button>
    </div>
);


interface DocumentViewerProps {
  person: Client | FamilyMember;
}

export function DocumentViewer({ person }: DocumentViewerProps) {
  const [documents, setDocuments] = useState({
      pan: { url: person.panPhotoUrl, name: person.panFileName },
      aadhaar: { url: person.aadhaarPhotoUrl, name: person.aadhaarFileName },
      other: { url: person.otherDocumentUrl, name: person.otherDocumentFileName },
  });
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleDelete = (docKey: keyof typeof documents) => {
      if (window.confirm(`Are you sure you want to delete this document? This action cannot be undone.`)) {
          setDocuments(prev => ({ ...prev, [docKey]: { url: null, name: undefined } }));
      }
  }

  // Use a placeholder if the URL is not available for demonstration
  const getUrl = (url?: string | null) => url || 'https://picsum.photos/seed/doc/200/200';

  return (
    <>
      <div className="mt-4 p-4 border rounded-lg bg-background/50">
        <h4 className="font-semibold text-md mb-4">
          Showing documents for: {person.firstName} {person.lastName}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DocumentSlot
            label="PAN Photo"
            url={documents.pan.url ? getUrl(documents.pan.url) : null}
            filename={documents.pan.name}
            onView={() => documents.pan.url && setViewingImage(getUrl(documents.pan.url))}
            onDelete={() => handleDelete('pan')}
          />
          <DocumentSlot
            label="Aadhaar Photo"
            url={documents.aadhaar.url ? getUrl(documents.aadhaar.url) : null}
            filename={documents.aadhaar.name}
            onView={() => documents.aadhaar.url && setViewingImage(getUrl(documents.aadhaar.url))}
            onDelete={() => handleDelete('aadhaar')}
          />
          <DocumentSlot
            label="Other Document"
            url={documents.other.url ? getUrl(documents.other.url) : null}
            filename={documents.other.name}
            onView={() => documents.other.url && setViewingImage(getUrl(documents.other.url))}
            onDelete={() => handleDelete('other')}
          />
        </div>
      </div>
      <AnimatePresence>
        {viewingImage && <TheatreMode src={viewingImage} onClose={() => setViewingImage(null)} />}
      </AnimatePresence>
    </>
  );
}
