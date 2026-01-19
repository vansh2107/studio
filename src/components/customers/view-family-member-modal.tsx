
'use client';

import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/lib/types';
import { X, Folder } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Separator } from '../ui/separator';

interface ViewFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
}

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-base">{value || 'N/A'}</p>
  </div>
);

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    if (!isNaN(date.getTime())) {
      return format(date, 'dd MMM yyyy');
    }
    return dateString;
  } catch (e) {
    return dateString;
  }
};

export function ViewFamilyMemberModal({
  isOpen,
  onClose,
  member,
}: ViewFamilyMemberModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-card rounded-xl shadow-lg border w-full max-w-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b relative">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 close-icon">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Member Details: {member.firstName} {member.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">Read-only view of the family member's details.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <DetailItem label="First Name" value={member.firstName} />
            <DetailItem label="Last Name" value={member.lastName} />
            <DetailItem label="Relation" value={member.relation} />
            <DetailItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
            <DetailItem label="Phone Number" value={member.phoneNumber} />
            <DetailItem label="Email ID" value={member.emailId} />
            <div className="md:col-span-2">
                <DetailItem label="Address" value={member.address} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Documents</p>
              <Link
                href={`/documents/${member.id}?clientId=${member.clientId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Folder className="mr-2 h-4 w-4" />
                  View Documents
                </Button>
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
