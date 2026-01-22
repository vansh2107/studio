
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { TaskStatus, TaskCategory } from '@/lib/constants';
import { useCurrentUser } from './use-current-user';
import type { Task, TimelineEvent } from '@/lib/types';

export type { TaskStatus, TaskCategory, Task };

const TASKS_STORAGE_KEY = 'finarray-tasks';

// Function to safely get tasks from localStorage
const getInitialTasks = (): Task[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error("Failed to parse tasks from localStorage", error);
    return [];
  }
};


interface TaskContextType {
  tasks: Task[];
  addTask: (task: Partial<Omit<Task, 'id'>>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { effectiveUser } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);

  // Effect to save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  const addTask = (taskDetails: Partial<Omit<Task, 'id'>>) => {
    const now = new Date().toISOString();
    const creationEvent: TimelineEvent = {
        id: `event-${Date.now()}`,
        eventType: 'TASK_CREATED',
        title: 'Task Created',
        description: `Task created with category "${taskDetails.category}".`,
        performedBy: effectiveUser?.name || 'System',
        timestamp: now,
    };

    const newTask: Task = {
      id: `task-${Date.now()}`,
      status: 'Pending',
      createDate: new Date().toISOString(),
      clientName: 'N/A', 
      category: 'N/A',
      dueDate: new Date().toISOString(),
      clientId: '',
      ...taskDetails,
      timelineEvents: [creationEvent],
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, updatedTaskData: Partial<Omit<Task, 'id'>>) => {
    const now = new Date().toISOString();
    const performedBy = effectiveUser?.name || 'System';

    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newEvents: TimelineEvent[] = [];

          // Status Change
          if (updatedTaskData.status && updatedTaskData.status !== task.status) {
            const isReopen = ['Completed', 'Cancelled', 'Rejected'].includes(task.status) && !['Completed', 'Cancelled', 'Rejected'].includes(updatedTaskData.status);
            
            if (isReopen) {
                newEvents.push({ id: `event-${Date.now()}-${Math.random()}`, eventType: 'TASK_REOPENED', title: 'Task Re-opened', description: `Status changed from "${task.status}" to "${updatedTaskData.status}".`, performedBy, timestamp: now });
            } else if (updatedTaskData.status === 'Completed') {
                newEvents.push({ id: `event-${Date.now()}-${Math.random()}`, eventType: 'TASK_COMPLETED', title: 'Task Completed', description: `Status set to "Completed".`, performedBy, timestamp: now });
            } else {
                newEvents.push({ id: `event-${Date.now()}-${Math.random()}`, eventType: 'STATUS_CHANGED', title: 'Status Updated', description: `Status changed from "${task.status}" to "${updatedTaskData.status}".`, performedBy, timestamp: now });
            }
          }

          // Task RM Assignment
          if (updatedTaskData.taskRM && updatedTaskData.taskRM !== task.taskRM) {
              newEvents.push({ id: `event-${Date.now()}-${Math.random()}`, eventType: 'TASK_RM_ASSIGNED', title: `Assigned to ${updatedTaskData.taskRM}`, description: `Task has been assigned.`, performedBy, timestamp: now });
          }

          // Task RM Status Change
          if (updatedTaskData.taskRMStatus && updatedTaskData.taskRMStatus !== task.taskRMStatus) {
              const taskRmName = updatedTaskData.taskRM || task.taskRM;
              newEvents.push({ id: `event-${Date.now()}-${Math.random()}`, eventType: 'STATUS_CHANGED', title: 'Status Updated', description: `${taskRmName} status changed to "${updatedTaskData.taskRMStatus}".`, performedBy, timestamp: now });
          }

          // If other details were changed without a specific event, add a generic one
          if (Object.keys(updatedTaskData).length > 0 && newEvents.length === 0) {
              newEvents.push({ id: `event-${Date.now()}-${Math.random()}`, eventType: 'FIELD_UPDATED', title: 'Task Details Updated', description: 'One or more fields were modified.', performedBy, timestamp: now });
          }

          const combined: Task = {
            ...task,
            ...updatedTaskData,
            timelineEvents: [...(task.timelineEvents || []), ...newEvents].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
            mutualFund: updatedTaskData.mutualFund ?? task.mutualFund,
            insurance: updatedTaskData.insurance ?? task.insurance,
            generalInsuranceTask: updatedTaskData.generalInsuranceTask ?? task.generalInsuranceTask,
            stocksTask: updatedTaskData.stocksTask ?? task.stocksTask,
            fdTask: updatedTaskData.fdTask ?? task.fdTask,
            bondsTask: updatedTaskData.bondsTask ?? task.bondsTask,
            ppfTask: updatedTaskData.ppfTask ?? task.ppfTask,
            physicalToDematTask: updatedTaskData.physicalToDematTask ?? task.physicalToDematTask,
          };
          
          const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];
          if (updatedTaskData.status) {
            // Auto-populate startDate
            if (updatedTaskData.status === 'In Progress' && !task.startDate) {
              combined.startDate = now;
            }

            // SUPER_ADMIN can reopen a task, which should clear the completeDate
            if (updatedTaskData.status === 'In Progress' && effectiveUser?.role === 'SUPER_ADMIN') {
                combined.completeDate = null;
            }

            // Auto-populate completeDate for terminal statuses
            if (terminalStatuses.includes(updatedTaskData.status) && !task.completeDate) {
                combined.completeDate = now;
            }
          }

          return combined;
        }
        return task;
      })
    );
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
