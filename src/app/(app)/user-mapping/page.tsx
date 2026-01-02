
'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  superAdmins,
  getAdminsForSuperAdmin,
  getRMsForAdmin,
  getAssociatesForRM,
  getClientsForAssociate,
  getFamilyMembersForClient,
  users as allUsers,
  familyMembers as allFamilyMembers
} from '@/lib/mock-data';
import { User, Admin, RelationshipManager, Associate, Client, SuperAdmin } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Plus } from 'lucide-react';
import React from 'react';

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('') || '';

const UserCard = ({ user }: { user: User }) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{user.name}</p>
        <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
      </div>
    </div>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </div>
);

const CustomerNode = ({ client }: { client: Client }) => {
    const familyMembers = getFamilyMembersForClient(client.id);
    return (
        <Accordion type="single" collapsible className="w-full pl-4">
            <AccordionItem value={client.id}>
                 <AccordionTrigger className="hover:no-underline flex-1">
                    <UserCard user={client} />
                </AccordionTrigger>
                <AccordionContent>
                    <div className="pl-6 border-l ml-4">
                        {familyMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between w-full py-2">
                                <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                                    <Badge variant="outline">{member.relation}</Badge>
                                </div>
                                </div>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        ))}
                         {familyMembers.length === 0 && <p className="text-xs text-muted-foreground py-2">No family members.</p>}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

const AssociateNode = ({ associate }: { associate: Associate }) => {
    const clients = getClientsForAssociate(associate.id);
    return (
         <Accordion type="single" collapsible className="w-full pl-4">
            <AccordionItem value={associate.id}>
                 <AccordionTrigger className="hover:no-underline flex-1">
                    <UserCard user={associate} />
                </AccordionTrigger>
                <AccordionContent>
                     <div className="pl-6 border-l ml-4">
                        {clients.map(client => <CustomerNode key={client.id} client={client} />)}
                        {clients.length === 0 && <p className="text-xs text-muted-foreground py-2">No customers mapped.</p>}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

const RMNode = ({ rm }: { rm: RelationshipManager }) => {
    const associates = getAssociatesForRM(rm.id);
    return (
        <Accordion type="single" collapsible className="w-full pl-4">
            <AccordionItem value={rm.id}>
                <AccordionTrigger className="hover:no-underline flex-1">
                    <UserCard user={rm} />
                </AccordionTrigger>
                <AccordionContent>
                     <div className="pl-6 border-l ml-4">
                        {associates.map(associate => <AssociateNode key={associate.id} associate={associate} />)}
                         {associates.length === 0 && <p className="text-xs text-muted-foreground py-2">No associates mapped.</p>}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

const AdminNode = ({ admin }: { admin: Admin }) => {
    const rms = getRMsForAdmin(admin.id);
    return (
         <Accordion type="single" collapsible className="w-full pl-4">
            <AccordionItem value={admin.id}>
                 <AccordionTrigger className="hover:no-underline flex-1">
                    <UserCard user={admin} />
                </AccordionTrigger>
                <AccordionContent>
                    <div className="pl-6 border-l ml-4">
                        {rms.map(rm => <RMNode key={rm.id} rm={rm} />)}
                        {rms.length === 0 && <p className="text-xs text-muted-foreground py-2">No RMs mapped.</p>}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

const SuperAdminNode = ({ superAdmin }: { superAdmin: SuperAdmin }) => {
    const admins = getAdminsForSuperAdmin(superAdmin.id);
    return (
        <Card>
            <CardHeader>
                <UserCard user={superAdmin} />
            </CardHeader>
            <CardContent className="pl-6 border-l ml-6">
                {admins.map(admin => <AdminNode key={admin.id} admin={admin} />)}
                {admins.length === 0 && <p className="text-sm text-muted-foreground py-2">No admins mapped.</p>}
            </CardContent>
        </Card>
    )
};


export default function UserMappingPage() {
  const { hasPermission } = useCurrentUser();

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

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">User Mapping</h1>
            <p className="text-muted-foreground">Manage the hierarchy of users in the system.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4"/> Add Mapping</Button>
      </div>

      <div className="space-y-4">
        {superAdmins.map(sa => <SuperAdminNode key={sa.id} superAdmin={sa} />)}
      </div>
    </div>
  );
}
