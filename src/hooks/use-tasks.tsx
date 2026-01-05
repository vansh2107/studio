
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TaskStatus, TaskCategory } from '@/lib/constants';
import { format } from 'date-fns';
import { useCurrentUser } from './use-current-user';

export type { TaskStatus, TaskCategory };

export interface Task {
  id: string;
  clientName: string;
  category: string;
  rmName: string;
  dueDate: string; // Should be in a format parsable by new Date()
  status: TaskStatus;
  description?: string;
  createDate: string;
  startDate?: string | null;
  completeDate?: string | null;
  mutualFund?: {
    familyHead: string;
    service: string;
    folioNo: string;
    nameOfAMC: string;
    amount: number;
    documentStatus: "Received" | "Pending";
    signatureStatus: "Done" | "Pending";
  }
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Partial<Omit<Task, 'id' | 'createDate' | 'status' | 'startDate' | 'completeDate'>>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { effectiveUser } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Partial<Omit<Task, 'id' | 'createDate' | 'status' | 'startDate' | 'completeDate'>>) => {
    const newTask: Task = {
        clientName: task.clientName || 'N/A',
        category: task.category || 'N/A',
        rmName: task.rmName || 'N/A',
        dueDate: task.dueDate || new Date().toISOString(),
        description: task.description,
        mutualFund: task.mutualFund,
        id: `task-${Date.now()}`,
        status: 'Pending',
        createDate: new Date().toISOString(),
        startDate: null,
        completeDate: null,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const combined = { ...task, ...updatedTask };
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
