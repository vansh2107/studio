
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, FileText, ClipboardList } from 'lucide-react';
import { getRMsForAdmin, getAssociatesForRM, getClientsForAssociate } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useMemo, useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { isPast, parseISO } from 'date-fns';
import TaskOverview from './task-overview';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { tasks } = useTasks();
    
  const { mappedRMs, mappedAssociates, mappedCustomers } = useMemo(() => {
    if (user.role === 'ADMIN') {
        const rms = getRMsForAdmin(user.id);
        const associates = rms.flatMap(rm => getAssociatesForRM(rm.id));
        const customers = associates.flatMap(assoc => getClientsForAssociate(assoc.id));
        return { mappedRMs: rms, mappedAssociates: associates, mappedCustomers: customers };
    }
     if (user.role === 'RM') {
        const associates = getAssociatesForRM(user.id);
        const customers = associates.flatMap(assoc => getClientsForAssociate(assoc.id));
        return { mappedRMs: [], mappedAssociates: associates, mappedCustomers: customers };
    }
    return { mappedRMs: [], mappedAssociates: [], mappedCustomers: [] };
  }, [user]);

  const totalFamilies = mappedCustomers.length;

  const relevantTasks = useMemo(() => {
    if (!user) return [];
    switch (user.role) {
      case 'ADMIN':
        const adminAssociateNames = mappedAssociates.map(a => a.name);
        return tasks.filter(task => adminAssociateNames.includes(task.clientName.split('(')[0].trim()));
      case 'RM':
        const rmAssociateNames = mappedAssociates.map(a => a.name);
        return tasks.filter(task => rmAssociateNames.includes(task.clientName.split('(')[0].trim()));
      default:
        return [];
    }
  }, [tasks, user, mappedAssociates]);


  if (user.role === 'RM') {
      return (
          <>
            <h1 className="text-3xl font-bold font-headline">RM Dashboard</h1>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-[10px] border-primary border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Associates</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mappedAssociates.length}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[10px] border-primary border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mappedCustomers.length}</div>
                  </CardContent>
                </Card>
                 <Card className="rounded-[10px] border-primary border-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Families</CardTitle>
                     <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalFamilies}</div>
                  </CardContent>
                </Card>
             </div>
             <TaskOverview tasks={relevantTasks} />
          </>
      )
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped RMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedRMs.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped Associates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedAssociates.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mapped Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedCustomers.length}</div>
          </CardContent>
        </Card>
      </div>
      <TaskOverview tasks={relevantTasks} />
    </>
  );
}
