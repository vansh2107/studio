
'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
import { Plus, Trash2, ChevronRight, Edit, Download, UserCheck, Play, UserCog, CheckCircle, PauseCircle, XCircle, Check } from 'lucide-react';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import type { TaskFormData } from '@/components/tasks/create-task-modal';
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
import { getAllRMs, getAllAssociates, getAllAdmins, getAllClients, familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import type { User } from '@/lib/types';

const TimelineStep = ({ label, value, data, isActive, isCompleted, isFirst, isLast, icon: Icon, isHold }: { label: string; value: React.ReactNode; data?: React.ReactNode; isActive: boolean; isCompleted: boolean; isFirst: boolean, isLast: boolean, icon: React.ElementType, isHold?: boolean }) => {
    const nodeColor = isHold ? 'bg-orange-500 border-orange-500' : isActive ? 'bg-primary border-primary' : isCompleted ? 'bg-green-600 border-green-600' : 'bg-card border-border';
    const textColor = isActive ? 'text-primary' : isHold ? 'text-orange-500' : 'text-foreground';
    const lineColor = isCompleted || isActive || isHold ? 'bg-primary' : 'bg-border';

    return (
        <div className={cn("relative flex md:flex-col items-center flex-1 w-full md:w-auto", isFirst && 'items-start', isLast && 'items-end md:items-center')}>
            {!isFirst && <div className={cn("absolute h-full md:h-0.5 md:w-full md:top-4 md:-right-1/2 left-4 md:left-auto w-0.5", lineColor)}></div>}
            
            <div className="relative z-10 flex flex-col items-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0", nodeColor)}>
                             {isCompleted ? <Check className="w-5 h-5 text-white" /> : <Icon className={cn("w-5 h-5", (isActive || isHold) ? 'text-white' : 'text-muted-foreground')} />}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold">{label}</p>
                        {data && <p>{data}</p>}
                        {value && <p className="text-xs">{value}</p>}
                    </TooltipContent>
                </Tooltip>
                 <div className="text-center mt-2 absolute md:relative top-full md:top-auto pt-1 md:pt-0">
                    <p className={cn("font-semibold text-sm", textColor)}>{label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{data}</p>
                </div>
            </div>
        </div>
    );
};


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
  
  const formatShortDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), 'dd MMM, h:mm a');
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
    if (['pending', 'in progress', 'no', 'hold'].includes(lowerCaseStatus)) return 'secondary';
    return 'outline';
  };
  
  const allSteps = [
      { key: 'created', label: 'Created', value: formatShortDate(task.createDate), icon: Plus, isApplicable: !!task.createDate, data: `By System`},
      { key: 'assigned', label: 'Assigned RM', value: task.rmName, icon: UserCheck, isApplicable: !!task.rmName },
      { key: 'inProgress', label: 'In Progress', value: formatShortDate(task.startDate), icon: Play, isApplicable: !!task.startDate },
      { key: 'taskRm', label: 'Task RM', value: task.taskRM, icon: UserCog, isApplicable: !!task.taskRM, data: task.taskRMStatus },
      { key: 'completed', label: 'Completed', value: formatShortDate(task.completeDate), icon: CheckCircle, isApplicable: task.status === 'Completed' },
      { key: 'cancelled', label: 'Cancelled', value: formatShortDate(task.completeDate), icon: XCircle, isApplicable: task.status === 'Cancelled' },
      { key: 'rejected', label: 'Rejected', value: formatShortDate(task.completeDate), icon: XCircle, isApplicable: task.status === 'Rejected' },
      { key: 'onHold', label: 'On Hold', value: 'Task is on hold', icon: PauseCircle, isApplicable: task.taskRMStatus === 'Hold' },
    ];
  
  const visibleSteps = allSteps.filter(step => step.isApplicable && step.key !== 'onHold');
  const isHold = task.taskRMStatus === 'Hold';

  let activeStepIndex = 0;
  if (isHold) {
     activeStepIndex = visibleSteps.findIndex(s => s.key === 'taskRm');
  } else if (['Completed', 'Cancelled', 'Rejected'].includes(task.status)) {
    activeStepIndex = visibleSteps.length -1;
  } else if (task.status === 'In Progress') {
    activeStepIndex = visibleSteps.findIndex(s => s.key === 'taskRm' || s.key === 'inProgress');
    if (activeStepIndex === -1) activeStepIndex = visibleSteps.findIndex(s => s.key === 'assigned');
  } else if (task.status === 'Pending') {
    activeStepIndex = visibleSteps.findIndex(s => s.key === 'assigned');
    if (activeStepIndex === -1) activeStepIndex = 0;
  }
  if (activeStepIndex < 0) activeStepIndex = 0;

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
      
      <Section title="Timeline">
         <div className="col-span-full flex flex-col md:flex-row items-stretch md:items-start justify-center gap-4 py-4 min-h-[120px]">
            {visibleSteps.map((step, index) => (
                <TimelineStep
                    key={step.key}
                    label={step.label}
                    value={step.value}
                    data={step.data}
                    isActive={index === activeStepIndex}
                    isCompleted={index < activeStepIndex}
                    isHold={isHold && index === activeStepIndex}
                    isFirst={index === 0}
                    isLast={index === visibleSteps.length - 1}
                    icon={step.icon}
                />
            ))}
        </div>
      </Section>
      
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
         {task.taskRM && <DetailItem label="Task RM">{task.taskRM}</DetailItem>}
         {task.taskRMStatus && (
            <DetailItem label="Task RM Status">
                <Badge variant={getStatusBadgeVariant(task.taskRMStatus)}>{task.taskRMStatus}</Badge>
            </DetailItem>
         )}
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

  const clientOptions = useMemo(() => {
    const heads = getAllClients().map(c => ({
      label: `${c.firstName} ${c.lastName} (Head)`,
      value: c.id,
      relation: 'Head'
    }));

    const members = mockFamilyMembers.map(m => ({
      label: `${m.firstName} ${m.lastName} (${m.relation})`,
      value: m.id,
      clientId: m.clientId,
      relation: m.relation,
    }));

    return [...heads, ...members].sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const allRms = useMemo(() => getAllRMs(), []);

  const filteredTasks = useMemo(() => {
    if (!effectiveUser) return [];
    if (effectiveUser.role === 'SUPER_ADMIN') {
        return tasks;
    }

    return tasks.filter(task => {
        const serviceableRm = allRms.find(rm => rm.name === task.serviceableRM);

        return (
            task.adminId === effectiveUser.id ||
            task.rmId === effectiveUser.id ||
            task.associateId === effectiveUser.id ||
            (serviceableRm && serviceableRm.id === effectiveUser.id) ||
            task.clientId === effectiveUser.id ||
            task.familyHeadId === effectiveUser.id
        );
    });
  }, [tasks, effectiveUser, allRms]);


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

  const handleSaveTask = (formData: TaskFormData) => {
    if (editingTask) {
        updateTask(editingTask.id, formData);
        toast({
            title: 'Task Updated',
            description: `The task for "${formData.clientName}" has been successfully updated.`,
        });
    } else {
        addTask(formData);
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

  const handleExport = () => {
    const getServiceCategory = (task: Task) => {
        if (task.category === 'General Insurance') return task.generalInsuranceTask?.serviceCategory;
        if (task.category === 'FDs') return task.fdTask?.serviceCategory;
        if (task.category === 'Bonds') return task.bondsTask?.serviceCategory;
        if (task.category === 'PPF') return task.ppfTask?.serviceCategory;
        if (task.category === 'Physical to Demat') return task.physicalToDematTask?.serviceCategory;
        if (task.category === 'Stocks') return task.stocksTask?.service;
        if (task.category === 'Mutual Funds') return task.mutualFund?.service;
        if (task.category === 'Life Insurance') return task.insurance?.insuranceType === 'Financial' ? task.insurance.financialService : task.insurance?.typeOfService;
        return 'N/A';
    };

    const dataToExport = filteredTasks.map(task => ({
        'Task ID': task.id,
        'Client Name': task.clientName,
        'Category': task.category,
        'Service Category': getServiceCategory(task) || 'N/A',
        'Assigned RM': task.rmName || 'N/A',
        'Task RM': task.taskRM || 'N/A',
        'Task RM Status': task.taskRMStatus || 'N/A',
        'Created Date': task.createDate ? formatDate(task.createDate) : 'N/A',
        'In Progress Date': task.startDate ? formatDate(task.startDate) : 'N/A',
        'Completed Date': task.completeDate ? formatDate(task.completeDate) : 'N/A',
        'Due Date': task.dueDate ? formatDate(task.dueDate) : 'N/A',
        'Status': task.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, "Tasks.xlsx");
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
            <div className="flex items-center gap-2">
             {isSuperAdmin && (
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Tasks
                </Button>
            )}
             {canCreate && (
                <Button
                    onClick={handleOpenCreateModal}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            )}
            </div>
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
                                            <Button 
                                                variant={overdue ? 'destructive' : getStatusBadgeVariant(task.status)}
                                                className={cn("px-2 py-1 text-sm", (canUpdate && canEditTask) ? "cursor-pointer" : "cursor-not-allowed")}
                                            >
                                                {overdue ? 'Overdue' : task.status}
                                            </Button>
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
                                                <TooltipContent><p>{canEditTask ? 'Edit Task' : 'Cannot edit locked task'}</p></TooltipContent>
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
                                        <ExpandedTaskDetails task={task} canUpdate={canUpdate} canEditTask={canEditTask} onEdit={handleOpenEditModal} />
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

      {(isModalOpen || !!editingTask) && (
        <CreateTaskModal
          isOpen={isModalOpen || !!editingTask}
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
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

    
