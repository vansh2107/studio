
'use client';

import { Users, Briefcase, UserSquare } from 'lucide-react';
import { getRMsForAdmin, getAssociatesForRM, getClientsForAssociate, getAllRMs, getAllAdmins } from '@/lib/mock-data';
import type { User, Task } from '@/lib/types';
import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { StatCard } from '@/components/ui/stat-card';
import { TaskSummaryCard } from './task-summary-card';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { tasks } = useTasks();
  const allRms = useMemo(() => getAllRMs(), []);
    
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

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'SUPER_ADMIN') { // Should not happen here, but for safety
        return tasks;
    }

    return tasks.filter(task => {
        const serviceableRm = allRms.find(rm => rm.name === task.serviceableRM);

        return (
            task.adminId === user.id ||
            task.rmId === user.id ||
            task.associateId === user.id ||
            (serviceableRm && serviceableRm.id === user.id) ||
            task.clientId === user.id ||
            task.familyHeadId === user.id
        );
    });
  }, [tasks, user, allRms]);


  if (user.role === 'RM') {
      return (
          <>
            <h1 className="text-3xl font-bold font-headline">RM Dashboard</h1>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Total Associates" value={mappedAssociates.length} href="/associates" icon={Briefcase} />
                <StatCard label="Total Clients" value={mappedClients.length} href="/customers" icon={Users} />
                <StatCard label="Total Tasks" value={filteredTasks.length} href="/tasks" icon={UserSquare} />
             </div>
             <TaskSummaryCard allTasks={filteredTasks} />
          </>
      )
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Mapped RMs" value={mappedRMs.length} href="/rms" icon={UserSquare} />
        <StatCard label="Mapped Associates" value={mappedAssociates.length} href="/associates" icon={Briefcase} />
        <StatCard label="Total Mapped Clients" value={mappedClients.length} href="/customers" icon={Users} />
      </div>
      <TaskSummaryCard allTasks={filteredTasks} />
    </>
  );
}
