
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, associates, relationshipManagers } from '@/lib/mock-data';
import { Client, FamilyMember, RelationshipManager } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DocumentViewer } from '@/components/customers/document-viewer';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const DetailItem = ({ label, value, className }: { label: string; value?: string | null, className?: string }) => (
  <div className={className}>
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium">{value || 'N/A'}</p>
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

  const { member, familyHead, relationshipManager } = useMemo(() => {
    if (!memberId || !clientId) {
      return { member: null, familyHead: null, relationshipManager: null };
    }

    const head = clients.find(c => c.id === clientId);
    if (!head) {
      return { member: null, familyHead: null, relationshipManager: null };
    }
    
    // The "member" could be the head itself or a family member
    const allPossibleMembers = [
        head as unknown as FamilyMember, // Treat head as a potential member for finding
        ...familyMembers.filter(fm => fm.clientId === clientId)
    ];
    
    const selectedMember = allPossibleMembers.find(m => m.id === memberId);

    // Find the Relationship Manager
    let rm: RelationshipManager | undefined;
    const associate = associates.find(a => a.id === head.associateId);
    if (associate) {
        rm = relationshipManagers.find(r => r.id === associate.rmId);
    }

    return { member: selectedMember, familyHead: head, relationshipManager: rm };
  }, [memberId, clientId]);
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

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
  
  const addressParts = member.address?.split(', ');
  const city = addressParts?.length > 1 ? addressParts[1] : 'N/A';
  const state = addressParts?.length > 2 ? addressParts[2] : 'N/A';


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

      <Card className="overflow-hidden">
        <div className="bg-orange-gradient-horizontal h-2" />
        <CardHeader>
          <CardTitle className="text-xl">Client Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="md:col-span-1 flex flex-col items-center text-center md:items-start md:text-left md:border-r md:pr-8">
            <Avatar className="w-24 h-24 mb-4 border-4 border-background ring-2 ring-primary">
               <AvatarImage src={familyHead?.avatarUrl} alt={member.name} />
               <AvatarFallback className="text-3xl">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <div className="space-y-1 mt-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{(member as any).email || member.emailId || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{member.phoneNumber || 'N/A'}</span>
                </div>
            </div>
            <Separator className="my-4"/>
            <div className="text-sm">
                <p className="text-muted-foreground">Family Head</p>
                <p className="font-semibold">{familyHead.name}</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
              <div className="space-y-4">
                <DetailItem label="PAN" value={(member as any).panNumber || 'ABCDE1234F'} />
                <DetailItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                <DetailItem label="Address" value={addressParts?.[0] || member.address} />
                <DetailItem label="City" value={city} />
                <DetailItem label="State" value={state} />
                <DetailItem label="Pin code" value="400001" />
              </div>
            </div>
            
            <div className="border rounded-lg p-4 h-fit">
                <h3 className="font-semibold text-lg mb-4 text-primary">Escalation Matrix</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Broker</p>
                        <DetailItem label="Name" value="Prime Wealth Brokerage" />
                        <DetailItem label="Email" value="broker@demo.app" />
                        <DetailItem label="Phone" value="1234567890" />
                    </div>
                    <Separator />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relationship Manager</p>
                        <DetailItem label="Name" value={relationshipManager?.name || "N/A"} />
                        <DetailItem label="Email" value={relationshipManager?.email || "N/A"} />
                        <DetailItem label="Phone" value={relationshipManager?.phone || "N/A"} />
                    </div>
                </div>
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
