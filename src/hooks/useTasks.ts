import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';
import { getSocket } from '../utils/socket';
import { Socket } from 'socket.io-client';

export interface Task {
  id: string;
  title: string;
  description: string;
  hyperlinks: string[];
  status: 'pending' | 'in-progress' | 'completed';
  supportRequestId?: string; // Link to support request
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
      const newTask = data.task;
      
      // Add task optimistically to local state immediately
      // Socket event will update it if needed, but this ensures UI updates right away
      setTasks(prev => {
        // Check if task already exists (from socket event)
        const exists = prev.some(t => t.id === newTask.id);
        if (exists) {
          // Update existing task
          return prev.map(t => t.id === newTask.id ? newTask : t);
        }
        // Add new task
        return [...prev, newTask];
      });
      setLastUpdated(new Date());
      
      return newTask;
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

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'hyperlinks' | 'status' | 'supportRequestId'>>) => {
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
      const updatedTask = data.task;
      
      // Update task optimistically in local state immediately
      // Socket event will update it if needed, but this ensures UI updates right away
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
      setLastUpdated(new Date());
      
      return updatedTask;
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

    // Use shared Socket.IO connection
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Connection event handlers (additional to shared handlers)
    const handleConnect = () => {
      console.log('Socket.io connected for tasks');
    };

    const handleConnectError = (error: Error) => {
      console.warn('Socket.io connection error (tasks):', {
        message: error.message,
        // Additional context if available
      });
      // Don't show error to user, just log it
      // The app will work without real-time updates
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket.io disconnected (tasks):', reason);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('connect_error', handleConnectError);
    socketInstance.on('disconnect', handleDisconnect);

    // Task event handlers
    socketInstance.on('task_created', (newTask: Task) => {
      setTasks(prev => {
        // Check if task already exists (from optimistic update)
        const exists = prev.some(t => t.id === newTask.id);
        if (exists) {
          // Update existing task with server data
          return prev.map(t => t.id === newTask.id ? newTask : t);
        }
        // Add new task
        return [...prev, newTask];
      });
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
      // Only remove task-specific listeners, keep the socket connection alive
      socketInstance.off('connect', handleConnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('task_created');
      socketInstance.off('task_updated');
      socketInstance.off('task_deleted');
      socketInstance.off('auth_restored_ack');
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
