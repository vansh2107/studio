
'use client';

import { Button } from '@/components/ui/button';
import { Client, FamilyMember, DisplayClient } from '@/lib/types';
import {
  Download,
  X,
  PlusCircle,
  Edit,
  Trash2,
  User,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getFamilyMembersForClient } from '@/lib/mock-data';

interface ViewFamilyModalProps {
  onClose: () => void;
  client: Client;
  familyMembers: FamilyMember[];
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
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

export function ViewFamilyModal({
  onClose,
  client,
  familyMembers: initialFamilyMembers,
  onAddMember,
  onEditMember,
  onDeleteMember,
}: ViewFamilyModalProps) {

  const { toast } = useToast();
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(getFamilyMembersForClient(client.id));

  const handleDelete = (member: FamilyMember) => {
    // In a real app with assets, you would check here.
    const hasAssets = false; // MOCK
    if (hasAssets) {
       toast({
        title: 'Cannot Delete Member',
        description: 'This member has assets assigned and cannot be deleted.',
        variant: 'destructive',
      });
    } else {
      setMemberToDelete(member);
    }
  };
  
  const confirmDelete = () => {
    if(memberToDelete) {
      onDeleteMember(memberToDelete.id);
      // Also update local state to reflect deletion
      setFamilyMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      setMemberToDelete(null);
    }
  }


  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2 relative">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
          <X className="h-4 w-4" />
      </Button>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Client Details: {client.firstName} {client.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Viewing record for {client.firstName} {client.lastName}.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 py-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="First Name" value={client.firstName} />
            <DetailItem label="Last Name" value={client.lastName} />
            <DetailItem label="Phone Number" value={client.phoneNumber} />
            <DetailItem label="Email ID" value={client.email} />
            <DetailItem
              label="Date of Birth"
              value={formatDate(client.dateOfBirth)}
            />
            <DetailItem
              label="Anniversary Date"
              value={formatDate(client.anniversaryDate)}
            />
            <div className="md:col-span-2">
              <DetailItem label="Address" value={client.address} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 border-b pb-1">
            <h3 className="text-lg font-semibold">Family Members</h3>
            <Button variant="outline" size="sm" onClick={onAddMember}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{member.firstName} {member.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.relation}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                         <Button variant="ghost" size="icon" onClick={() => onEditMember(member)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" onClick={() => handleDelete(member)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                 {familyMembers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No members added yet.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
        </div>


        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1">
            Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentLink
              label="PAN Photo"
              url={client.panPhotoUrl}
              filename={client.panFileName}
            />
            <DocumentLink
              label="Aadhaar Photo"
              url={client.aadhaarPhotoUrl}
              filename={client.aadhaarFileName}
            />
            <DocumentLink
              label="Other Document"
              url={client.otherDocumentUrl}
              filename={client.otherDocumentFileName}
            />
          </div>
        </div>
      </div>
      
       <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{memberToDelete?.firstName} {memberToDelete?.lastName}</strong> from this family account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
