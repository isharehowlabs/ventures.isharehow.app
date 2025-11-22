import { useState, useEffect, useCallback } from 'react';
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
  userId?: string;
  userRole?: string;
}

// Hook for team tasks with real-time updates
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks`, {
        method: 'GET',
      });

      // Check for 401 authentication error
      if (response.status === 401) {
        setAuthRequired(true);
        setError('Authentication required');
        setTasks([]);
        return;
      }

      const data = await response.json();
      setTasks(data.tasks || []);
      setLastUpdated(new Date());
      setIsStale(false);
    } catch (err: any) {
      // Check if it's an auth error
      if (err?.status === 401 || err?.message?.includes('Authentication required')) {
        setAuthRequired(true);
        setError('Authentication required');
        setTasks([]);
      } else {
        const message = err?.message || 'Failed to fetch tasks';
        setError(message);
        console.error('Error fetching tasks:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    return fetchTasks();
  }, [fetchTasks]);

  const createTask = async (title: string, description: string, hyperlinks: string[], status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, description, hyperlinks, status }),
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error('Authentication required');
      }

      const data = await response.json();
      // Real-time update will be handled by socket
      return data.task;
    } catch (err: any) {
      if (err?.status === 401 || err?.message?.includes('Authentication required')) {
        setAuthRequired(true);
      }
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
      setAuthRequired(false);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error('Authentication required');
      }

      const data = await response.json();
      // Real-time update will be handled by socket
      return data.task;
    } catch (err: any) {
      if (err?.status === 401 || err?.message?.includes('Authentication required')) {
        setAuthRequired(true);
      }
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
      setAuthRequired(false);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error('Authentication required');
      }
      // Real-time update will be handled by socket
    } catch (err: any) {
      if (err?.status === 401 || err?.message?.includes('Authentication required')) {
        setAuthRequired(true);
      }
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
      setLastUpdated(new Date());
    });

    socketInstance.on('task_updated', (updatedTask: Task) => {
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
      setLastUpdated(new Date());
    });

    socketInstance.on('task_deleted', (data: { id: string }) => {
      setTasks(prev => prev.filter(task => task.id !== data.id));
      setLastUpdated(new Date());
    });

    // Listen for auth restoration
    socketInstance.on('auth_restored_ack', () => {
      setAuthRequired(false);
      fetchTasks();
    });

    // Mark data as stale after 5 minutes
    const staleInterval = setInterval(() => {
      if (lastUpdated && Date.now() - lastUpdated.getTime() > 5 * 60 * 1000) {
        setIsStale(true);
      }
    }, 60000); // Check every minute

    return () => {
      socketInstance.disconnect();
      clearInterval(staleInterval);
    };
  }, [fetchTasks, lastUpdated]);

  return {
    tasks,
    isLoading,
    error,
    authRequired,
    isStale,
    lastUpdated,
    refresh,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
