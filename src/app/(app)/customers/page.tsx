'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FamilyFormModal } from '@/components/customers/family-form-modal';
import { ViewFamilyModal } from '@/components/customers/view-family-modal';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Family } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user';
import { families as mockFamilies } from '@/lib/mock-data';

export default function CustomersPage() {
  const { hasPermission } = useCurrentUser();
  const { toast } = useToast();
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setFamilies(mockFamilies);
      setLoadingFamilies(false);
    }, 500);
  }, []);


  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);


  const handleAddNew = () => {
    setSelectedFamily(null);
    setModalOpen(true);
  };

  const handleEdit = (family: Family) => {
    setSelectedFamily(family);
    setModalOpen(true);
  };

  const handleView = (family: Family) => {
    setSelectedFamily(family);
    setViewModalOpen(true);
  };

  const openDeleteDialog = (family: Family) => {
    setFamilyToDelete(family);
    setDeleteDialogOpen(true);
  }

  const handleDelete = () => {
    if (!familyToDelete) return;
    
    setFamilies(prev => prev.filter(f => f.id !== familyToDelete.id));

    toast({
      title: 'Family Deleted',
      description: `The family "${familyToDelete.familyName}" has been successfully deleted.`,
    });
    setDeleteDialogOpen(false);
    setFamilyToDelete(null);
  };

  const handleSave = (savedFamily: Family) => {
    setFamilies(prev => {
      const exists = prev.some(f => f.id === savedFamily.id);
      if (exists) {
        return prev.map(f => f.id === savedFamily.id ? savedFamily : f);
      }
      return [...prev, savedFamily];
    });
  }

  const canCreate = hasPermission('CUSTOMER', 'create');
  const canUpdate = hasPermission('CUSTOMER', 'update');
  const canDelete = hasPermission('CUSTOMER', 'delete');
  const canView = hasPermission('CUSTOMER', 'view');

  return (
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
                <TableHead>Family Name</TableHead>
                <TableHead>Family Head</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email ID</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingFamilies ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : families && families.length > 0 ? (
                families.map(family => (
                  <TableRow key={family.id}>
                    <TableCell className="font-medium">
                      {family.familyName}
                    </TableCell>
                    <TableCell>{family.familyHeadName}</TableCell>
                    <TableCell>{family.phoneNumber}</TableCell>
                    <TableCell>{family.emailId}</TableCell>
                    <TableCell>
                      {family.dateOfBirth
                        ? new Date(family.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canView && (
                            <DropdownMenuItem onClick={() => handleView(family)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => handleEdit(family)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onSelect={(e) => { e.preventDefault(); openDeleteDialog(family)}}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will
                permanently delete the family record for{' '}
                <strong>{familyToDelete?.familyName}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <FamilyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        family={selectedFamily}
        onSave={handleSave}
      />

      {selectedFamily && (
        <ViewFamilyModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          family={selectedFamily}
        />
      )}
    </div>
  );
}
