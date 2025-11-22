import { useBoardContext as useContext } from '../contexts/BoardContext';

// Re-export the hook for convenience
export { useContext as useBoardContext };

// Also export types for convenience
export type {
  Stroke,
  Shape,
  CanvasAction,
  CanvasState,
  PresenceData,
  BoardNotification,
  BoardContextValue,
} from '../contexts/BoardContext';
