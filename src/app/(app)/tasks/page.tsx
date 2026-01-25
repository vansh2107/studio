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
import { useTasks, type Task } from '@/hooks/use-tasks';
import { TASK_STATUSES, type TaskStatus } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Download, AlertTriangle } from 'lucide-react';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import type { TaskFormData } from '@/components/tasks/create-task-modal';
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
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/is-overdue';
import { getAllClients, familyMembers, getAllRMs } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { InteractiveAssetCardViewer } from '@/components/dashboards/InteractiveAssetCardViewer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClipboardList } from 'lucide-react';

const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
};

const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
      if (dateString.includes(' ')) {
          const parsedDate = new Date(dateString.replace(/-/g, '/'));
          if (!isNaN(parsedDate.getTime())) {
              return format(parsedDate, 'dd MMM yy, h:mm a');
          }
      }
      return format(parseISO(dateString), 'dd MMM yy, h:mm a');
    } catch {
      return dateString;
    }
};

const getStatusBadgeVariant = (status: string) => {
    const lowerCaseStatus = status.toLowerCase();
    if (lowerCaseStatus.includes('completed') || lowerCaseStatus.includes('received') || lowerCaseStatus.includes('done') || lowerCaseStatus.includes('credited')) return 'default';
    if (lowerCaseStatus.includes('pending')) return 'secondary';
    if (lowerCaseStatus.includes('in progress')) return 'secondary';
    return 'outline';
};

const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};


export default function TasksPage() {
  const { effectiveUser, hasPermission } = useCurrentUser();
  const { toast } = useToast();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
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

    const members = familyMembers.map(m => {
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

    if (clientFilter && clientFilter !== 'all') {
        const selectedOption = clientOptions.find(opt => opt.value === clientFilter);
        const familyId = (selectedOption as any)?.clientId || selectedOption?.value;
        if (familyId) {
            filtered = filtered.filter(task => task.familyHeadId === familyId);
        }
    }

    if (statusFilter) {
      if (statusFilter === 'Overdue') {
        filtered = filtered.filter(task => isOverdue(task));
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }
    
    return filtered;
  }, [tasks, effectiveUser, allRms, statusFilter, clientFilter, clientOptions]);

  const tasksByClient = useMemo(() => {
    const clientTasks: Record<string, { clientName: string; tasks: Task[] }> = {};

    filteredTasks.forEach(task => {
      const key = task.clientName || 'Unassigned';
        if (!clientTasks[key]) {
            clientTasks[key] = {
                clientName: key,
                tasks: []
            };
        }
        clientTasks[key].tasks.push(task);
    });

    return Object.values(clientTasks).map(group => ({
        ...group,
        id: group.tasks[0].clientId,
        overdueCount: group.tasks.filter(isOverdue).length,
    }));
  }, [filteredTasks]);

  type GroupedTasks = (typeof tasksByClient)[0];

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

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    toast({
        title: 'Task Deleted',
        description: `The task for "${taskToDelete.clientName}" has been deleted.`,
    });
    setTaskToDelete(null);
  };
  
  const handleExport = () => {
    const dataToExport = filteredTasks.map(task => ({
        'Task ID': task.id,
        'Client Name': task.clientName,
        'Category': task.category,
        'Assigned RM': task.rmName || 'N/A',
        'Create Date': task.createDate ? formatDate(task.createDate) : 'N/A',
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

  const TaskCardFront = ({ item, isExpanded }: { item: GroupedTasks; isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-primary to-accent", isExpanded && "rounded-xl")}>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarFallback>{getInitials(item.clientName)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-xl">{item.clientName}</CardTitle>
                    <CardDescription className="text-primary-foreground/80 pt-1">{item.tasks.length} tasks</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {item.overdueCount > 0 && (
                <div className="flex items-center gap-2 text-destructive-foreground font-bold bg-destructive/80 p-2 rounded-md">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{item.overdueCount} Overdue</span>
                </div>
            )}
             {!isExpanded && <p className="text-sm mt-4 text-primary-foreground/70">Click to view details</p>}
        </CardContent>
    </Card>
  );

  const TaskCardBack = ({ item, onEdit, onDelete }: { item: GroupedTasks; onEdit: (task: Task) => void; onDelete: (task: Task) => void; }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>Tasks for {item.clientName}</CardTitle>
            <CardDescription>Detailed list of all assigned tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {item.tasks.map(task => {
                        const descriptionContent = task.insurance?.policyNo || task.mutualFund?.folioNo || task.description;
                        const overdue = isOverdue(task);
                        const isTerminal = terminalStatuses.includes(task.status);
                        const canEditTask = isSuperAdmin || !isTerminal;

                        return (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.category}</TableCell>
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
                                    <Badge variant={overdue ? 'destructive' : getStatusBadgeVariant(task.status)}>
                                        {overdue ? 'Overdue' : task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {canUpdate && (
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" onClick={() => onEdit(task)} disabled={!canEditTask}>
                                                      <Edit className="h-4 w-4" />
                                                  </Button>
                                              </TooltipTrigger>
                                              <TooltipContent><p>{canEditTask ? 'Edit Task' : 'Cannot edit locked task'}</p></TooltipContent>
                                          </Tooltip>
                                      )}
                                      {canDelete && (
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => onDelete(task)} disabled={!canEditTask}>
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
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
    </div>
  );

  if (!canView) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
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
              <h1 className="text-3xl font-bold font-headline">Task Management</h1>
              <p className="text-muted-foreground">A comprehensive list of all tasks, grouped by client.</p>
            </div>
            <div className="flex items-center gap-2">
             {isSuperAdmin && (
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            )}
             {canCreate && (
                <Button onClick={handleOpenCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            )}
            </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-xl font-semibold">Client Tasks</h2>
                  <p className="text-muted-foreground">Click on a card to view and manage tasks for that client.</p>
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
            {tasksByClient.length > 0 ? (
                <InteractiveAssetCardViewer
                    items={tasksByClient}
                    renderCardFront={(item, isExpanded) => <TaskCardFront item={item} isExpanded={isExpanded} />}
                    renderCardBack={(item) => <TaskCardBack item={item} onEdit={handleOpenEditModal} onDelete={setTaskToDelete} />}
                    layoutIdPrefix="task-card"
                    expandedCardClassName="w-[75vw] h-[75vh]"
                />
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    <ClipboardList className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Tasks Found</h3>
                    <p className="mt-1 text-sm">No tasks match the current filters.</p>
                </div>
            )}
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
    

    
