
'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreateUserForm } from '@/components/users/create-user-form';
import { users } from '@/lib/mock-data';

export default function UserMappingPage() {
  const { hasPermission } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hasPermission('SUPER_ADMIN', 'view')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  const handleUserCreated = () => {
    // In a real app, you might refresh data here.
    // For the prototype, the mock-data is updated in-memory.
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">User Management</h1>
          <p className="text-muted-foreground">
            Create new users and assign their roles and hierarchy.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New User
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a New User</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new user to the system.
              The hierarchy will be assigned based on the selected role.
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm onUserCreated={handleUserCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
