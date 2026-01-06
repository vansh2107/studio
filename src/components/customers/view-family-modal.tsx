
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ViewFamilyModalProps {
  onClose: () => void;
  client: Client;
  familyMembers: FamilyMember[];
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
}

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

  const handleDeleteTrigger = (member: FamilyMember) => {
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
    <div className="max-h-[80vh] overflow-y-auto pr-2 -mr-2">
      <div className="flex justify-between items-center mb-4 border-b pb-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Family Members
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage members of the {client.lastName} family.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canCreateMember && (
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Member
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-6 py-4">
        <div>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFamilyForTable.map((member) => {
                  const isHead = member.id === client.id;
                  return (
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isHead && canUpdateMember && (
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(member as FamilyMember)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {!isHead && canDeleteMember && (
                            <AlertDialog open={!!memberToDelete && memberToDelete.id === member.id} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTrigger(member as FamilyMember)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete <strong>{member?.firstName} {member?.lastName}</strong> from this family account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                 {allFamilyForTable.length === 1 && ( // Only head exists
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No members added yet.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
