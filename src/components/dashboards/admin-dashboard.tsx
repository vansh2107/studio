'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from 'lucide-react';
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
import { getMappedAssociatesForAdmin, getMappedCustomersForAssociate } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useMemo } from 'react';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const mappedAssociates = useMemo(() => getMappedAssociatesForAdmin(user.id), [user.id]);
  const mappedCustomers = useMemo(() => {
    return mappedAssociates.flatMap(associate => getMappedCustomersForAssociate(associate.id));
  }, [mappedAssociates]);

  const totalCounts = [
    { name: 'Associates', count: mappedAssociates.length, fill: 'hsl(var(--chart-2))' },
    { name: 'Customers', count: mappedCustomers.length, fill: 'hsl(var(--chart-3))' },
  ];

  const chartConfig = {
    count: { label: 'Count' },
    Associates: { label: 'Associates', color: 'hsl(var(--chart-2))' },
    Customers: { label: 'Customers', color: 'hsl(var(--chart-3))' },
  };

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
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
