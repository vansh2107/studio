
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TaskStatus, TaskCategory } from '@/lib/constants';
import { format } from 'date-fns';

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
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createDate' | 'status'>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Omit<Task, 'id' | 'createDate' | 'status'>) => {
    const newTask: Task = {
        ...task,
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

          // Auto-populate startDate
          if (updatedTask.status === 'In Progress' && !task.startDate) {
            combined.startDate = new Date().toISOString();
          }

          // Auto-populate completeDate
          const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];
          if (updatedTask.status && terminalStatuses.includes(updatedTask.status) && !task.completeDate) {
              combined.completeDate = new Date().toISOString();
          }

          return combined;
        }
        return task;
      })
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask }}>
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
