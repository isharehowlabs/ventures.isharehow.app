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
  category?: 'work' | 'creative' | 'wellness' | 'rise'; // Task category
  supportRequestId?: string; // Link to support request (deprecated, use linkedEntityType/id)
  linkedEntityType?: 'venture' | 'client' | 'employee' | 'rise_journey' | 'rise_journal' | 'support_request'; // Polymorphic entity type
  linkedEntityId?: string; // Polymorphic entity ID
  createdBy?: string; // User ID who created the task
  createdByName?: string; // Display name of creator
  assignedTo?: string; // User ID assigned to the task
  assignedToName?: string; // Display name of assigned user
  notes?: string; // Collaborative notes
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  userRole?: string;
}

// Hook for team tasks with real-time updates
export function useTasks(onTaskAssigned?: (task: Task, assignedToUserId: string) => void) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const onTaskAssignedRef = useRef<((task: Task, assignedToUserId: string) => void) | undefined>(onTaskAssigned);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const lastUpdatedRef = useRef<Date | null>(null);
  const deletingTasksRef = useRef<Set<string>>(new Set()); // Track tasks being deleted to prevent duplicates

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

  const createTask = async (title: string, description: string, hyperlinks: string[], status: string, assignedTo?: string, assignedToName?: string, notes?: string) => {
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
      console.log('Creating task at:', `${backendUrl}/api/tasks`, { title, description, hyperlinks, status, notes });
      
      const response = await fetchWithErrorHandling(`${backendUrl}/api/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, description, hyperlinks, status, assignedTo, assignedToName, notes: notes || '' }),
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

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'hyperlinks' | 'status' | 'category' | 'supportRequestId' | 'linkedEntityType' | 'linkedEntityId' | 'assignedTo' | 'assignedToName' | 'notes'>>) => {
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
    // Prevent duplicate deletion attempts
    if (deletingTasksRef.current.has(id)) {
      console.warn(`Task ${id} is already being deleted, ignoring duplicate request`);
      return;
    }

    // Store the task being deleted for potential rollback
    let deletedTask: Task | undefined;
    setTasks(prev => {
      deletedTask = prev.find(t => t.id === id);
      return prev.filter(t => t.id !== id);
    });

    // Mark as deleting
    deletingTasksRef.current.add(id);

    try {
      setIsLoading(true);
      setError(null);
      setAuthRequired(false);
      const backendUrl = getTasksBackendUrl();
      
      // Use direct fetch to have better control over error handling
      const response = await fetch(`${backendUrl}/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        let errorMessage = `Failed to delete task: Server returned ${response.status} ${response.statusText}`;
        try {
          // Read response as text first (can only read once)
          const responseText = await response.text();
          
          if (responseText && responseText.trim()) {
            // Try to parse as JSON
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
              // Not JSON, use the text as error message
              errorMessage = responseText;
            }
          }
        } catch (e) {
          // If reading fails, use the default message with status
          console.warn('Could not read error response:', e);
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      // Success - task already removed optimistically, socket will confirm
      // Real-time update will be handled by socket
    } catch (err: any) {
      console.error('Error deleting task:', err);
      
      // Revert optimistic update on error
      if (deletedTask) {
        setTasks(prev => {
          const exists = prev.some(t => t.id === deletedTask!.id);
          if (!exists) {
            return [...prev, deletedTask!];
          }
          return prev;
        });
      }

      if (err?.status === 401 || err?.message?.includes('Authentication required')) {
        setAuthRequired(true);
      }
      const errorMessage = err?.message || 'Failed to delete task. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
      deletingTasksRef.current.delete(id);
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


    socketInstance.on('task_notes_updated', (data: { task_id: string; notes: string }) => {
      if (!isMounted) return;
      const now = new Date();
      setTasks(prev => prev.map(task => 
        task.id === data.task_id ? { ...task, notes: data.notes } : task
      ));
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
      
      // Notify parent component if callback provided
      if (onTaskAssignedRef.current) {
        onTaskAssignedRef.current(data.task, data.assignedTo);
      }
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
      socketInstance.off('task_notes_updated');
      socketInstance.off('auth_restored_ack');
      clearInterval(staleInterval);
    };
  }, [fetchTasks]); // Removed lastUpdated from dependencies to prevent infinite loop

  // Keep ref updated with latest callback
  useEffect(() => {
    onTaskAssignedRef.current = onTaskAssigned;
  }, [onTaskAssigned]);


  const updateTaskNotes = (id: string, notes: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, notes } : t
    ));
    
    // Emit socket event for real-time sync
    if (socket) {
      socket.emit('task_notes_update', {
        task_id: id,
        notes,
        user_id: null // Will be set by backend from session
      });
    }
  };
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
    updateTaskNotes,
  };
}
