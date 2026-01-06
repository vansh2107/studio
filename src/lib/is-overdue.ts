import { Task } from './types';
import { isPast, parseISO } from 'date-fns';

export function isOverdue(task: Task): boolean {
  if (!task?.dueDate) return false;

  const finishedStatuses = ["Completed", "Cancelled", "Rejected"];
  if (finishedStatuses.includes(task.status)) {
    return false;
  }

  try {
    const due = parseISO(task.dueDate);
    return isPast(due);
  } catch (e) {
    // Handle cases where dueDate might not be a valid ISO string
    // from older task creation methods.
    try {
        const parsedDate = new Date(task.dueDate.replace(/-/g, '/'));
        if (!isNaN(parsedDate.getTime())) {
            return isPast(parsedDate);
        }
    } catch {}
    return false;
  }
}
