
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit, Trash2, LogIn, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FamilyFormModal } from '@/components/customers/family-form-modal';
import { ViewFamilyModal } from '@/components/customers/view-family-modal';
import { FamilyMemberFormModal } from '@/components/customers/family-member-form-modal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Family, FamilyMember, User } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { families as mockFamilies, familyMembers as mockFamilyMembers, users as mockUsers } from '@/lib/mock-data';
import Modal from '@/components/ui/Modal';
import {
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


type ActiveModal = 'form' | 'view' | 'delete' | 'member-form' | null;

export default function CustomersPage() {
  const { hasPermission, canImpersonate, impersonate } = useCurrentUser();
  const { toast } = useToast();

  const [families, setFamilies] = useState<Family[]>(mockFamilies);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
  const [loading, setLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);


  // Simulate fetching data
  useMemo(() => {
    setLoading(true);
    setTimeout(() => {
      setFamilies(mockFamilies);
      setFamilyMembers(mockFamilyMembers);
      setLoading(false);
    }, 500);
  }, []);

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedFamily(null);
    setSelectedMember(null);
  };

  const handleAddNew = () => {
    setSelectedFamily(null);
    setActiveModal('form');
  };

  const handleEdit = (family: Family) => {
    setSelectedFamily(family);
    setActiveModal('form');
  };

  const handleView = (family: Family) => {
    setSelectedFamily(family);
    setActiveModal('view');
  };

  const handleDeleteTrigger = (family: Family) => {
    setSelectedFamily(family);
    setActiveModal('delete');
  };

  const handleDeleteConfirm = () => {
    if (!selectedFamily) return;

    setFamilies(prev => prev.filter(f => f.id !== selectedFamily.id));
    setFamilyMembers(prev => prev.filter(fm => fm.customerId !== selectedFamily.id)); // Also remove members

    toast({
      title: 'Family Deleted',
      description: `The family "${selectedFamily.firstName} ${selectedFamily.lastName}" has been successfully deleted.`,
    });

    handleCloseModal();
  };

  const handleSave = (savedFamily: Family) => {
    setFamilies(prev => {
      const exists = prev.some(f => f.id === savedFamily.id);
      if (exists) {
        return prev.map(f =>
          f.id === savedFamily.id ? savedFamily : f
        );
      }
      return [...prev, savedFamily];
    });
    handleCloseModal();
  };

  // --- Member Handlers ---
  
  const handleAddMember = (family: Family) => {
    setSelectedFamily(family);
    setSelectedMember(null);
    setActiveModal('member-form');
  };
  
  const handleEditMember = (member: FamilyMember, family: Family) => {
    setSelectedFamily(family);
    setSelectedMember(member);
    setActiveModal('member-form');
  };
  
  const handleSaveMember = (member: FamilyMember) => {
    setFamilyMembers(prev => {
        const exists = prev.some(m => m.id === member.id);
        if (exists) {
            return prev.map(m => (m.id === member.id ? member : m));
        }
        return [...prev, member];
    });
    toast({ title: 'Success', description: `Family member "${member.firstName} ${member.lastName}" has been saved.` });
    handleCloseModal();
  };

  const handleDeleteMember = (memberId: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    toast({ title: 'Success', description: 'Family member has been deleted.' });
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
  
  const findCustomerUser = (family: Family): User | undefined => {
      // This is a mock lookup. In a real app this might be a property on the family or a DB query.
      return mockUsers.find(u => u.role === 'CUSTOMER' && u.name.toLowerCase().includes(family.lastName.toLowerCase()));
  }

  const canCreate = hasPermission('CUSTOMER', 'create');
  const canUpdate = hasPermission('CUSTOMER', 'update');
  const canDelete = hasPermission('CUSTOMER', 'delete');
  const canView = hasPermission('CUSTOMER', 'view');

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Customer Management</h1>
          {canCreate && (
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Family
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Email ID</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : families.length > 0 ? (
                  families.map(family => {
                    const customerUser = findCustomerUser(family);
                    return (
                        <TableRow key={family.id}>
                          <TableCell className="font-medium">{family.firstName}</TableCell>
                          <TableCell>{family.lastName}</TableCell>
                          <TableCell>{family.phoneNumber}</TableCell>
                          <TableCell>{family.emailId}</TableCell>
                          <TableCell>{formatDate(family.dateOfBirth)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                               {customerUser && canImpersonate(customerUser) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => impersonate(customerUser.id)} aria-label="Impersonate Customer">
                                            <LogIn className="h-4 w-4 text-blue-500 hover:text-blue-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Impersonate Customer</p></TooltipContent>
                                </Tooltip>
                              )}
                              {canView && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleView(family)} aria-label="View">
                                      <Eye className="h-4 w-4 hover:text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>View</p></TooltipContent>
                                </Tooltip>
                              )}
                              {canUpdate && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(family)} aria-label="Edit">
                                      <Edit className="h-4 w-4 hover:text-yellow-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Edit</p></TooltipContent>
                                </Tooltip>
                              )}
                              {canDelete && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteTrigger(family)} aria-label="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Delete</p></TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No families found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Unified Modal */}
        <Modal open={!!activeModal} onClose={handleCloseModal}>
          <>
            {activeModal === 'form' && (
              <FamilyFormModal
                onClose={handleCloseModal}
                family={selectedFamily}
                onSave={handleSave}
              />
            )}
            
            {activeModal === 'view' && selectedFamily && (
              <ViewFamilyModal
                onClose={handleCloseModal}
                family={selectedFamily}
                familyMembers={familyMembers.filter(m => m.customerId === selectedFamily.id)}
                onAddMember={() => handleAddMember(selectedFamily)}
                onEditMember={(m) => handleEditMember(m, selectedFamily)}
                onDeleteMember={handleDeleteMember}
              />
            )}

            {activeModal === 'member-form' && selectedFamily && (
              <FamilyMemberFormModal
                onClose={handleCloseModal}
                family={selectedFamily}
                member={selectedMember}
                onSave={handleSaveMember}
              />
            )}

            {activeModal === 'delete' && selectedFamily && (
              <div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the record for <strong>{selectedFamily.firstName} {selectedFamily.lastName}</strong> and all associated family members.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
                </AlertDialogFooter>
              </div>
            )}
          </>
        </Modal>
      </div>
    </TooltipProvider>
  );
}
