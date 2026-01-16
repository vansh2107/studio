
'use client';

import { getClientsForAssociate, getAllRMs } from '@/lib/mock-data';
import type { User, Task } from '@/lib/types';
import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { StatCard } from '../ui/stat-card';
import { Users, ClipboardList } from 'lucide-react';
import { TaskSummaryCard } from './task-summary-card';

interface AssociateDashboardProps {
  user: User;
}

export default function AssociateDashboard({ user }: AssociateDashboardProps) {
  const { tasks } = useTasks();
  const allRms = useMemo(() => getAllRMs(), []);
  const mappedClients = useMemo(() => user.role === 'ASSOCIATE' ? getClientsForAssociate(user.id) : [], [user]);

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    
    return tasks.filter(task => {
        const serviceableRm = allRms.find(rm => rm.name === task.serviceableRM);

        return (
            task.associateId === user.id ||
            (serviceableRm && serviceableRm.id === user.id) ||
            task.clientId === user.id ||
            task.familyHeadId === user.id
        );
    });
  }, [tasks, user, allRms]);


  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Associate Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Mapped Clients" value={mappedClients.length} href="/customers" icon={Users} />
        <StatCard label="Tasks" value={filteredTasks.length} href="/tasks" icon={ClipboardList} />
      </div>
      <TaskSummaryCard allTasks={filteredTasks} />
    </>
  );
}
