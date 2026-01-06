
'use client';

import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/lib/types';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ViewFamilyMemberModalProps {
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
  onClose,
  member,
}: ViewFamilyMemberModalProps) {
  return (
    <div className="relative p-1">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 close-icon">
        <X className="h-4 w-4" />
      </Button>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Member Details: {member.firstName} {member.lastName}
        </h2>
        <p className="text-sm text-muted-foreground">Read-only view of the family member's details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 py-4">
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
    </div>
  );
}
