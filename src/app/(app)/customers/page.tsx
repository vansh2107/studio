

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
import { Client, FamilyMember, User } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getAllClients, familyMembers as mockFamilyMembers, users as mockUsers, getClientsForAssociate, getAssociatesForRM, getRMsForAdmin } from '@/lib/mock-data';
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
  const { effectiveUser, hasPermission, canImpersonate, impersonate } = useCurrentUser();
  const { toast } = useToast();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
    const clients = useMemo(() => {
    if (!effectiveUser) return [];
    setLoading(true);
    let clientsToShow: Client[] = [];
    switch (effectiveUser.role) {
      case 'SUPER_ADMIN':
        clientsToShow = getAllClients();
        break;
      case 'ADMIN':
        const rms = getRMsForAdmin(effectiveUser.id);
        const associatesForAdmin = rms.flatMap(rm => getAssociatesForRM(rm.id));
        clientsToShow = associatesForAdmin.flatMap(assoc => getClientsForAssociate(assoc.id));
        break;
      case 'RM':
         const associatesForRM = getAssociatesForRM(effectiveUser.id);
         clientsToShow = associatesForRM.flatMap(assoc => getClientsForAssociate(assoc.id));
        break;
      case 'ASSOCIATE':
        clientsToShow = getClientsForAssociate(effectiveUser.id);
        break;
    }
    setLoading(false);
    return clientsToShow;
  }, [effectiveUser]);


  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedClient(null);
    setSelectedMember(null);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setActiveModal('form');
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setActiveModal('form');
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setActiveModal('view');
  };

  const handleDeleteTrigger = (client: Client) => {
    setSelectedClient(client);
    setActiveModal('delete');
  };

  const handleDeleteConfirm = () => {
    if (!selectedClient) return;

    // This is a mock delete, in a real app you'd call an API
    // setClients(prev => prev.filter(f => f.id !== selectedClient.id));
    setFamilyMembers(prev => prev.filter(fm => fm.clientId !== selectedClient.id)); // Also remove members

    toast({
      title: 'Client Deleted',
      description: `The client "${selectedClient.firstName} ${selectedClient.lastName}" has been successfully deleted (mock).`,
    });

    handleCloseModal();
  };

  const handleSave = (savedFamily: Client) => {
    // In a real app, this would update the state. For now, we just close the modal.
    handleCloseModal();
     toast({
      title: selectedClient ? 'Client Updated' : 'Client Created',
      description: `The client "${savedFamily.firstName} ${savedFamily.lastName}" has been successfully saved (mock).`,
    });
  };

  // --- Member Handlers ---
  
  const handleAddMember = (client: Client) => {
    setSelectedClient(client);
    setSelectedMember(null);
    setActiveModal('member-form');
  };
  
  const handleEditMember = (member: FamilyMember, client: Client) => {
    setSelectedClient(client);
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
  
  const findCustomerUser = (client: Client): User | undefined => {
      return mockUsers.find(u => u.id === client.id);
  }

  const canCreate = hasPermission('CUSTOMER', 'create');
  const canUpdate = hasPermission('CUSTOMER', 'update');
  const canDelete = hasPermission('CUSTOMER', 'delete');
  const canView = hasPermission('CUSTOMER', 'view');

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Client Management</h1>
          {canCreate && (
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Client
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
                ) : clients.length > 0 ? (
                  clients.map(client => {
                    const customerUser = findCustomerUser(client);
                    return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.firstName}</TableCell>
                          <TableCell>{client.lastName}</TableCell>
                          <TableCell>{client.phoneNumber}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{formatDate(client.dateOfBirth)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                               {customerUser && canImpersonate(customerUser) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => impersonate(customerUser.id)} aria-label="Impersonate Customer">
                                            <LogIn className="h-4 w-4 text-blue-500 hover:text-blue-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Impersonate Client</p></TooltipContent>
                                </Tooltip>
                              )}
                              {canView && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleView(client)} aria-label="View">
                                      <Eye className="h-4 w-4 hover:text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>View</p></TooltipContent>
                                </Tooltip>
                              )}
                              {canUpdate && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} aria-label="Edit">
                                      <Edit className="h-4 w-4 hover:text-yellow-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Edit</p></TooltipContent>
                                </Tooltip>
                              )}
                              {canDelete && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteTrigger(client)} aria-label="Delete">
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
                      No clients found.
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
                family={selectedClient}
                onSave={handleSave}
              />
            )}
            
            {activeModal === 'view' && selectedClient && (
              <ViewFamilyModal
                onClose={handleCloseModal}
                client={selectedClient}
                familyMembers={familyMembers.filter(m => m.clientId === selectedClient.id)}
                onAddMember={() => handleAddMember(selectedClient)}
                onEditMember={(m) => handleEditMember(m, selectedClient)}
                onDeleteMember={handleDeleteMember}
              />
            )}

            {activeModal === 'member-form' && selectedClient && (
              <FamilyMemberFormModal
                onClose={handleCloseModal}
                client={selectedClient}
                member={selectedMember}
                onSave={handleSaveMember}
              />
            )}

            {activeModal === 'delete' && selectedClient && (
              <div>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the record for <strong>{selectedClient.firstName} {selectedClient.lastName}</strong> and all associated family members.
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
