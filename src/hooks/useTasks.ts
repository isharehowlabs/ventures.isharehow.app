import { useState, useEffect, useCallback, useRef } from 'react';
import { getTasksBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';
import { getTasksSocket } from '../utils/socket';
import { Socket } from 'socket.io-client';

export interface Task {
  id: string;
  title: string;
  description: string;
  hyperlinks: string[];
  status: 'pending' | 'in-progress' | 'completed';
  supportRequestId?: string; // Link to support request
  createdBy?: string; // User ID who created the task
  createdByName?: string; // Display name of creator
  assignedTo?: string; // User ID assigned to the task
  assignedToName?: string; // Display name of assigned user
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
  const lastUpdatedRef = useRef<Date | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);
      const backendUrl = getTasksBackendUrl();
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
      const now = new Date();
      setTasks(data.tasks || []);
      setLastUpdated(now);
      lastUpdatedRef.current = now;
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

  const createTask = async (title: string, description: string, hyperlinks: string[], status: string, assignedTo?: string, assignedToName?: string) => {
    // Prevent duplicate calls
    if (isLoading) {
      console.warn('Task creation already in progress, ignoring duplicate call');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);
      const backendUrl = getTasksBackendUrl();
      console.log('Creating task at:', `${backendUrl}/api/tasks`, { title, description, hyperlinks, status });
      
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, description, hyperlinks, status, assignedTo, assignedToName }),
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const newTask = data.task;
      
      if (!newTask) {
        throw new Error('Server did not return a task');
      }

      console.log('Task created, adding to state:', newTask);
      
      // Add task optimistically to local state immediately
      // Socket event will update it if needed, but this ensures UI updates right away
      const now = new Date();
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
      setLastUpdated(now);
      lastUpdatedRef.current = now;
      
      return newTask;
    } catch (err: any) {
      console.error('Error in createTask:', err);
      if (err?.status === 401 || err?.message?.includes('Authentication required')) {
        setAuthRequired(true);
      }
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'hyperlinks' | 'status' | 'supportRequestId' | 'assignedTo' | 'assignedToName'>>) => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);
      const backendUrl = getTasksBackendUrl();
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
      const now = new Date();
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
      setLastUpdated(now);
      lastUpdatedRef.current = now;
      
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
      const backendUrl = getTasksBackendUrl();
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
    let isMounted = true;
    let fetchTimeout: NodeJS.Timeout | null = null;

    // Initial fetch
    const doFetch = () => {
      if (isMounted) {
        fetchTasks();
      }
    };
    
    doFetch();

    // Use tasks-specific Socket.IO connection (separate from Web3/main backend)
    const socketInstance = getTasksSocket();
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
      if (!isMounted) return;
      const now = new Date();
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
      setLastUpdated(now);
      lastUpdatedRef.current = now;
    });

    socketInstance.on('task_updated', (updatedTask: Task) => {
      if (!isMounted) return;
      const now = new Date();
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
      setLastUpdated(now);
      lastUpdatedRef.current = now;
    });

    socketInstance.on('task_deleted', (data: { id: string }) => {
      if (!isMounted) return;
      const now = new Date();
      setTasks(prev => prev.filter(task => task.id !== data.id));
      setLastUpdated(now);
      lastUpdatedRef.current = now;
    });

    socketInstance.on('task_assigned', (data: { task: Task; assignedTo: string; assignedToName?: string }) => {
      if (!isMounted) return;
      console.log('Task assigned notification:', data);
      // Update the task in the list
      const now = new Date();
      setTasks(prev => prev.map(task => task.id === data.task.id ? data.task : task));
      setLastUpdated(now);
      lastUpdatedRef.current = now;
    });

    // Listen for auth restoration
    socketInstance.on('auth_restored_ack', () => {
      if (!isMounted) return;
      setAuthRequired(false);
      fetchTasks();
    });

    // Mark data as stale after 5 minutes (check every minute)
    const staleInterval = setInterval(() => {
      if (!isMounted) return;
      const lastUpdate = lastUpdatedRef.current;
      if (lastUpdate && Date.now() - lastUpdate.getTime() > 5 * 60 * 1000) {
        setIsStale(true);
      }
    }, 60000);

    return () => {
      isMounted = false;
      if (fetchTimeout) clearTimeout(fetchTimeout);
      // Only remove task-specific listeners, keep the socket connection alive
      socketInstance.off('connect', handleConnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('task_created');
      socketInstance.off('task_updated');
      socketInstance.off('task_deleted');
      socketInstance.off('task_assigned');
      socketInstance.off('auth_restored_ack');
      clearInterval(staleInterval);
    };
  }, [fetchTasks]); // Removed lastUpdated from dependencies to prevent infinite loop

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
