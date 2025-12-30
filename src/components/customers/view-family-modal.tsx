'use client';

import { Button } from '@/components/ui/button';
import { Family } from '@/lib/types';
import { Download, X } from 'lucide-react';

interface ViewFamilyModalProps {
  onClose: () => void;
  family: Family;
}

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

export function ViewFamilyModal({
  onClose,
  family,
}: ViewFamilyModalProps) {
  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2">
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
        <div className='flex justify-between items-start'>
            <div>
                <h2 className="text-lg font-semibold leading-none tracking-tight">Family Details: {family.familyName}</h2>
                <p className="text-sm text-muted-foreground">
                    Viewing record for the {family.familyName} family.
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className='-mr-2 -mt-2'>
                <X className='h-4 w-4' />
            </Button>
        </div>
      </div>
      <div className="grid gap-6 py-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="Family Head" value={family.familyHeadName} />
            <DetailItem label="Family Name" value={family.familyName} />
            <DetailItem label="Phone Number" value={family.phoneNumber} />
            <DetailItem label="Email ID" value={family.emailId} />
            <DetailItem
              label="Date of Birth"
              value={
                family.dateOfBirth
                  ? new Date(family.dateOfBirth).toLocaleDateString()
                  : 'N/A'
              }
            />
            <DetailItem
              label="Anniversary Date"
              value={
                family.anniversaryDate
                  ? new Date(family.anniversaryDate).toLocaleDateString()
                  : 'N/A'
              }
            />
            <div className="md:col-span-2">
              <DetailItem label="Address" value={family.address} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">
            Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentLink
              label="PAN Photo"
              url={family.panPhotoUrl}
              filename={family.panFileName}
            />
            <DocumentLink
              label="Aadhaar Photo"
              url={family.aadhaarPhotoUrl}
              filename={family.aadhaarFileName}
            />
            <DocumentLink
              label="Other Document"
              url={family.otherDocumentUrl}
              filename={family.otherDocumentFileName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
