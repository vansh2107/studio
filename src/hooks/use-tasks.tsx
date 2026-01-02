
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TaskStatus, TaskCategory } from '@/lib/constants';

export type { TaskStatus, TaskCategory };

export interface Task {
  id: string;
  clientName: string;
  category: string;
  rmName: string;
  dueDate: string;
  status: TaskStatus;
  description?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const updateTask = (taskId: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
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
