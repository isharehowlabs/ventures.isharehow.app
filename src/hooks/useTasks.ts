import { useState, useEffect } from 'react';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';
import { io, Socket } from 'socket.io-client';

export interface Task {
  id: string;
  title: string;
  description: string;
  hyperlinks: string[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// Hook for team tasks with real-time updates
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

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
      // Real-time update will be handled by socket
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
      // Real-time update will be handled by socket
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
      // Real-time update will be handled by socket
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Initialize Socket.IO connection
    const backendUrl = getBackendUrl();
    const socketInstance = io(backendUrl);
    setSocket(socketInstance);

    socketInstance.on('task_created', (newTask: Task) => {
      setTasks(prev => [...prev, newTask]);
    });

    socketInstance.on('task_updated', (updatedTask: Task) => {
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    });

    socketInstance.on('task_deleted', (data: { id: string }) => {
      setTasks(prev => prev.filter(task => task.id !== data.id));
    });

    return () => {
      socketInstance.disconnect();
    };
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

