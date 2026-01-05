
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Task, TaskStatus } from '@/hooks/use-tasks';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, parseISO, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface CustomerTaskDashboardProps {
  tasks: Task[];
}

const getStatusBadgeVariant = (status: string) => {
  const lowerCaseStatus = status.toLowerCase();
  if (lowerCaseStatus.includes('completed') || lowerCaseStatus.includes('received') || lowerCaseStatus.includes('done') || lowerCaseStatus.includes('credited')) return 'default';
  if (lowerCaseStatus.includes('pending')) return 'destructive';
  if (lowerCaseStatus.includes('in progress')) return 'secondary';
  return 'outline';
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—';
  try {
    if (dateString.includes(' ')) {
        const parsedDate = new Date(dateString.replace(/-/g, '/'));
        if (!isNaN(parsedDate.getTime())) {
            return format(parsedDate, 'dd MMM yyyy, h:mm a');
        }
    }
    return format(parseISO(dateString), 'dd MMM yyyy, h:mm a');
  } catch {
    return dateString;
  }
};

const truncateText = (text: string | undefined, maxLength: number) => {
  if (!text) return '—';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function CustomerTaskDashboard({ tasks }: CustomerTaskDashboardProps) {
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [tasks]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              A list of tasks assigned to you or your family members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned RM</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Doc Status</TableHead>
                  <TableHead>Sig Status</TableHead>
                  <TableHead>AMC Sub Status</TableHead>
                  <TableHead>Amount Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.length > 0 ? (
                  sortedTasks.map((task) => {
                    const isOverdue = task.status !== 'Completed' && task.dueDate && isPast(parseISO(task.dueDate));
                    const descriptionContent = task.insurance?.policyNo || task.mutualFund?.folioNo || task.description;

                    return (
                        <TableRow key={task.id} className={cn(isOverdue && 'text-destructive', "hover:bg-transparent")}>
                          <TableCell className="font-medium">{task.clientName}</TableCell>
                          <TableCell>{task.category}</TableCell>
                          <TableCell>{task.rmName || '—'}</TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger>{truncateText(descriptionContent, 25)}</TooltipTrigger>
                              {(descriptionContent && descriptionContent.length > 25) && (
                                <TooltipContent><p className="max-w-xs">{descriptionContent}</p></TooltipContent>
                              )}
                            </Tooltip>
                          </TableCell>
                          <TableCell>{formatDate(task.dueDate)}</TableCell>
                          <TableCell>
                            <Badge
                                variant={getStatusBadgeVariant(task.status)}
                                className={cn("cursor-not-allowed", isOverdue && 'border-destructive')}
                            >
                                {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.mutualFund?.documentStatus ? (
                              <Badge variant={getStatusBadgeVariant(task.mutualFund.documentStatus)}>
                                {task.mutualFund.documentStatus}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            {task.mutualFund?.signatureStatus ? (
                              <Badge variant={getStatusBadgeVariant(task.mutualFund.signatureStatus)}>
                                {task.mutualFund.signatureStatus}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                           <TableCell>
                            {task.mutualFund?.amcSubmissionStatus ? (
                              <Badge variant={getStatusBadgeVariant(task.mutualFund.amcSubmissionStatus)}>
                                {task.mutualFund.amcSubmissionStatus}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            {task.insurance?.amountStatus ? (
                              <Badge variant={getStatusBadgeVariant(task.insurance.amountStatus)}>
                                {task.insurance.amountStatus}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                        </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No tasks assigned yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
