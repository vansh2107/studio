'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getMappedCustomersForAssociate, getAssetsForCustomer } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { useMemo } from 'react';

interface AssociateDashboardProps {
  user: User;
}

export default function AssociateDashboard({ user }: AssociateDashboardProps) {
  const mappedCustomers = useMemo(() => getMappedCustomersForAssociate(user.id), [user.id]);
  
  const customerAssets = useMemo(() => {
    return mappedCustomers.map(customer => ({
      name: customer.name,
      totalValue: getAssetsForCustomer(customer.id).reduce((acc, asset) => acc + asset.value, 0)
    }));
  }, [mappedCustomers]);

  const chartConfig = {
    totalValue: {
      label: 'Total Assets',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Associate Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mappedCustomers.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Customer Asset Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <RechartsBarChart data={customerAssets} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.split(' ')[0]} // Show first name
                />
                <YAxis 
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="totalValue" fill="var(--color-totalValue)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
