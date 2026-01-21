
'use client';

import { useMemo } from 'react';
import { Task } from '@/lib/types';
import { isOverdue } from '@/lib/is-overdue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, Play, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TaskOverviewSectionProps {
  tasks: Task[];
}

const statusConfig = {
  Pending: { icon: Clock, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  Overdue: { icon: AlertTriangle, className: 'bg-red-100/60 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50' },
  'In Progress': { icon: Play, className: 'bg-blue-100/60 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
  Completed: { icon: CheckCircle, className: 'bg-green-100/60 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50' },
  Rejected: { icon: XCircle, className: 'bg-red-200/50 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200/80 dark:border-red-800/40' },
  Cancelled: { icon: Ban, className: 'bg-orange-100/60 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' },
};

type Status = keyof typeof statusConfig;

export function TaskOverviewSection({ tasks }: TaskOverviewSectionProps) {
  const router = useRouter();

  const taskCounts = useMemo(() => {
    const counts: Record<Status, number> = {
      Pending: 0,
      'In Progress': 0,
      Completed: 0,
      Rejected: 0,
      Cancelled: 0,
      Overdue: 0,
    };

    tasks.forEach(task => {
      if (task.status in counts) {
        counts[task.status as Status]++;
      }
      if (isOverdue(task)) {
        counts.Overdue++;
      }
    });
    return counts;
  }, [tasks]);

  const handleCardClick = (status: string) => {
    router.push(`/tasks?status=${encodeURIComponent(status)}`);
  };
  
  const statuses: Status[] = ['Pending', 'Overdue', 'In Progress', 'Completed', 'Rejected', 'Cancelled'];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-headline">Task Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statuses.map(status => {
          const Icon = statusConfig[status].icon;
          const count = taskCounts[status];
          return (
            <Card
              key={status}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick(status)}
              className={cn(
                "cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200",
                statusConfig[status].className
              )}
              onClick={() => handleCardClick(status)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{status}</CardTitle>
                <Icon className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs">Tasks</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
