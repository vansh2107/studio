
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTasks } from '@/hooks/use-tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { Task, TaskStatus } from '@/hooks/use-tasks';
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
import { TASK_STATUSES } from '@/lib/constants';
import { format, parse, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/is-overdue';
import { getAllRMs, getAllAssociates, getAllAdmins } from '@/lib/mock-data';
import type { User } from '@/lib/types';


const ExpandedTaskDetails = ({ task }: { task: Task }) => {
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
    <div className="bg-muted/30 p-6 space-y-6">
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


export default function TasksPage() {
  const { effectiveUser, hasPermission } = useCurrentUser();
  const { toast } = useToast();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const canView = hasPermission('TASK', 'view');
  const canCreate = hasPermission('TASK', 'create');
  const canUpdate = hasPermission('TASK', 'edit');
  const canDelete = hasPermission('TASK', 'delete');
  const isSuperAdmin = effectiveUser?.role === 'SUPER_ADMIN';

  const canViewTask = (user: User | null, task: Task): boolean => {
    if (!user) return false;

    if (user.role === 'SUPER_ADMIN') return true;
    if (user.id === task.clientId) return true; // Customer can see their own tasks
    if (user.id === task.familyHeadId) return true; // Family head can see member tasks

    if (user.role === 'ASSOCIATE') {
      return user.id === task.associateId;
    }

    if (user.role === 'RM') {
      const allAssociates = getAllAssociates();
      const taskAssociate = allAssociates.find(a => a.id === task.associateId);
      return taskAssociate?.rmId === user.id;
    }
    
    if (user.role === 'ADMIN') {
        const allAssociates = getAllAssociates();
        const allRms = getAllRMs();
        const taskAssociate = allAssociates.find(a => a.id === task.associateId);
        const taskRm = allRms.find(rm => rm.id === taskAssociate?.rmId);
        return taskRm?.adminId === user.id;
    }

    return false;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => canViewTask(effectiveUser, task));
  }, [tasks, effectiveUser]);


  const getStatusBadgeVariant = (status: string) => {
    const lowerCaseStatus = status.toLowerCase();
    if (lowerCaseStatus.includes('completed') || lowerCaseStatus.includes('received') || lowerCaseStatus.includes('done') || lowerCaseStatus.includes('credited')) return 'default';
    if (lowerCaseStatus.includes('pending')) return 'secondary';
    if (lowerCaseStatus.includes('in progress')) return 'secondary';
    return 'outline';
  };

  const handleOpenCreateModal = () => {
    if (!canCreate) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to create tasks.', variant: 'destructive' });
        return;
    }
    setEditingTask(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (task: Task) => {
    if (!canUpdate) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to edit tasks.', variant: 'destructive' });
        return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask(task);
    }
    handleCloseModal();
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    toast({
        title: "Status Updated",
        description: `Task status changed to "${newStatus}".`
    });
  }

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    toast({
        title: 'Task Deleted',
        description: `The task for "${taskToDelete.clientName}" has been deleted.`,
    });
    setTaskToDelete(null);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
        if (dateString.includes(' ')) {
            const parsedDate = parse(dateString, 'dd-MM-yyyy HH:mm', new Date());
            if (!isNaN(parsedDate.getTime())) {
                return format(parsedDate, 'dd MMM yy, h:mm a');
            }
        }
      return format(parseISO(dateString), 'dd MMM yy, h:mm a');
    } catch {
      return dateString;
    }
  };
  
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpandRow = (taskId: string) => {
    setExpandedRow(current => (current === taskId ? null : taskId));
  };

  const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];

  if (!canView) {
      return (
          <Card>
              <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
              <CardContent><p>You do not have permission to view this page.</p></CardContent>
          </Card>
      );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-headline">Task Management</h1>
              <p className="text-muted-foreground">
                A list of tasks generated by the Assistant or created manually.
              </p>
            </div>
             {canCreate && (
                <Button
                    onClick={handleOpenCreateModal}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            )}
        </div>


        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>
              This is a prototype. Tasks are stored in memory and will be cleared on page refresh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Serviceable RM</TableHead>
                  <TableHead>Create Date</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Complete Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const isExpanded = expandedRow === task.id;
                    const overdue = isOverdue(task);
                    const isTerminal = terminalStatuses.includes(task.status);
                    const canEditTask = isSuperAdmin || !isTerminal;

                    const descriptionContent = task.insurance?.policyNo || task.mutualFund?.folioNo || task.description;

                    return (
                        <React.Fragment key={task.id}>
                            <TableRow className={cn(overdue && 'text-red-600', isExpanded && 'bg-muted/50')}>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => toggleExpandRow(task.id)}>
                                        <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />
                                    </Button>
                                </TableCell>
                                <TableCell className="font-medium">{task.clientName}</TableCell>
                                <TableCell>{task.category}</TableCell>
                                <TableCell>{task.serviceableRM || '—'}</TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger>{task.createDate ? format(parseISO(task.createDate), 'dd MMM yy') : '—'}</TooltipTrigger>
                                        <TooltipContent>
                                            <p>Created: {task.createDate ? format(parseISO(task.createDate), 'PPpp') : 'N/A'}</p>
                                            {task.completeDate && <p>Completed: {format(parseISO(task.completeDate), 'PPpp')}</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{formatDate(task.startDate)}</TableCell>
                                <TableCell>{formatDate(task.dueDate)}</TableCell>
                                <TableCell>{formatDate(task.completeDate)}</TableCell>
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
                                            {task.status === 'Pending' && (
                                                <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'In Progress')}>
                                                    Move to In Progress
                                                </DropdownMenuItem>
                                            )}
                                            {(task.status === 'In Progress' || (isSuperAdmin && isTerminal)) && (
                                                <>
                                                    {isSuperAdmin && task.status !== 'In Progress' && (
                                                        <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'In Progress')}>
                                                            Re-open to In Progress
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Completed')}>Completed</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Cancelled')}>Cancelled</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Rejected')}>Rejected</DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                    <TooltipTrigger>{truncateText(descriptionContent, 25)}</TooltipTrigger>
                                    {(descriptionContent && descriptionContent.length > 25) && (
                                        <TooltipContent><p className="max-w-xs">{descriptionContent}</p></TooltipContent>
                                    )}
                                    </Tooltip>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {canUpdate && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(task)} disabled={!canEditTask}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{canEditTask ? 'Edit Task' : 'Task is locked'}</p>
                                                </TooltipContent>
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
                            {isExpanded && (
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableCell colSpan={11}>
                                        <ExpandedTaskDetails task={task} />
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      No tasks created yet. Try the chatbot or the 'Add Task' button!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <CreateTaskModal
            task={editingTask}
            onClose={handleCloseModal}
            onSave={(taskData) => {
              if (editingTask) {
                updateTask(editingTask.id, taskData);
              } else {
                addTask(taskData);
              }
              handleCloseModal();
            }}
          />
        </Modal>
      )}

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
    </TooltipProvider>
  );
}
