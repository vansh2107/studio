
'use client';

import { Button } from '@/components/ui/button';
import { Client, FamilyMember } from '@/lib/types';
import Link from 'next/link';
import {
  X,
  PlusCircle,
  Edit,
  Trash2,
  User,
  Folder,
  Eye,
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
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { ViewFamilyMemberModal } from './view-family-member-modal';

interface ViewFamilyModalProps {
  onClose: () => void;
  client: Client;
  familyMembers: FamilyMember[];
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
}

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
  familyMembers,
  onAddMember,
  onEditMember,
  onDeleteMember,
}: ViewFamilyModalProps) {
  const { hasPermission } = useCurrentUser();
  const { toast } = useToast();
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [memberToView, setMemberToView] = useState<FamilyMember | null>(null);
  
  const allFamilyForTable = [{...client, relation: 'Head', name: `${client.firstName} ${client.lastName}` }, ...familyMembers];

  const canCreateMember = hasPermission('CUSTOMER_ACTIONS', 'create');
  const canUpdateMember = hasPermission('CUSTOMER_ACTIONS', 'edit');
  const canDeleteMember = hasPermission('CUSTOMER_ACTIONS', 'delete');

  const handleAdd = () => {
    if (!canCreateMember) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to add a family member.', variant: 'destructive' });
        return;
    }
    onAddMember();
  };

  const handleEdit = (member: FamilyMember) => {
     if (!canUpdateMember) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to edit this family member.', variant: 'destructive' });
        return;
    }
    onEditMember(member);
  }

  const handleDelete = (member: FamilyMember) => {
     if (!canDeleteMember) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to delete this family member.', variant: 'destructive' });
        return;
    }
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
      setMemberToDelete(null);
    }
  }


  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2 relative">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
          <X className="h-4 w-4" />
      </Button>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
             Family Members
          </h2>
          <p className="text-sm text-muted-foreground">
            Viewing members of the {client.lastName} family.
          </p>
      </div>
      <div className="grid gap-6 py-4">
        <div>
          <div className="flex justify-between items-center mb-2 border-b pb-1">
            <h3 className="text-lg font-semibold">Family Members List</h3>
            {canCreateMember && (
                <Button variant="outline" size="sm" onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                </Button>
            )}
          </div>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Documents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFamilyForTable.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{member.firstName} {member.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{'relation' in member ? member.relation : 'N/A'}</TableCell>
                    <TableCell>
                      <Link
                        href={`/documents/${member.id}?clientId=${client.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                         <Button variant="ghost" size="icon">
                            <Folder className="h-5 w-5 text-primary" />
                         </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                 {allFamilyForTable.length === 1 && ( // Only head exists
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No members added yet.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
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

        <Modal open={!!memberToView} onClose={() => setMemberToView(null)}>
            {memberToView && (
                <ViewFamilyMemberModal
                    member={memberToView}
                    onClose={() => setMemberToView(null)}
                />
            )}
        </Modal>

    </div>
  );
}
