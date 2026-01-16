
'use client';
import { useMemo, useState } from 'react';
import { Users, Briefcase, ShieldCheck, UserSquare } from 'lucide-react';
import { getAllAdmins, getAllRMs, getAllAssociates, getAllClients } from '@/lib/mock-data';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTasks } from '@/hooks/use-tasks';
import { StatCard } from '@/components/ui/stat-card';
import { TaskSummaryCard } from './task-summary-card';


const admins = getAllAdmins();
const rms = getAllRMs();
const associates = getAllAssociates();
const clients = getAllClients();

export default function SuperAdminDashboard() {
  const { effectiveUser } = useCurrentUser();
  const { tasks } = useTasks();
  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Super Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Admins" value={admins.length} href="/admins" icon={ShieldCheck} />
        <StatCard label="Total RMs" value={rms.length} href="/rms" icon={UserSquare} />
        <StatCard label="Total Associates" value={associates.length} href="/associates" icon={Briefcase} />
        <StatCard label="Total Clients" value={clients.length} href="/customers" icon={Users} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {effectiveUser?.role === 'SUPER_ADMIN' && <TaskSummaryCard allTasks={tasks} />}
      </div>
    </>
  );
}
