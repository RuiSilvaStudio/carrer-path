import { createContext, useContext, useState, useCallback } from 'react';
import type { ViewName } from '../types';

interface DashboardState {
  view: ViewName;
  scrubIndex: number;
  trajectoryMode: 'traits' | 'emotions';
}

interface DashboardContextValue extends DashboardState {
  setView: (view: ViewName) => void;
  setScrubIndex: (index: number) => void;
  setTrajectoryMode: (mode: 'traits' | 'emotions') => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DashboardState>({
    view: 'trajectory',
    scrubIndex: 0,
    trajectoryMode: 'traits',
  });

  const setView = useCallback((view: ViewName) => setState(s => ({ ...s, view })), []);
  const setScrubIndex = useCallback((index: number) => setState(s => ({ ...s, scrubIndex: index })), []);
  const setTrajectoryMode = useCallback((mode: 'traits' | 'emotions') => setState(s => ({ ...s, trajectoryMode: mode })), []);

  return (
    <DashboardContext.Provider value={{ ...state, setView, setScrubIndex, setTrajectoryMode }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardState() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardState must be used within DashboardProvider');
  return ctx;
}

export type { DashboardContextValue };
