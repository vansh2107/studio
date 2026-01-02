'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, users } from '@/lib/mock-data';
import { Client, FamilyMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Folder, Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DocumentViewer } from '@/components/customers/document-viewer';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

  const { member, familyHead, otherFamilyMembers } = useMemo(() => {
    if (!memberId || !clientId) {
      return { member: null, familyHead: null, otherFamilyMembers: [] };
    }

    const head = clients.find(c => c.id === clientId);
    if (!head) {
      return { member: null, familyHead: null, otherFamilyMembers: [] };
    }

    const allMembers = [
        head as unknown as FamilyMember, 
        ...familyMembers.filter(fm => fm.clientId === clientId)
    ];
    
    const selectedMember = allMembers.find(m => m.id === memberId);
    
    const otherMembers = familyMembers.filter(m => m.clientId === clientId);

    return { member: selectedMember, familyHead: head, otherFamilyMembers: otherMembers };
  }, [memberId, clientId]);

  if (!member || !familyHead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Member or Family not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested details could not be loaded.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isHead = 'role' in member && member.role === 'CUSTOMER';
  const personForDocs = isHead ? (familyHead as Client) : (member as FamilyMember);

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Client List
      </Button>

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

      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>D.O.B</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherFamilyMembers.map((fm) => (
                <TableRow key={fm.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{fm.firstName} {fm.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{fm.relation}</TableCell>
                  <TableCell>{formatDate(fm.dateOfBirth)}</TableCell>
                  <TableCell>{fm.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
      
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {otherFamilyMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No other members in this family.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
