
'use client';

import { useMemo } from 'react';
import { Task, TaskStatus } from '@/hooks/use-tasks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskOverviewProps {
  tasks: Task[];
  onStatusClick?: (status: TaskStatus | 'Overdue' | 'All') => void;
  selectedStatus?: TaskStatus | 'Overdue' | 'All';
}

const getStatusBadgeVariant = (status: string) => {
  const s = status.toLowerCase();

  if (s.includes("completed")) return "default";
  if (s.includes("pending")) return "secondary";
  if (s.includes("in progress")) return "secondary";
  if (s.includes("overdue")) return "outline";

  return "outline";
};

function getTaskBadgeClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("overdue")) {
    return "!bg-red-500 !text-white !border-red-600 hover:!bg-red-600";
  }

  return "";
}

export default function TaskOverview({ tasks, onStatusClick, selectedStatus }: TaskOverviewProps) {
  const taskAnalytics = useMemo(() => {
    const allTasks = tasks;
    return {
      'All': allTasks.length,
      'Pending': allTasks.filter(t => t.status === 'Pending').length,
      'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
      'Completed': allTasks.filter(t => t.status === 'Completed').length,
      'Cancelled': allTasks.filter(t => t.status === 'Cancelled').length,
      'Rejected': allTasks.filter(t => t.status === 'Rejected').length,
      'Overdue': allTasks.filter(t =>
        (t.status === 'Pending' || t.status === 'In Progress') &&
        t.dueDate && isPast(parseISO(t.dueDate))
      ).length,
    };
  }, [tasks]);

  const statuses: (TaskStatus | 'Overdue' | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled', 'Rejected', 'Overdue'];

  return (
    <Card className="lg:col-span-7">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Tasks Overview
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            {statuses.map(status => {
                const count = taskAnalytics[status as keyof typeof taskAnalytics];
                if (status !== 'All' && count === 0) return null;
                
                return (
                    <Badge
                        key={status}
                        variant={getStatusBadgeVariant(status)}
                        className={cn(
                            `cursor-pointer transition-all`,
                            selectedStatus === status ? 'ring-2 ring-ring ring-offset-2' : '',
                            getTaskBadgeClasses(status)
                        )}
                        onClick={() => onStatusClick?.(status)}
                    >
                        {status}: {count}
                    </Badge>
                )
            })}
        </CardContent>
    </Card>
  );
}
