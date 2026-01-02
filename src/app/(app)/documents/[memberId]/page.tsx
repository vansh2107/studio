
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients } from '@/lib/mock-data';
import { Client, FamilyMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DocumentViewer } from '@/components/customers/document-viewer';
import { format, parseISO } from 'date-fns';

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

export default function MemberDocumentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const memberId = params.memberId as string;
  const clientId = searchParams.get('clientId');

  const { member, familyHead } = useMemo(() => {
    if (!memberId || !clientId) {
      return { member: null, familyHead: null };
    }

    const head = clients.find(c => c.id === clientId);
    if (!head) {
      return { member: null, familyHead: null };
    }
    
    // The "member" could be the head itself or a family member
    const allPossibleMembers = [
        head as unknown as FamilyMember, // Treat head as a potential member for finding
        ...familyMembers.filter(fm => fm.clientId === clientId)
    ];
    
    const selectedMember = allPossibleMembers.find(m => m.id === memberId);

    return { member: selectedMember, familyHead: head };
  }, [memberId, clientId]);

  if (!member || !familyHead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Member or Family not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested details could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const isHead = 'role' in member && member.role === 'CUSTOMER';
  const personForDocs = isHead ? (familyHead as Client) : (member as FamilyMember);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {member.firstName} {member.lastName} - Documents
        </h1>
        <p className="text-muted-foreground">
          Viewing details for a member of the {familyHead.lastName} family.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem label="First Name" value={member.firstName} />
            <DetailItem label="Last Name" value={member.lastName} />
            <DetailItem label="Relation" value={isHead ? 'Head' : member.relation} />
            <DetailItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
            <DetailItem label="Phone Number" value={member.phoneNumber} />
            <DetailItem label="Email ID" value={isHead ? familyHead.email : member.emailId} />
            <div className="md:col-span-3">
              <DetailItem label="Address" value={member.address} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Stored Documents</CardTitle>
        </CardHeader>
        <CardContent>
            <DocumentViewer person={personForDocs} />
        </CardContent>
      </Card>
    </div>
  );
}
