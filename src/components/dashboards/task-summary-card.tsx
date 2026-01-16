'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTasks, Task, TaskStatus } from '@/hooks/use-tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronRight, Edit } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parse, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/is-overdue';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TaskOverview from '@/components/dashboards/task-overview';


const ExpandedTaskDetails = ({ task, canUpdate, canEditTask, onEdit }: { task: Task; canUpdate: boolean; canEditTask: boolean, onEdit: (task: Task) => void }) => {
  const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="text-sm text-foreground">{children || '—'}</div>
    </div>
  );
  
  const Section = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-primary">{title}</h4>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {children}
      </div>
    </div>
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
        if (dateString.includes(' ')) {
            const parsedDate = parse(dateString, 'dd-MM-yyyy HH:mm', new Date());
            if (!isNaN(parsedDate.getTime())) {
                return format(parsedDate, 'dd MMM yyyy, h:mm a');
            }
        }
      return format(parseISO(dateString), 'dd MMM yyyy, h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  }
  
  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outline';
    const lowerCaseStatus = status.toLowerCase();
    if (['completed', 'received', 'done', 'credited', 'yes'].includes(lowerCaseStatus)) return 'default';
    if (['pending', 'in progress', 'no'].includes(lowerCaseStatus)) return 'secondary';
    return 'outline';
  };

  return (
    <div className="bg-muted/30 p-6 space-y-6 relative">
      {canEditTask && (
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-4 right-4 bg-background"
          onClick={() => onEdit(task)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Task
        </Button>
      )}
      <Section title="General Information">
        <DetailItem label="Task ID">{task.id}</DetailItem>
        <DetailItem label="Category">{task.category}</DetailItem>
        <DetailItem label="Current Status">
           <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
        </DetailItem>
        {task.status2 && (
             <DetailItem label="Secondary Status">
                <Badge variant={getStatusBadgeVariant(task.status2)}>{task.status2}</Badge>
            </DetailItem>
        )}
        {task.description && <div className="lg:col-span-3"><DetailItem label="Description">{task.description}</DetailItem></div>}
      </Section>
      
      <Section title="People">
         <DetailItem label="Client Name">{task.clientName}</DetailItem>
         <DetailItem label="Assigned RM">{task.rmName}</DetailItem>
         <DetailItem label="Serviceable RM">{task.serviceableRM}</DetailItem>
      </Section>

      <Section title="Timeline">
         <DetailItem label="Created On">{formatDate(task.createDate)}</DetailItem>
         <DetailItem label="Started On">{formatDate(task.startDate)}</DetailItem>
         <DetailItem label="Due By">{formatDate(task.dueDate)}</DetailItem>
         <DetailItem label="Completed On">{formatDate(task.completeDate)}</DetailItem>
      </Section>

      {task.category === 'Mutual Funds' && task.mutualFund && (
        <Section title="Mutual Fund Details">
          <DetailItem label="Family Head">{task.mutualFund.familyHead}</DetailItem>
          <DetailItem label="Service">{task.mutualFund.service}</DetailItem>
          <DetailItem label="Folio No.">{task.mutualFund.folioNo}</DetailItem>
          <DetailItem label="AMC Name">{task.mutualFund.nameOfAMC}</DetailItem>
          <DetailItem label="Amount">{formatCurrency(task.mutualFund.amount)}</DetailItem>
          <DetailItem label="Document Status">
            <Badge variant={getStatusBadgeVariant(task.mutualFund.documentStatus)}>{task.mutualFund.documentStatus}</Badge>
          </DetailItem>
          <DetailItem label="Signature Status">
            <Badge variant={getStatusBadgeVariant(task.mutualFund.signatureStatus)}>{task.mutualFund.signatureStatus}</Badge>
          </DetailItem>
           <DetailItem label="AMC Submission">
            <Badge variant={getStatusBadgeVariant(task.mutualFund.amcSubmissionStatus)}>{task.mutualFund.amcSubmissionStatus}</Badge>
          </DetailItem>
        </Section>
      )}

      {task.category === 'Life Insurance' && task.insurance && (
        <Section title="Life Insurance Details">
           <DetailItem label="Family Head">{task.insurance.familyHead}</DetailItem>
           <DetailItem label="Associate">{task.insurance.associate}</DetailItem>
           <DetailItem label="Policy No.">{task.insurance.policyNo}</DetailItem>
           <DetailItem label="Company">{task.insurance.company}</DetailItem>
           <DetailItem label="Insurance Type">{task.insurance.insuranceType}</DetailItem>

           {task.insurance.insuranceType === 'Non-Financial' && (
            <>
              <DetailItem label="Service">{task.insurance.typeOfService}</DetailItem>
              <DetailItem label="Date">{formatDate(task.insurance.nonFinancialDate)}</DetailItem>
            </>
           )}

           {task.insurance.insuranceType === 'Financial' && (
            <>
              <DetailItem label="Financial Service">{task.insurance.financialService}</DetailItem>
              {task.insurance.financialService === 'Maturity' && <>
                <DetailItem label="Maturity Due Date">{formatDate(task.insurance.maturityDueDate)}</DetailItem>
                <DetailItem label="Maturity Amount">{formatCurrency(task.insurance.maturityAmount)}</DetailItem>
              </>}
              {task.insurance.financialService === 'Death Claim' && <DetailItem label="Process Date">{formatDate(task.insurance.deathClaimProcessDate)}</DetailItem>}
              {task.insurance.financialService === 'Surrender' && <DetailItem label="Process Date">{formatDate(task.insurance.surrenderProcessDate)}</DetailItem>}
              
               <DetailItem label="Amount Status">
                  <Badge variant={getStatusBadgeVariant(task.insurance.amountStatus)}>{task.insurance.amountStatus}</Badge>
               </DetailItem>

              {task.insurance.amountStatus === 'Credited' && <>
                <DetailItem label="Received Date">{formatDate(task.insurance.receivedDate)}</DetailItem>
                <DetailItem label="Received Amount">{formatCurrency(task.insurance.receivedAmount)}</DetailItem>
                <DetailItem label="Re-investment">
                   <Badge variant={getStatusBadgeVariant(task.insurance.reinvestmentStatus)}>{task.insurance.reinvestmentStatus}</Badge>
                </DetailItem>
                {task.insurance.reinvestmentStatus === 'Pending' && <DetailItem label="Approx. Re-investment Date">{formatDate(task.insurance.reinvestmentApproxDate)}</DetailItem>}
                {task.insurance.reinvestmentStatus === 'No' && <DetailItem label="Reason for No Re-investment">{task.insurance.reinvestmentReason}</DetailItem>}
              </>}
            </>
           )}
        </Section>
      )}

      {task.category === 'General Insurance' && task.generalInsuranceTask && (
        <Section title="General Insurance Task Details">
          <DetailItem label="Service Category">{task.generalInsuranceTask.serviceCategory}</DetailItem>
          <DetailItem label="Sub Category">{task.generalInsuranceTask.subCategory}</DetailItem>
          <DetailItem label="Policy Number">{task.generalInsuranceTask.policyNumber}</DetailItem>
        </Section>
      )}
      
      {task.category === 'Stocks' && task.stocksTask && (
        <Section title="Stocks Task Details">
          <DetailItem label="Service">{task.stocksTask.service}</DetailItem>
          <DetailItem label="DPID">{task.stocksTask.dpid}</DetailItem>
        </Section>
      )}

      {task.category === 'FDs' && task.fdTask && (
        <Section title="Fixed Deposit Task Details">
          <DetailItem label="Service Category">{task.fdTask.serviceCategory}</DetailItem>
          <DetailItem label="Folio Number">{task.fdTask.folioNumber}</DetailItem>
        </Section>
      )}

      {task.category === 'Bonds' && task.bondsTask && (
        <Section title="Bonds Task Details">
          <DetailItem label="Service Category">{task.bondsTask.serviceCategory}</DetailItem>
          <DetailItem label="ISIN Number">{task.bondsTask.isinNumber}</DetailItem>
        </Section>
      )}

      {task.category === 'PPF' && task.ppfTask && (
        <Section title="PPF Task Details">
          <DetailItem label="Service Category">{task.ppfTask.serviceCategory}</DetailItem>
          <DetailItem label="Policy Number">{task.ppfTask.policyNumber}</DetailItem>
          <DetailItem label="Bank Account Number">{task.ppfTask.bankAccountNumber}</DetailItem>
        </Section>
      )}

      {task.category === 'Physical to Demat' && task.physicalToDematTask && (
        <Section title="Physical to Demat Task Details">
          <DetailItem label="Service Category">{task.physicalToDematTask.serviceCategory}</DetailItem>
          <DetailItem label="Folio Number">{task.physicalToDematTask.folioNumber}</DetailItem>
        </Section>
      )}
    </div>
  );
};

export function TaskSummaryCard({ allTasks, limit = 5 }: { allTasks: Task[], limit?: number }) {
    const { updateTask, deleteTask } = useTasks();
    const { effectiveUser, hasPermission } = useCurrentUser();
    const { toast } = useToast();
    const router = useRouter();

    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const canUpdate = hasPermission('TASK', 'edit');
    const canDelete = hasPermission('TASK', 'delete');
    const isSuperAdmin = effectiveUser?.role === 'SUPER_ADMIN';

    const latestTasks = useMemo(() => {
        return [...allTasks]
            .sort((a, b) => parseISO(b.createDate).getTime() - parseISO(a.createDate).getTime())
            .slice(0, limit);
    }, [allTasks, limit]);

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
        if (lowerCaseStatus.includes('pending')) return 'secondary';
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
    
    const handleDeleteConfirm = () => {
        if (!taskToDelete) return;
        deleteTask(taskToDelete.id);
        toast({
            title: 'Task Deleted',
            description: `The task for "${taskToDelete.clientName}" has been deleted.`,
        });
        setTaskToDelete(null);
    };

    const toggleExpandRow = (taskId: string) => {
        setExpandedRow(current => (current === taskId ? null : taskId));
    };

    const handleOpenEditModal = (task: Task) => {
        router.push(`/tasks/edit/${task.id}`);
    }

    const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];
    
    return (
      <TooltipProvider>
        <Card className="lg:col-span-7">
            <CardHeader>
                <TaskOverview tasks={allTasks} />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
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
                            const overdue = isOverdue(task);
                            const isTerminal = terminalStatuses.includes(task.status);
                            const canEditTask = hasPermission('TASK', 'edit') && (isSuperAdmin || !isTerminal);
                            const descriptionContent = task.insurance?.policyNo || task.mutualFund?.folioNo || task.description;

                             return (
                                <React.Fragment key={task.id}>
                                <TableRow className={cn(overdue && "text-red-600", expandedRow === task.id && "bg-muted/50")}>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => toggleExpandRow(task.id)}>
                                            <ChevronRight className={cn('h-4 w-4 transition-transform', expandedRow === task.id && 'rotate-90')} />
                                        </Button>
                                    </TableCell>
                                    <TableCell>{task.clientName}</TableCell>
                                    <TableCell>{task.category}</TableCell>
                                    <TableCell>{task.rmName || '—'}</TableCell>
                                    <TableCell>
                                        <Tooltip>
                                          <TooltipTrigger>{truncateText(descriptionContent, 25)}</TooltipTrigger>
                                          {descriptionContent && descriptionContent.length > 25 && (
                                            <TooltipContent><p className="max-w-xs">{descriptionContent}</p></TooltipContent>
                                          )}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild disabled={!canUpdate || !canEditTask}>
                                                <Badge 
                                                    variant={overdue ? 'destructive' : getStatusBadgeVariant(task.status)}
                                                    className={cn((canUpdate && canEditTask) ? "cursor-pointer" : "cursor-not-allowed")}
                                                >
                                                {overdue ? 'Overdue' : task.status}
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
                                         {canEditTask && (
                                            <Tooltip>
                                               <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(task)}>
                                                     <Edit className="h-4 w-4" />
                                                  </Button>
                                               </TooltipTrigger>
                                               <TooltipContent><p>Edit Task</p></TooltipContent>
                                            </Tooltip>
                                         )}
                                          {canDelete && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => setTaskToDelete(task)} disabled={!canEditTask}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{canEditTask ? 'Delete Task' : 'Cannot delete locked task'}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                      </div>
                                    </TableCell>
                                </TableRow>
                                {expandedRow === task.id && (
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableCell colSpan={8}>
                                            <ExpandedTaskDetails task={task} canUpdate={canUpdate} canEditTask={canEditTask} onEdit={handleOpenEditModal} />
                                        </TableCell>
                                    </TableRow>
                                )}
                                </React.Fragment>
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
             <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the task for <strong>{taskToDelete?.clientName}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
      </TooltipProvider>
    );
}