
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientsForAssociate, getAssetsForClient } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import TaskOverview from './task-overview';

interface AssociateDashboardProps {
  user: User;
}

export default function AssociateDashboard({ user }: AssociateDashboardProps) {
  const { tasks } = useTasks();
  const mappedCustomers = useMemo(() => user.role === 'ASSOCIATE' ? getClientsForAssociate(user.id) : [], [user]);
  
  const relevantTasks = useMemo(() => {
    if (!user || user.role !== 'ASSOCIATE') return [];
    const customerNames = mappedCustomers.map(c => c.name);
    return tasks.filter(task => customerNames.some(name => task.clientName.includes(name)));
  }, [tasks, user, mappedCustomers]);

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Associate Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped Clients</CardTitle>
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
