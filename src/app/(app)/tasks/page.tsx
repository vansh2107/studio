
'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Plus, Trash2, ChevronRight, Edit, Download, User, AlertCircle, Edit2, CheckCircleIcon, Repeat, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import type { TaskFormData } from '@/components/tasks/create-task-modal';
import { Task, TaskStatus, TimelineEvent } from '@/hooks/use-tasks';
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
import { getAllRMs, getAllAssociates, getAllAdmins, getAllClients, familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TASK_STATUSES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';


const ExpandedTaskDetails = ({ task, canUpdate, canEditTask, onEdit }: { task: Task; canUpdate: boolean; canEditTask: boolean, onEdit: (task: Task) => void }) => {
  const [showFullHistory, setShowFullHistory] = useState(false);

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
    if (['pending', 'in progress', 'no', 'hold'].includes(lowerCaseStatus)) return 'secondary';
    return 'outline';
  };

  const eventVisuals: { [key: string]: { icon: React.ElementType, color: string } } = {
      TASK_CREATED: { icon: Plus, color: 'bg-primary' },
      STATUS_CHANGED: { icon: Edit2, color: 'bg-blue-500' },
      ASSIGNED_RM: { icon: User, color: 'bg-gray-500' },
      TASK_RM_ASSIGNED: { icon: User, color: 'bg-gray-500' },
      TASK_COMPLETED: { icon: CheckCircleIcon, color: 'bg-green-500' },
      TASK_REOPENED: { icon: Repeat, color: 'bg-orange-500' },
      FIELD_UPDATED: { icon: Edit2, color: 'bg-gray-500' },
      default: { icon: AlertCircle, color: 'bg-gray-500' },
  };

  const getEventVisuals = (event: TimelineEvent) => {
      let visuals = eventVisuals[event.eventType] || eventVisuals.default;
      if (event.eventType === 'STATUS_CHANGED') {
          const newStatus = event.description.split(' to ')[1]?.replace(/"/g, '');
          if (newStatus === 'Completed') return { icon: CheckCircleIcon, color: 'bg-green-500' };
          if (newStatus === 'Cancelled' || newStatus === 'Rejected') return { icon: AlertCircle, color: 'bg-destructive' };
      }
      return visuals;
  }

  const sortedEvents = (task.timelineEvents || []).slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const EventNode = ({ event }: { event: TimelineEvent }) => {
    const { icon: Icon, color } = getEventVisuals(event);
    return (
      <div className="flex flex-col items-center text-center w-32 flex-shrink-0 px-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", color)}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-bold">{event.title}</p>
              <p>{event.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="mt-2 font-semibold text-sm truncate w-full">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-1 w-full text-ellipsis overflow-hidden h-8">
          {event.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(parseISO(event.timestamp), 'dd MMM, h:mm a')}
        </p>
        <p className="text-xs text-muted-foreground">by {event.performedBy}</p>
      </div>
    );
  };

  const renderedTimeline = useMemo(() => {
    if (sortedEvents.length === 0) {
      return <p className="text-sm text-muted-foreground px-4">No history for this task.</p>;
    }
    
    if (showFullHistory) {
      return (
        <div className="w-full">
            <div className="flex justify-start items-center pl-2 pb-2">
                <Button variant="ghost" size="sm" onClick={() => setShowFullHistory(false)} className="text-sm text-primary hover:text-primary">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Collapse
                </Button>
            </div>
            <ScrollArea className="w-full pb-4">
            <div className="flex px-4 pt-0 items-start">
                {sortedEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                    <EventNode event={event} />
                    {index < sortedEvents.length - 1 && (
                    <div className="w-16 h-px bg-border mt-5 flex-shrink-0" />
                    )}
                </React.Fragment>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      );
    }
    
    if (sortedEvents.length <= 4) {
      return (
        <div className="flex p-4 items-start justify-center w-full">
          {sortedEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              <EventNode event={event} />
              {index < sortedEvents.length - 1 && (
                <div className="w-8 h-px bg-border mt-5 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    
    const first = sortedEvents[0];
    const last = sortedEvents[sortedEvents.length - 1];
    const middleEvents = sortedEvents.slice(1, -1);
    const lastTwoMiddle = middleEvents.slice(-2);

    return (
      <div className="flex p-4 items-start justify-center w-full">
        <EventNode event={first} />
        <div className="w-8 h-px bg-border mt-5 flex-shrink-0" />

        <div
          onClick={() => setShowFullHistory(true)}
          className="flex flex-col items-center text-center w-24 flex-shrink-0 cursor-pointer group pt-1"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground group-hover:text-accent-foreground transition-colors">
            {middleEvents.length - lastTwoMiddle.length} more
          </p>
        </div>

        <div className="w-8 h-px bg-border mt-5 flex-shrink-0" />

        {lastTwoMiddle.map((event) => (
          <React.Fragment key={event.id}>
            <EventNode event={event} />
            <div className="w-8 h-px bg-border mt-5 flex-shrink-0" />
          </React.Fragment>
        ))}
        
        <EventNode event={last} />
      </div>
    );
  }, [sortedEvents, showFullHistory]);

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
      
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Task History
        </h1>
      </div>
      <Section title="Task History">
        <div className="col-span-full">
          {renderedTimeline}
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get('status');
  const clientFilter = searchParams.get('client');

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

    const members = mockFamilyMembers.map(m => {
      const head = getAllClients().find(c => c.id === m.clientId);
      return {
        label: `${m.firstName} ${m.lastName} (${m.relation} of ${head?.firstName})`,
        value: m.id,
        clientId: m.clientId,
        relation: m.relation,
      };
    });

    const sortedClients = [...heads, ...members].sort((a,b) => a.label.localeCompare(b.label));
    
    return [
      { label: 'All Clients', value: 'all', relation: '' },
      ...sortedClients
    ];
  }, []);

  const allRms = useMemo(() => getAllRMs(), []);

  const filteredTasks = useMemo(() => {
    if (!effectiveUser) return [];

    let tasksForUser: Task[];
    if (effectiveUser.role === 'SUPER_ADMIN') {
      tasksForUser = tasks;
    } else {
      tasksForUser = tasks.filter(task => {
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
    }

    let filtered = tasksForUser;

    // Apply client filter
    if (clientFilter && clientFilter !== 'all') {
        const selectedOption = clientOptions.find(opt => opt.value === clientFilter);
        const familyId = (selectedOption as any)?.clientId || selectedOption?.value;
        if (familyId) {
            filtered = filtered.filter(task => task.familyHeadId === familyId);
        }
    }

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'Overdue') {
        filtered = filtered.filter(task => isOverdue(task));
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }
    
    return filtered;
  }, [tasks, effectiveUser, allRms, statusFilter, clientFilter, clientOptions]);


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

  const handleStatusFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'All') {
        params.delete('status');
    } else {
        params.set('status', value);
    }
    router.push(`/tasks?${params.toString()}`);
  };

  const handleClientFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
        params.delete('client');
    } else {
        params.set('client', value);
    }
    router.push(`/tasks?${params.toString()}`);
  };

  const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];

  if (!canView) {
      return (
          <Card>
              <CardHeader>
                  <h1 className="text-3xl font-bold font-headline">Access Denied</h1>
              </CardHeader>
              <CardContent><p>You do not have permission to view this page.</p></CardContent>
          </Card>
      );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold font-headline">
                {statusFilter ? `${statusFilter} Tasks` : 'Task Management'}
              </h1>
              <p className="text-muted-foreground">
                 {statusFilter 
                  ? `A list of all tasks with the status "${statusFilter}".` 
                  : 'A comprehensive list of all tasks.'
                }
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
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h2 className="text-xl font-semibold">{statusFilter ? 'Filtered Tasks' : 'All Tasks'}</h2>
                    <p className="text-muted-foreground">
                    This is a prototype. Tasks are stored in memory and will be cleared on page refresh.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-full max-w-[400px]">
                        <Combobox
                            options={clientOptions}
                            value={clientFilter || 'all'}
                            onChange={handleClientFilterChange}
                            placeholder="Filter by client..."
                            searchPlaceholder="Search clients..."
                        />
                    </div>
                    <div className="w-full max-w-[200px]">
                        <Select onValueChange={handleStatusFilterChange} value={statusFilter || 'All'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                                {TASK_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
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
                      No tasks found.
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



