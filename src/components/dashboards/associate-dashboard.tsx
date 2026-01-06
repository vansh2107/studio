
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientsForAssociate, getAssetsForClient } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import TaskOverview from './task-overview';
import { StatCard } from '../ui/stat-card';
import { Users, ClipboardList } from 'lucide-react';

interface AssociateDashboardProps {
  user: User;
}

export default function AssociateDashboard({ user }: AssociateDashboardProps) {
  const { tasks } = useTasks();
  const mappedClients = useMemo(() => user.role === 'ASSOCIATE' ? getClientsForAssociate(user.id) : [], [user]);
  
  const relevantTasks = useMemo(() => {
    if (!user || user.role !== 'ASSOCIATE') return [];
    const customerNames = mappedClients.map(c => c.name);
    return tasks.filter(task => customerNames.some(name => task.clientName.includes(name)));
  }, [tasks, user, mappedClients]);

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Associate Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Mapped Clients" value={mappedClients.length} href="/customers" icon={Users} />
        <StatCard label="Tasks" value={relevantTasks.length} href="/tasks" icon={ClipboardList} />
      </div>
      <TaskOverview tasks={relevantTasks} />
    </>
  );
}
