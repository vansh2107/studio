
'use client';

import { useState, useMemo } from 'react';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
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
import { format, parseISO, parse, isPast } from 'date-fns';
import { cn } from '@/lib/utils';


export default function TasksPage() {
  const { effectiveUser, hasPermission } = useCurrentUser();
  const { toast } = useToast();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const canView = hasPermission('TASK', 'view');
  const canCreate = hasPermission('TASK', 'create');
  const canUpdate = hasPermission('TASK', 'edit');
  const canDelete = hasPermission('TASK', 'delete');
  const isSuperAdmin = effectiveUser?.role === 'SUPER_ADMIN';

  const getStatusBadgeVariant = (status: string) => {
    const lowerCaseStatus = status.toLowerCase();
    if (lowerCaseStatus.includes('completed') || lowerCaseStatus.includes('received') || lowerCaseStatus.includes('done') || lowerCaseStatus.includes('credited')) return 'default';
    if (lowerCaseStatus.includes('pending')) return 'destructive';
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

  const handleSaveTask = (task: Omit<Task, 'id' | 'createDate' | 'status'> & { id?: string }) => {
    if (task.id) {
        updateTask(task.id, task);
    } else {
        addTask(task as Omit<Task, 'id' | 'createDate' | 'status'>);
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
        // Handle 'dd-MM-yyyy HH:mm' from chatbot
        if (dateString.includes(' ')) {
            const parsedDate = parse(dateString, 'dd-MM-yyyy HH:mm', new Date());
            if (!isNaN(parsedDate.getTime())) {
                return format(parsedDate, 'dd MMM yyyy, h:mm a');
            }
        }
      // Handle ISO string from datetime-local input
      return format(parseISO(dateString), 'dd MMM yyyy, h:mm a');
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };
  
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>RM</TableHead>
                  <TableHead>Create Date</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Complete Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Doc Status</TableHead>
                  <TableHead>Sig Status</TableHead>
                   <TableHead>Amount Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const isOverdue = task.status !== 'Completed' && task.dueDate && isPast(parseISO(task.dueDate));
                    const isTerminal = terminalStatuses.includes(task.status);
                    const canEditTask = isSuperAdmin || !isTerminal;

                    const descriptionContent = task.insurance?.policyNo || task.mutualFund?.folioNo || task.description;

                    return (
                        <TableRow key={task.id} className={cn(isOverdue && 'text-destructive')}>
                          <TableCell className="font-medium">{task.clientName}</TableCell>
                          <TableCell>{task.category}</TableCell>
                          <TableCell>{task.rmName}</TableCell>
                          <TableCell>
                            <Tooltip>
                                <TooltipTrigger>{task.createDate ? format(parseISO(task.createDate), 'dd MMM yyyy') : '—'}</TooltipTrigger>
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
                                        variant={getStatusBadgeVariant(task.status)}
                                        className={cn((canUpdate && canEditTask) ? "cursor-pointer" : "cursor-not-allowed", isOverdue && 'border-destructive')}
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
                            {task.insurance?.amountStatus ? (
                              <Badge variant={getStatusBadgeVariant(task.insurance.amountStatus)}>
                                {task.insurance.amountStatus}
                              </Badge>
                            ) : '—'}
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
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} className="h-24 text-center">
                      No tasks created yet. Try the chatbot or the 'Add Task' button!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <CreateTaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      </Modal>

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

    