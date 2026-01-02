
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, PieChart, Users, Briefcase, FileText, ClipboardList } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  Cell,
} from 'recharts';
import { getRMsForAdmin, getAssociatesForRM, getClientsForAssociate, getFamilyMembersForClient } from '@/lib/mock-data';
import type { User, Client, Task } from '@/lib/types';
import { useMemo } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { parseISO, isPast } from 'date-fns';

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

  const { relevantTasks, taskAnalytics } = useMemo(() => {
    if (user.role !== 'RM') return { relevantTasks: [], taskAnalytics: null };

    const rmTasks = tasks.filter(task => task.rmName === user.name);

    const analytics = {
        total: rmTasks.length,
        pending: rmTasks.filter(t => t.status === 'Pending').length,
        inProgress: rmTasks.filter(t => t.status === 'In Progress').length,
        completed: rmTasks.filter(t => t.status === 'Completed').length,
        cancelled: rmTasks.filter(t => t.status === 'Cancelled').length,
        rejected: rmTasks.filter(t => t.status === 'Rejected').length,
        overdue: rmTasks.filter(t => t.status === 'In Progress' && isPast(parseISO(t.dueDate))).length,
    };
    
    return { relevantTasks: rmTasks, taskAnalytics: analytics };
  }, [tasks, user]);


  const totalCounts = user.role === 'ADMIN' ? [
    { name: 'RMs', count: mappedRMs.length, fill: 'hsl(var(--chart-1))' },
    { name: 'Associates', count: mappedAssociates.length, fill: 'hsl(var(--chart-2))' },
    { name: 'Customers', count: mappedCustomers.length, fill: 'hsl(var(--chart-3))' },
  ] : [
    { name: 'Associates', count: mappedAssociates.length, fill: 'hsl(var(--chart-2))' },
    { name: 'Customers', count: mappedCustomers.length, fill: 'hsl(var(--chart-3))' },
    { name: 'Families', count: totalFamilies, fill: 'hsl(var(--chart-4))' },
  ];
  
  const pieChartData = user.role === 'RM' ? [
      { name: 'Associates', count: mappedAssociates.length, fill: 'hsl(var(--chart-2))' },
      { name: 'Customers', count: mappedCustomers.length, fill: 'hsl(var(--chart-3))' },
  ] : totalCounts;


  const chartConfig = {
    count: { label: 'Count' },
    RMs: { label: 'RMs', color: 'hsl(var(--chart-1))' },
    Associates: { label: 'Associates', color: 'hsl(var(--chart-2))' },
    Customers: { label: 'Customers', color: 'hsl(var(--chart-3))' },
    Families: { label: 'Families', color: 'hsl(var(--chart-4))' },
  };

  if (user.role === 'RM') {
      return (
          <>
            <h1 className="text-3xl font-bold font-headline">RM Dashboard</h1>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Associates</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mappedAssociates.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mappedCustomers.length}</div>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Families</CardTitle>
                     <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalFamilies}</div>
                  </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taskAnalytics?.total}</div>
                        {taskAnalytics && (
                             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                                <span>Pending: {taskAnalytics.pending}</span>
                                <span>In Progress: {taskAnalytics.inProgress}</span>
                                <span className="text-destructive">Overdue: {taskAnalytics.overdue}</span>
                                <span>Completed: {taskAnalytics.completed}</span>
                                <span>Cancelled: {taskAnalytics.cancelled}</span>
                                <span>Rejected: {taskAnalytics.rejected}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
             </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    User Counts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <RechartsBarChart data={totalCounts} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="count" radius={4}>
                        {totalCounts.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                        </Bar>
                    </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={pieChartData} dataKey="count" nameKey="name" innerRadius={60}>
                        {pieChartData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </RechartsPieChart>
                    </ChartContainer>
                </CardContent>
                </Card>
            </div>
          </>
      )
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped RMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedRMs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped Associates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedAssociates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mapped Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedCustomers.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Mapped User Counts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <RechartsBarChart data={totalCounts} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" radius={4}>
                  {totalCounts.map((entry) => (
                     <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Mapped User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={totalCounts} dataKey="count" nameKey="name" innerRadius={60}>
                   {totalCounts.map((entry) => (
                     <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
