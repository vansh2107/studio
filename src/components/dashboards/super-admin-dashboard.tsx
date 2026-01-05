
'use client';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye } from 'lucide-react';
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
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TaskOverview from './task-overview';

const admins = getAllAdmins();
const rms = getAllRMs();
const associates = getAllAssociates();
const clients = getAllClients();

const TaskSummaryCard = () => {
    const { tasks, updateTask } = useTasks();
    const { effectiveUser } = useCurrentUser();
    const { toast } = useToast();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const isSuperAdmin = effectiveUser?.role === 'SUPER_ADMIN';

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

    const truncateText = (text: string | undefined, maxLength: number) => {
      if (!text) return '—';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };
    
    return (
      <TooltipProvider>
        <Card className="lg:col-span-7">
            <CardHeader>
                <TaskOverview tasks={tasks} />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Assigned RM</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {latestTasks.map(task => {
                            const isOverdue = (task.status === 'In Progress' || task.status === 'Pending') && task.dueDate && isPast(parseISO(task.dueDate));
                            const canUpdateStatus = isSuperAdmin; // Always true for super admin

                             return (
                                <TableRow key={task.id} className={cn(isOverdue && 'text-destructive', 'hover:bg-transparent')}>
                                    <TableCell>{task.clientName}</TableCell>
                                    <TableCell>{task.category}</TableCell>
                                    <TableCell>{task.rmName || '—'}</TableCell>
                                    <TableCell>
                                        <UITooltip>
                                          <TooltipTrigger>{truncateText(task.description, 25)}</TooltipTrigger>
                                          {task.description && task.description.length > 25 && (
                                            <TooltipContent><p className="max-w-xs">{task.description}</p></TooltipContent>
                                          )}
                                        </UITooltip>
                                    </TableCell>
                                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild disabled={!canUpdateStatus}>
                                                <Badge 
                                                    variant={getStatusBadgeVariant(task.status)}
                                                    className={cn(canUpdateStatus ? "cursor-pointer" : "cursor-not-allowed", isOverdue && 'border-destructive')}
                                                >
                                                {task.status}
                                                </Badge>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {task.status !== 'Pending' && (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Pending')}>
                                                        Move to Pending
                                                    </DropdownMenuItem>
                                                )}
                                                {task.status !== 'In Progress' && (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'In Progress')}>
                                                        Move to In Progress
                                                    </DropdownMenuItem>
                                                )}
                                                {task.status !== 'Completed' && (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Completed')}>Completed</DropdownMenuItem>
                                                )}
                                                {task.status !== 'Cancelled' && (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Cancelled')}>Cancelled</DropdownMenuItem>
                                                )}
                                                {task.status !== 'Rejected' && (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Rejected')}>Rejected</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                         <UITooltip>
                                            <TooltipTrigger asChild>
                                               <Button variant="ghost" size="icon" asChild>
                                                  <Link href="/tasks">
                                                     <Eye className="h-4 w-4" />
                                                  </Link>
                                               </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>View All Tasks</p></TooltipContent>
                                         </UITooltip>
                                      </div>
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
      </TooltipProvider>
    );
}

export default function SuperAdminDashboard() {
  const { effectiveUser } = useCurrentUser();
  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Super Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rms.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Associates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{associates.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-primary border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {effectiveUser?.role === 'SUPER_ADMIN' && <TaskSummaryCard />}
      </div>
    </>
  );
}
