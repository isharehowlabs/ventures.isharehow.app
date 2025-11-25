import { createContext, useContext, useState, ReactNode } from 'react';

export interface TimerState {
  isRunning: boolean;
  timeLeft: number; // in seconds
  duration: number; // in minutes
  isBreak: boolean;
  location?: 'rise' | 'cowork';
}

interface TimerContextType {
  timerState: TimerState | null;
  setTimerState: (state: TimerState | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState | null>(null);

  return (
    <TimerContext.Provider value={{ timerState, setTimerState }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

