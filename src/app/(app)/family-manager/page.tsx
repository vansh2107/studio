'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getFamilyMembersForCustomer, getAssetsForCustomer, FamilyMember } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2, User as UserIcon, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

function MemberEditor({ member, customerId, onSave, children }: { member?: FamilyMember, customerId: string, onSave: (data: FamilyMember) => void, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member?.name || '');
  const [relation, setRelation] = useState(member?.relation || '');

  const handleSave = () => {
    if (!name || !relation) return;
    const newMemberData: FamilyMember = {
      id: member?.id || `fm-${Date.now()}`,
      customerId,
      name,
      relation,
    };
    onSave(newMemberData);
    setOpen(false);
    setName('');
    setRelation('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Family Member' : 'Add New Member'}</DialogTitle>
          <DialogDescription>
            {member ? 'Update the details for this family member.' : 'Add a new member to your family account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relation" className="text-right">Relation</Label>
            <Input id="relation" value={relation} onChange={e => setRelation(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FamilyManagerPage() {
  const { effectiveUser } = useCurrentUser();
  const { toast } = useToast();

  const [familyMembers, setFamilyMembers] = useState(
    effectiveUser ? getFamilyMembersForCustomer(effectiveUser.id) : []
  );

  const assets = useMemo(() => effectiveUser ? getAssetsForCustomer(effectiveUser.id) : [], [effectiveUser]);

  if (effectiveUser?.role !== 'CUSTOMER') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is only available for customer accounts.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveMember = (member: FamilyMember) => {
    setFamilyMembers(prev => {
      const existing = prev.find(m => m.id === member.id);
      if (existing) {
        return prev.map(m => m.id === member.id ? member : m);
      }
      return [...prev, member];
    });
    toast({ title: 'Success', description: `Family member "${member.name}" has been saved.` });
  };

  const handleDeleteMember = (memberId: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    toast({ title: 'Success', description: 'Family member has been deleted.' });
  };
  
  const memberHasAssets = (memberId: string) => assets.some(a => a.ownerMemberId === memberId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Family Manager</h1>
          <p className="text-muted-foreground">Manage members of your family account.</p>
        </div>
        <MemberEditor customerId={effectiveUser.id} onSave={handleSaveMember}>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
        </MemberEditor>
      </div>
      <Card>
        <CardContent className="p-0">
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
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{member.name}</span>
                      {memberHasAssets(member.id) && <ShieldAlert className="h-4 w-4 text-amber-500" title="This member has assets assigned."/>}
                    </div>
                  </TableCell>
                  <TableCell>{member.relation}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <MemberEditor member={member} customerId={effectiveUser.id} onSave={handleSaveMember}>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </MemberEditor>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{member.name}</strong> from your family account.
                              {memberHasAssets(member.id) && <div className="mt-2 p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2"><ShieldAlert className="h-5 w-5 mt-0.5" /><span>This member has assets assigned to them. Deleting them may cause data inconsistencies.</span></div>}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteMember(member.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
