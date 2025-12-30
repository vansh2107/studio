'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Family } from '@/lib/types';
import { Download } from 'lucide-react';

interface ViewFamilyModalProps {
  isOpen: boolean;
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
  isOpen,
  onClose,
  family,
}: ViewFamilyModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Family Details: {family.familyName}</DialogTitle>
          <DialogDescription>
            Viewing record for the {family.familyName} family.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
