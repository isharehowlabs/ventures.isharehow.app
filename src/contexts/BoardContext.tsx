import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getFirebaseDatabase, isFirebaseConfigured } from '../config/firebase';
import { ref, onValue, set, push, remove, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';

// Types
export interface Stroke {
  id: string;
  type: 'stroke';
  points: number[];
  color: string;
  width: number;
  timestamp: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  timestamp: number;
}

export type CanvasAction = Stroke | Shape;

export interface CanvasState {
  version: number;
  lastUpdated: string;
  ownerId: string;
  actions: CanvasAction[];
  metadata: Record<string, any>;
}

export interface PresenceData {
  userId: string;
  name: string;
  avatar?: string;
  status: 'active' | 'idle' | 'offline';
  cursor?: { x: number; y: number };
  selection?: any;
  lastHeartbeat: string;
}

export interface BoardNotification {
  id: string;
  type: 'join' | 'leave' | 'update' | 'milestone';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  actor: {
    userId: string;
    name: string;
  };
  impact?: string;
}

export interface BoardContextValue {
  boardId: string | null;
  canvasState: CanvasState | null;
  presence: Map<string, PresenceData>;
  notifications: BoardNotification[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  actions: {
    setBoardId: (id: string) => void;
    addStroke: (stroke: Omit<Stroke, 'id' | 'timestamp'>) => void;
    addShape: (shape: Omit<Shape, 'id' | 'timestamp'>) => void;
    clearBoard: () => void;
    broadcastNotification: (notif: Omit<BoardNotification, 'id' | 'timestamp'>) => void;
    updatePresence: (status: PresenceData['status'], cursor?: { x: number; y: number }) => void;
    undo: () => void;
    redo: () => void;
  };
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
}

interface BoardProviderProps {
  children: ReactNode;
  userId: string;
  userName: string;
}

export function BoardProvider({ children, userId, userName }: BoardProviderProps) {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [presence, setPresence] = useState<Map<string, PresenceData>>(new Map());
  const [notifications, setNotifications] = useState<BoardNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFirebase, setUseFirebase] = useState(true);
  const [undoStack, setUndoStack] = useState<CanvasAction[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasAction[]>([]);

  // Initialize Firebase or fallback to REST API
  useEffect(() => {
    if (!boardId) return;

    let cleanupFunctions: (() => void)[] = [];
    let isMounted = true;

    const database = getFirebaseDatabase();
    const configured = isFirebaseConfigured();

    if (!configured || !database) {
      console.warn('Firebase not configured, using REST API fallback');
      setUseFirebase(false);
      fetchBoardSnapshot();
      return;
    }

    setUseFirebase(true);
    setIsLoading(true);
    setError(null);

    try {
      // Canvas state listener
      const canvasRef = ref(database, `boards/${boardId}/canvasState`);
      const unsubCanvas = onValue(canvasRef, (snapshot) => {
        if (!isMounted) return;
        const data = snapshot.val();
        if (data) {
          setCanvasState(data);
          setIsConnected(true);
        }
        setIsLoading(false);
      }, (error) => {
        if (!isMounted) return;
        console.error('Firebase canvas error:', error);
        setError('Failed to connect to Firebase');
        setUseFirebase(false);
        fetchBoardSnapshot();
      });
      cleanupFunctions.push(() => unsubCanvas());

      // Presence listener
      const presenceRef = ref(database, `boards/${boardId}/presence`);
      const unsubPresence = onValue(presenceRef, (snapshot) => {
        if (!isMounted) return;
        const data = snapshot.val();
        if (data) {
          const presenceMap = new Map<string, PresenceData>();
          Object.entries(data).forEach(([uid, presenceData]) => {
            presenceMap.set(uid, presenceData as PresenceData);
          });
          setPresence(presenceMap);
        }
      });
      cleanupFunctions.push(() => unsubPresence());

      // Notifications listener
      const notifRef = ref(database, `boards/${boardId}/notifications`);
      const unsubNotif = onValue(notifRef, (snapshot) => {
        if (!isMounted) return;
        const data = snapshot.val();
        if (data) {
          const notifArray = Object.values(data) as BoardNotification[];
          setNotifications(notifArray.slice(-20)); // Keep last 20
        }
      });
      cleanupFunctions.push(() => unsubNotif());
    } catch (error) {
      if (isMounted) {
        console.error('Error setting up Firebase listeners:', error);
        setError('Failed to setup Firebase listeners');
        setUseFirebase(false);
        fetchBoardSnapshot();
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      cleanupFunctions.forEach(cleanup => cleanup());
      cleanupFunctions = [];
    };
  }, [boardId, userId, userName]);

  const fetchBoardSnapshot = async () => {
    if (!boardId) return;

    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/boards/${boardId}/snapshot`, {
        method: 'GET',
        credentials: 'include', // Include cookies for JWT
      });

      if (response.ok) {
        const data = await response.json();
        setCanvasState(data.canvasState);
        setIsConnected(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        // If it's an auth error but we have userId/userName, continue with offline mode
        if (response.status === 401 && userId && userName) {
          console.warn('Authentication failed, using offline mode');
          setCanvasState({
            version: 0,
            lastUpdated: new Date().toISOString(),
            ownerId: userId,
            actions: [],
            metadata: {},
          });
          setIsConnected(false); // Mark as offline
        } else {
          setError(errorData.error || 'Failed to fetch board snapshot');
        }
      }
    } catch (err: any) {
      // If we have userId/userName, continue with offline mode
      if (userId && userName) {
        console.warn('Network error, using offline mode:', err);
        setCanvasState({
          version: 0,
          lastUpdated: new Date().toISOString(),
          ownerId: userId,
          actions: [],
          metadata: {},
        });
        setIsConnected(false);
      } else {
        setError(err.message || 'Failed to fetch board');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addStroke = useCallback((stroke: Omit<Stroke, 'id' | 'timestamp'>) => {
    if (!boardId) return;

    const newStroke: Stroke = {
      ...stroke,
      id: `stroke_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };

    if (useFirebase) {
      const database = getFirebaseDatabase();
      if (database) {
        const actionsRef = ref(database, `boards/${boardId}/canvasState/actions`);
        push(actionsRef, newStroke);
      }
    } else {
      // Update local state
      setCanvasState(prev => prev ? {
        ...prev,
        actions: [...prev.actions, newStroke],
        lastUpdated: new Date().toISOString(),
      } : null);
    }

    // Add to undo stack
    setUndoStack(prev => [...prev, newStroke]);
    setRedoStack([]);
  }, [boardId, useFirebase]);

  const addShape = useCallback((shape: Omit<Shape, 'id' | 'timestamp'>) => {
    if (!boardId) return;

    const newShape: Shape = {
      ...shape,
      id: `shape_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };

    if (useFirebase) {
      const database = getFirebaseDatabase();
      if (database) {
        const actionsRef = ref(database, `boards/${boardId}/canvasState/actions`);
        push(actionsRef, newShape);
      }
    } else {
      setCanvasState(prev => prev ? {
        ...prev,
        actions: [...prev.actions, newShape],
        lastUpdated: new Date().toISOString(),
      } : null);
    }

    setUndoStack(prev => [...prev, newShape]);
    setRedoStack([]);
  }, [boardId, useFirebase]);

  const clearBoard = useCallback(() => {
    if (!boardId) return;

    if (useFirebase) {
      const database = getFirebaseDatabase();
      if (database) {
        const actionsRef = ref(database, `boards/${boardId}/canvasState/actions`);
        set(actionsRef, []);
      }
    } else {
      setCanvasState(prev => prev ? {
        ...prev,
        actions: [],
        lastUpdated: new Date().toISOString(),
      } : null);
    }

    setUndoStack([]);
    setRedoStack([]);
  }, [boardId, useFirebase]);

  const broadcastNotification = useCallback((notif: Omit<BoardNotification, 'id' | 'timestamp'>) => {
    if (!boardId) return;

    const newNotif: BoardNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: Date.now(),
    };

    if (useFirebase) {
      const database = getFirebaseDatabase();
      if (database) {
        const notifRef = ref(database, `boards/${boardId}/notifications/${newNotif.id}`);
        set(notifRef, newNotif);
      }
    } else {
      setNotifications(prev => [...prev, newNotif].slice(-20));
    }
  }, [boardId, useFirebase]);

  const updatePresence = useCallback((status: PresenceData['status'], cursor?: { x: number; y: number }) => {
    if (!boardId) return;

    const presenceData: PresenceData = {
      userId,
      name: userName,
      status,
      cursor,
      lastHeartbeat: new Date().toISOString(),
    };

    if (useFirebase) {
      const database = getFirebaseDatabase();
      if (database) {
        const userPresenceRef = ref(database, `boards/${boardId}/presence/${userId}`);
        set(userPresenceRef, presenceData);
      }
    } else {
      // Send to backend API
      const backendUrl = getBackendUrl();
      fetchWithErrorHandling(`${backendUrl}/api/boards/${boardId}/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status, 
          cursor,
          userId,
          userName,
        }),
        credentials: 'include', // Include cookies for JWT
      }).catch(err => console.error('Failed to update presence:', err));
    }
  }, [boardId, userId, userName, useFirebase]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastAction]);

    // Remove from canvas
    setCanvasState(prev => prev ? {
      ...prev,
      actions: prev.actions.filter(a => a.id !== lastAction.id),
      lastUpdated: new Date().toISOString(),
    } : null);
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    // Add back to canvas
    setCanvasState(prev => prev ? {
      ...prev,
      actions: [...prev.actions, action],
      lastUpdated: new Date().toISOString(),
    } : null);
  }, [redoStack]);

  const contextValue: BoardContextValue = {
    boardId,
    canvasState,
    presence,
    notifications,
    isConnected,
    isLoading,
    error,
    actions: {
      setBoardId,
      addStroke,
      addShape,
      clearBoard,
      broadcastNotification,
      updatePresence,
      undo,
      redo,
    },
  };

  return <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>;
}
