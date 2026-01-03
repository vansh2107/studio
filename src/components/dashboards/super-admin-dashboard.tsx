
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BarChart, PieChart, ClipboardList, Eye } from 'lucide-react';
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
  Tooltip,
} from 'recharts';
import { getAllAdmins, getAllRMs, getAllAssociates, getAllClients } from '@/lib/mock-data';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTasks, Task, TaskStatus } from '@/hooks/use-tasks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const admins = getAllAdmins();
const rms = getAllRMs();
const associates = getAllAssociates();
const clients = getAllClients();

const totalCounts = [
  { name: 'Admins', count: admins.length, fill: 'hsl(var(--chart-1))' },
  { name: 'RMs', count: rms.length, fill: 'hsl(var(--chart-4))' },
  { name: 'Associates', count: associates.length, fill: 'hsl(var(--chart-2))' },
  { name: 'Clients', count: clients.length, fill: 'hsl(var(--chart-3))' },
];

const chartConfig = {
  count: {
    label: 'Count',
  },
  Admins: {
    label: 'Admins',
    color: 'hsl(var(--chart-1))',
  },
  RMs: {
    label: 'RMs',
    color: 'hsl(var(--chart-4))',
  },
  Associates: {
    label: 'Associates',
    color: 'hsl(var(--chart-2))',
  },
  Clients: {
    label: 'Clients',
    color: 'hsl(var(--chart-3))',
  },
};

const TaskSummaryCard = () => {
    const { tasks, updateTask } = useTasks();
    const { hasPermission } = useCurrentUser();
    const { toast } = useToast();

    const canUpdate = hasPermission('TASK', 'edit');

    const taskAnalytics = useMemo(() => {
        const allTasks = tasks;
        return {
            total: allTasks.length,
            pending: allTasks.filter(t => t.status === 'Pending').length,
            inProgress: allTasks.filter(t => t.status === 'In Progress').length,
            completed: allTasks.filter(t => t.status === 'Completed').length,
            cancelled: allTasks.filter(t => t.status === 'Cancelled').length,
            rejected: allTasks.filter(t => t.status === 'Rejected').length,
            overdue: allTasks.filter(t => 
                (t.status === 'Pending' || t.status === 'In Progress') && 
                t.dueDate && isPast(parseISO(t.dueDate))
            ).length,
        };
    }, [tasks]);

    const latestTasks = useMemo(() => {
        return [...tasks]
            .sort((a, b) => parseISO(b.createDate).getTime() - parseISO(a.createDate).getTime())
            .slice(0, 5);
    }, [tasks]);
    
    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        updateTask(taskId, { status: newStatus });
        toast({
            title: "Status Updated",
            description: `Task status changed to "${newStatus}".`
        });
    };
    
    const getStatusBadgeVariant = (status: string) => {
        const lowerCaseStatus = status.toLowerCase();
        if (lowerCaseStatus.includes('completed')) return 'default';
        if (lowerCaseStatus.includes('pending')) return 'destructive';
        if (lowerCaseStatus.includes('in progress')) return 'secondary';
        return 'outline';
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '—';
        try {
            return format(parseISO(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };
    
    return (
        <Card className="lg:col-span-7">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Tasks (All Accounts)
                </CardTitle>
                 <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                    <span>Total: <strong className="text-foreground">{taskAnalytics.total}</strong></span>
                    <span className="text-yellow-500">Pending: <strong className="text-yellow-400">{taskAnalytics.pending}</strong></span>
                    <span className="text-blue-500">In Progress: <strong className="text-blue-400">{taskAnalytics.inProgress}</strong></span>
                    <span className="text-green-500">Completed: <strong className="text-green-400">{taskAnalytics.completed}</strong></span>
                    <span>Cancelled: <strong className="text-foreground">{taskAnalytics.cancelled}</strong></span>
                    <span>Rejected: <strong className="text-foreground">{taskAnalytics.rejected}</strong></span>
                    <span className="text-red-500">Overdue: <strong className="text-red-400">{taskAnalytics.overdue}</strong></span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Assigned RM</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {latestTasks.map(task => {
                            const isOverdue = (task.status === 'In Progress' || task.status === 'Pending') && task.dueDate && isPast(parseISO(task.dueDate));
                            const isTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(task.status);
                             return (
                                <TableRow key={task.id} className={cn(isOverdue && 'text-destructive')}>
                                    <TableCell>{task.clientName}</TableCell>
                                    <TableCell>{task.category}</TableCell>
                                    <TableCell>{task.rmName || '—'}</TableCell>
                                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild disabled={!canUpdate || isTerminal}>
                                                <Badge 
                                                    variant={getStatusBadgeVariant(task.status)}
                                                    className={cn((canUpdate && !isTerminal) ? "cursor-pointer" : "cursor-not-allowed", isOverdue && 'border-destructive')}
                                                >
                                                {task.status}
                                                </Badge>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {task.status === 'Pending' && (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'In Progress')}>
                                                        Move to In Progress
                                                    </DropdownMenuItem>
                                                )}
                                                {task.status === 'In Progress' && (
                                                    <>
                                                        <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Completed')}>Completed</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Cancelled')}>Cancelled</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Rejected')}>Rejected</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" asChild>
                                            <Link href="/tasks">
                                               <Eye className="h-4 w-4" />
                                            </Link>
                                         </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                 {latestTasks.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No tasks found.</p>}
            </CardContent>
            <CardFooter className="justify-end pt-4">
                <Button variant="outline" asChild>
                    <Link href="/tasks">View All Tasks</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function SuperAdminDashboard() {
  const { effectiveUser } = useCurrentUser();
  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Super Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Associates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{associates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
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
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10)}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
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
                <Pie data={totalCounts} dataKey="count" nameKey="name" innerRadius={60}>
                   {totalCounts.map((entry) => (
                     <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {effectiveUser?.role === 'SUPER_ADMIN' && <TaskSummaryCard />}

      </div>
    </>
  );
}
