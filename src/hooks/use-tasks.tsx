
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { TaskStatus, TaskCategory } from '@/lib/constants';
import { useCurrentUser } from './use-current-user';
import type { Task } from '@/lib/types';

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
    const newTask: Task = {
      id: `task-${Date.now()}`,
      status: 'Pending',
      createDate: new Date().toISOString(),
      // The modal now provides these, but have fallbacks just in case.
      clientName: 'N/A', 
      category: 'N/A',
      dueDate: new Date().toISOString(),
      clientId: '',
      ...taskDetails,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const combined: Task = {
            ...task,
            ...updatedTask,
            // PRESERVE ALL NESTED CATEGORY DATA
            mutualFund: updatedTask.mutualFund ?? task.mutualFund,
            insurance: updatedTask.insurance ?? task.insurance,
            generalInsuranceTask:
              updatedTask.generalInsuranceTask ?? task.generalInsuranceTask,
            stocksTask: updatedTask.stocksTask ?? task.stocksTask,
            fdTask: updatedTask.fdTask ?? task.fdTask,
            bondsTask: updatedTask.bondsTask ?? task.bondsTask,
            ppfTask: updatedTask.ppfTask ?? task.ppfTask,
            physicalToDematTask:
              updatedTask.physicalToDematTask ?? task.physicalToDematTask,
          };
          
          const now = new Date().toISOString();

          // Auto-populate startDate
          if (updatedTask.status === 'In Progress' && !task.startDate) {
            combined.startDate = now;
          }

          // SUPER_ADMIN can reopen a task, which should clear the completeDate
          if (updatedTask.status === 'In Progress' && effectiveUser?.role === 'SUPER_ADMIN') {
              combined.completeDate = null;
          }

          // Auto-populate completeDate for terminal statuses
          const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];
          if (updatedTask.status && terminalStatuses.includes(updatedTask.status) && !task.completeDate) {
              combined.completeDate = now;
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
