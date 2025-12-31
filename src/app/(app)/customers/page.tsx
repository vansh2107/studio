
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
import { Client, FamilyMember, User, DisplayClient } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getAllClients, familyMembers as mockFamilyMembers, users as mockUsers, getClientsForAssociate, getAssociatesForRM, getRMsForAdmin } from '@/lib/mock-data';
import Modal from '@/components/ui/Modal';
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';


type ActiveModal = 'form' | 'view' | 'member-form' | null;

export default function CustomersPage() {
  const { effectiveUser, impersonate } = useCurrentUser();
  const { toast } = useToast();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
  const [loading, setLoading] = useState(true);
  const [showOnlyHeads, setShowOnlyHeads] = useState(false);
  
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<DisplayClient | null>(null);
  
  const allDisplayClients: DisplayClient[] = useMemo(() => {
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
    
    const heads: DisplayClient[] = clientsToShow.map(c => ({ ...c, isFamilyHead: true, name: `${c.firstName} ${c.lastName}` }));
    
    const members: DisplayClient[] = familyMembers
        .filter(fm => clientsToShow.some(c => c.id === fm.clientId)) // only show members of visible clients
        .map(fm => {
          const clientHead = clientsToShow.find(c => c.id === fm.clientId);
          return {
            ...fm,
            name: `${fm.firstName} ${fm.lastName}`,
            role: 'CUSTOMER',
            associateId: clientHead?.associateId || '',
            avatarUrl: '', // members don't have avatars in this model
            isFamilyHead: false,
            email: fm.emailId,
            // Carry over necessary fields from head for display if needed
            phoneNumber: fm.phoneNumber || clientHead?.phoneNumber || '',
            dateOfBirth: fm.dateOfBirth || clientHead?.dateOfBirth || '',
          }
        });
        
    setLoading(false);
    return [...heads, ...members].sort((a,b) => a.lastName.localeCompare(b.lastName));
  }, [effectiveUser, familyMembers]);

  const filteredClients = useMemo(() => {
    if (showOnlyHeads) {
      return allDisplayClients.filter(c => c.isFamilyHead);
    }
    return allDisplayClients;
  }, [allDisplayClients, showOnlyHeads]);


  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedClient(null);
    setSelectedMember(null);
    setItemToDelete(null);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setActiveModal('form');
  };
  
  const handleView = (client: Client) => {
    setSelectedClient(client);
    setActiveModal('view');
  };
  
  const handleDeleteTrigger = (item: DisplayClient) => {
    setItemToDelete(item);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.isFamilyHead) {
       // This is a mock delete, in a real app you'd call an API
      // setClients(prev => prev.filter(f => f.id !== itemToDelete.id));
      setFamilyMembers(prev => prev.filter(fm => fm.clientId !== itemToDelete.id)); // Also remove members

      toast({
        title: 'Client Deleted',
        description: `The client "${itemToDelete.firstName} ${itemToDelete.lastName}" has been successfully deleted (mock).`,
      });
    } else {
      // It's a family member
      setFamilyMembers(prev => prev.filter(m => m.id !== itemToDelete.id));
      toast({ title: 'Success', description: 'Family member has been deleted.' });
    }


    setItemToDelete(null);
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
  
  const handleEditItem = (item: DisplayClient) => {
    if (item.isFamilyHead) {
        setSelectedClient(item as Client);
        setActiveModal('form');
    } else {
        const clientHead = allDisplayClients.find(c => c.isFamilyHead && c.id === (item as FamilyMember).clientId) as Client | undefined;
        if (clientHead) {
            setSelectedClient(clientHead);
            setSelectedMember(item as FamilyMember);
            setActiveModal('member-form');
        }
    }
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
      // It might be a full ISO string or just YYYY-MM-DD
      const date = parseISO(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd MMM yyyy');
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };
  
  const findCustomerUser = (client: DisplayClient): User | undefined => {
      // Can only impersonate family heads who are actual users
      if (!client.isFamilyHead) return undefined;
      return mockUsers.find(u => u.id === client.id);
  }

  // Deferring permissions check for now
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;
  const canView = true;
  const canImpersonateAny = true;


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Client Management</h1>
          {canCreate && (
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Family Head
            </Button>
          )}
        </div>
        
        <div className="flex justify-end items-center space-x-2 py-4">
            <Label htmlFor="show-heads-only">Show only Family Heads</Label>
            <Switch
                id="show-heads-only"
                checked={showOnlyHeads}
                onCheckedChange={setShowOnlyHeads}
            />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Role</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredClients.length > 0 ? (
                  filteredClients.map(client => {
                    const customerUser = findCustomerUser(client);
                    const isHead = client.isFamilyHead;
                    
                    const clientHead = isHead ? (client as Client) : allDisplayClients.find(c => c.isFamilyHead && c.id === (client as FamilyMember).clientId) as Client | undefined;
                    
                    if (!clientHead) return null; // Should not happen if data is consistent

                    return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.firstName}</TableCell>
                          <TableCell>{client.lastName}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isHead ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                {isHead ? 'Head' : (client as FamilyMember).relation}
                            </span>
                          </TableCell>
                          <TableCell>{client.phoneNumber}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{formatDate(client.dateOfBirth)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canView && clientHead && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleView(clientHead)} aria-label="View">
                                      <Eye className="h-4 w-4 hover:text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>View Family</p></TooltipContent>
                                </Tooltip>
                              )}
                              
                              {canUpdate && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditItem(client)} aria-label="Edit">
                                      <Edit className="h-4 w-4 hover:text-yellow-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Edit {isHead ? "Family Head" : "Member"}</p></TooltipContent>
                                </Tooltip>
                              )}

                              {customerUser && canImpersonateAny && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => impersonate(customerUser.id)} aria-label="Impersonate Client">
                                            <LogIn className="h-4 w-4 text-blue-500 hover:text-blue-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Impersonate Client</p></TooltipContent>
                                </Tooltip>
                              )}
                              
                               {canDelete && (
                                 <AlertDialog open={!!itemToDelete && itemToDelete.id === client.id} onOpenChange={(open) => !open && setItemToDelete(null)}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                           <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteTrigger(client)} aria-label="Delete">
                                              <Trash2 className="h-4 w-4" />
                                           </Button>
                                        </AlertDialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent><p>Delete {isHead ? "Family" : "Member"}</p></TooltipContent>
                                    </Tooltip>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the record for <strong>{client.firstName} {client.lastName}</strong>
                                                {isHead && " and all associated family members."}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
                onEditMember={(m) => handleEditItem(m)}
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
          </>
        </Modal>
      </div>
    </TooltipProvider>
  );
}
