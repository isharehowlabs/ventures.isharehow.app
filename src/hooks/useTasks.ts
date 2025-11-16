import { useState, useEffect } from 'react';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';

export interface Task {
  id: string;
  title: string;
  description: string;
  hyperlinks: string[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// Hook for team tasks
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks`, {
        method: 'GET',
      });

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch tasks';
      setError(message);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (title: string, description: string, hyperlinks: string[], status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, description, hyperlinks, status }),
      });

      const data = await response.json();
      await fetchTasks(); // Refresh list
      return data.task;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'hyperlinks' | 'status'>>) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      await fetchTasks();
      return data.task;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      await fetchWithErrorHandling(`${backendUrl}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      await fetchTasks();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

