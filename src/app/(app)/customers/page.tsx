
'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FamilyFormModal } from '@/components/customers/family-form-modal';
import { ViewFamilyModal } from '@/components/customers/view-family-modal';
import { ViewFamilyMemberModal } from '@/components/customers/view-family-member-modal';
import { FamilyMemberFormModal } from '@/components/customers/family-member-form-modal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Client, FamilyMember, User, DisplayClient } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getAllClients, familyMembers as mockFamilyMembers, users as mockUsers, getClientsForAssociate, getAssociatesForRM, getRMsForAdmin, associates as allAssociates, relationshipManagers as allRMs } from '@/lib/mock-data';
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
import { Input } from '@/components/ui/input';


type ActiveModal = 'form' | 'view-family' | 'view-member' | 'member-form' | null;

export default function ClientsPage() {
  const { effectiveUser, impersonate, hasPermission } = useCurrentUser();
  const { toast } = useToast();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
  const [loading, setLoading] = useState(true);
  const [showOnlyHeads, setShowOnlyHeads] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<DisplayClient | null>(null);
  
  const [columnFilters, setColumnFilters] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    rmName: '',
  });

  const handleColumnFilterChange = (key: keyof typeof columnFilters, value: string) => {
    setColumnFilters(prev => ({...prev, [key]: value}));
  };

  const getRmForClient = useCallback((client: DisplayClient) => {
    const associate = allAssociates.find(a => a.id === client.associateId);
    if (!associate) return null;
    const rm = allRMs.find(r => r.id === associate.rmId);
    return rm;
  }, []);
  
  const formatDate = useCallback((dateString?: string) => {
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
  }, []);

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
            isFamilyHead: false,
            email: fm.emailId,
            // Carry over necessary fields from head for display if needed
            phoneNumber: fm.phoneNumber || clientHead?.phoneNumber || '',
            dateOfBirth: fm.dateOfBirth || clientHead?.dateOfBirth || '',
          }
        });
        
    setLoading(false);

    const unsortedClients = [...heads, ...members];

    const rolePriority = ["Head", "Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister"];
    const getRolePriority = (item: DisplayClient) => {
      if (item.isFamilyHead) return -1;
      const relation = (item as FamilyMember).relation;
      const index = rolePriority.indexOf(relation);
      return index === -1 ? rolePriority.length : index;
    };
    
    return unsortedClients.sort((a, b) => {
        const rmA = getRmForClient(a);
        const rmB = getRmForClient(b);

        // Primary sort: by RM name. Unassigned RMs go to the bottom.
        if (rmA && !rmB) return -1;
        if (!rmA && rmB) return 1;
        if (rmA && rmB && rmA.name !== rmB.name) {
            return rmA.name.localeCompare(rmB.name);
        }

        // Secondary sort: by family head.
        const headAId = a.isFamilyHead ? a.id : (a as FamilyMember).clientId;
        const headBId = b.isFamilyHead ? b.id : (b as FamilyMember).clientId;

        if (headAId !== headBId) {
            const headA = heads.find(h => h.id === headAId);
            const headB = heads.find(h => h.id === headBId);
            return (headA?.name || '').localeCompare(headB?.name || '');
        }

        // Tertiary sort: by role within the family.
        return getRolePriority(a) - getRolePriority(b);
    });

  }, [effectiveUser, familyMembers, getRmForClient]);

  const filteredClients = useMemo(() => {
    let clientsToFilter = allDisplayClients;

    if (searchTerm) {
        clientsToFilter = clientsToFilter.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    clientsToFilter = clientsToFilter.filter(client => {
      const rm = getRmForClient(client);
      const clientRole = client.isFamilyHead ? 'Head' : (client as FamilyMember).relation;
      
      const firstNameMatch = client.firstName.toLowerCase().includes(columnFilters.firstName.toLowerCase());
      const lastNameMatch = client.lastName.toLowerCase().includes(columnFilters.lastName.toLowerCase());
      const roleMatch = clientRole.toLowerCase().includes(columnFilters.role.toLowerCase());
      const phoneMatch = client.phoneNumber.toLowerCase().includes(columnFilters.phoneNumber.toLowerCase());
      const emailMatch = client.email.toLowerCase().includes(columnFilters.email.toLowerCase());
      const dobMatch = formatDate(client.dateOfBirth).toLowerCase().includes(columnFilters.dateOfBirth.toLowerCase());
      const rmMatch = (rm?.name || 'Not Assigned').toLowerCase().includes(columnFilters.rmName.toLowerCase());

      return firstNameMatch && lastNameMatch && roleMatch && phoneMatch && emailMatch && dobMatch && rmMatch;
    });

    if (showOnlyHeads) {
      return clientsToFilter.filter(c => c.isFamilyHead);
    }
    
    return clientsToFilter;
  }, [allDisplayClients, showOnlyHeads, searchTerm, columnFilters, getRmForClient, formatDate]);


  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedClient(null);
    setSelectedMember(null);
    setItemToDelete(null);
  };

  const handleAddNew = () => {
    if (!hasPermission('CUSTOMER_ACTIONS', 'create')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to perform this action.', variant: 'destructive' });
        return;
    }
    setSelectedClient(null);
    setActiveModal('form');
  };
  
  const handleView = (item: DisplayClient) => {
    if (item.isFamilyHead) {
        setSelectedClient(item as Client);
        setActiveModal('view-family');
    } else {
        setSelectedMember(item as FamilyMember);
        setActiveModal('view-member');
    }
  };
  
  const handleDeleteTrigger = (item: DisplayClient) => {
    if (!hasPermission('CUSTOMER_ACTIONS', 'delete')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to perform this action.', variant: 'destructive' });
        return;
    }
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
    if (!hasPermission('CUSTOMER_ACTIONS', 'edit')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to perform this action.', variant: 'destructive' });
        return;
    }
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
  
  const findCustomerUser = (client: DisplayClient): User | undefined => {
      // Can only impersonate family heads who are actual users
      if (!client.isFamilyHead) return undefined;
      return mockUsers.find(u => u.id === client.id);
  }

  const canCreate = hasPermission('CUSTOMER_ACTIONS', 'create');
  const canUpdate = hasPermission('CUSTOMER_ACTIONS', 'edit');
  const canDelete = hasPermission('CUSTOMER_ACTIONS', 'delete');
  const canView = hasPermission('CUSTOMER', 'view');
  const canImpersonateCustomer = hasPermission('CUSTOMER_ACTIONS', 'view'); // Using 'view' for impersonation rights


  if (!canView) {
      return (
        <Card>
            <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
            <CardContent><p>You do not have permission to view this page.</p></CardContent>
        </Card>
      );
  }


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-headline">Client Management</h1>
            <p className="text-muted-foreground">Manage your family accounts and their members.</p>
          </div>
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Family Head
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center py-4">
            <div className="w-full max-w-sm">
                <Input 
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="show-heads-only">Show only Family Heads</Label>
                <Switch
                    id="show-heads-only"
                    checked={showOnlyHeads}
                    onCheckedChange={setShowOnlyHeads}
                />
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>First Name</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.firstName}
                        onChange={(e) => handleColumnFilterChange('firstName', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>Last Name</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.lastName}
                        onChange={(e) => handleColumnFilterChange('lastName', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>Role</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.role}
                        onChange={(e) => handleColumnFilterChange('role', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>Phone Number</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.phoneNumber}
                        onChange={(e) => handleColumnFilterChange('phoneNumber', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>Email ID</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.email}
                        onChange={(e) => handleColumnFilterChange('email', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>Date of Birth</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.dateOfBirth}
                        onChange={(e) => handleColumnFilterChange('dateOfBirth', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-col gap-1">
                      <span>Assigned RM</span>
                      <Input
                        placeholder="Search..."
                        value={columnFilters.rmName}
                        onChange={(e) => handleColumnFilterChange('rmName', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TableHead>
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
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredClients.length > 0 ? (
                  filteredClients.map(client => {
                    const customerUser = findCustomerUser(client);
                    const isHead = client.isFamilyHead;
                    const rm = getRmForClient(client);
                    
                    const clientHead = isHead ? (client as Client) : allDisplayClients.find(c => c.isFamilyHead && c.id === (client as FamilyMember).clientId) as Client | undefined;
                    
                    if (!clientHead) return null; // Should not happen if data is consistent

                    return (
                        <TableRow key={client.id} className="hover:bg-transparent">
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
                          <TableCell>{rm?.name || 'Not Assigned'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canView && clientHead && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleView(client)} aria-label="View">
                                      <Eye className="h-4 w-4 hover:text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>View Details</p></TooltipContent>
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

                              {customerUser && impersonate && canImpersonateCustomer && (
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
                    <TableCell colSpan={8} className="h-24 text-center">
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {activeModal === 'form' && (
          <FamilyFormModal
            isOpen={activeModal === 'form'}
            onClose={handleCloseModal}
            family={selectedClient}
            onSave={handleSave}
          />
        )}
        
        {activeModal === 'view-family' && selectedClient && (
          <ViewFamilyModal
            isOpen={activeModal === 'view-family'}
            onClose={handleCloseModal}
            client={selectedClient}
            familyMembers={familyMembers.filter(m => m.clientId === selectedClient.id)}
            onAddMember={() => handleAddMember(selectedClient)}
            onEditMember={(m) => handleEditItem(m)}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeModal === 'view-member' && selectedMember && (
          <ViewFamilyMemberModal
            isOpen={activeModal === 'view-member'}
            onClose={handleCloseModal}
            member={selectedMember}
          />
        )}

        {activeModal === 'member-form' && selectedClient && (
          <FamilyMemberFormModal
            isOpen={activeModal === 'member-form'}
            onClose={handleCloseModal}
            client={selectedClient}
            member={selectedMember}
            onSave={handleSaveMember}
          />
        )}
        
      </div>
    </TooltipProvider>
  );
}
