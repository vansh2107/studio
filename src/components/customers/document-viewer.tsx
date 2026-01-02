'use client';

import { Client, FamilyMember } from '@/lib/types';
import { Download } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-base">{value || 'N/A'}</p>
  </div>
);

const DocumentLink = ({
  label,
  url,
  filename,
}: {
  label: string;
  url?: string;
  filename?: string;
}) => {
  if (!url) return <DetailItem label={label} value="Not uploaded" />;

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-primary hover:underline"
      >
        <Download className="mr-2 h-4 w-4" />
        {filename || 'View Document'}
      </a>
    </div>
  );
};


interface DocumentViewerProps {
    person: Client | FamilyMember;
}

export function DocumentViewer({ person }: DocumentViewerProps) {
    return (
        <div className="mt-4 p-4 border rounded-lg bg-background/50">
            <h4 className="font-semibold text-md mb-4">
                Showing documents for: {person.firstName} {person.lastName}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DocumentLink
                    label="PAN Photo"
                    url={person.panPhotoUrl}
                    filename={person.panFileName}
                />
                <DocumentLink
                    label="Aadhaar Photo"
                    url={person.aadhaarPhotoUrl}
                    filename={person.aadhaarFileName}
                />
                <DocumentLink
                    label="Other Document"
                    url={person.otherDocumentUrl}
                    filename={person.otherDocumentFileName}
                />
            </div>
        </div>
    );
}
