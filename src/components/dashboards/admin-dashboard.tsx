
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, FileText, ClipboardList, UserSquare } from 'lucide-react';
import { getRMsForAdmin, getAssociatesForRM, getClientsForAssociate } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useMemo, useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { isPast, parseISO } from 'date-fns';
import TaskOverview from './task-overview';
import { StatCard } from '@/components/ui/stat-card';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { tasks } = useTasks();
    
  const { mappedRMs, mappedAssociates, mappedClients } = useMemo(() => {
    if (user.role === 'ADMIN') {
        const rms = getRMsForAdmin(user.id);
        const associates = rms.flatMap(rm => getAssociatesForRM(rm.id));
        const customers = associates.flatMap(assoc => getClientsForAssociate(assoc.id));
        return { mappedRMs: rms, mappedAssociates: associates, mappedClients: customers };
    }
     if (user.role === 'RM') {
        const associates = getAssociatesForRM(user.id);
        const customers = associates.flatMap(assoc => getClientsForAssociate(assoc.id));
        return { mappedRMs: [], mappedAssociates: associates, mappedClients: customers };
    }
    return { mappedRMs: [], mappedAssociates: [], mappedClients: [] };
  }, [user]);

  const totalFamilies = mappedClients.length;

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
                <StatCard label="Total Associates" value={mappedAssociates.length} href="/associates" icon={Briefcase} />
                <StatCard label="Total Clients" value={mappedClients.length} href="/clients" icon={Users} />
                <StatCard label="Total Tasks" value={relevantTasks.length} href="/tasks" icon={ClipboardList} />
             </div>
             <TaskOverview tasks={relevantTasks} />
          </>
      )
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Mapped RMs" value={mappedRMs.length} href="/rms" icon={UserSquare} />
        <StatCard label="Mapped Associates" value={mappedAssociates.length} href="/associates" icon={Briefcase} />
        <StatCard label="Total Mapped Clients" value={mappedClients.length} href="/clients" icon={Users} />
      </div>
      <TaskOverview tasks={relevantTasks} />
    </>
  );
}
