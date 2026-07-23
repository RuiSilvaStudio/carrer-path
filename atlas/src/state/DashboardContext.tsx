import { useState, useCallback } from 'react';
import type { DataSourceMode, ViewName } from '../types';

interface DashboardState {
  mode: DataSourceMode;
  view: ViewName;
  scrubIndex: number;
  trajectoryMode: 'traits' | 'emotions';
}

interface DashboardContextValue extends DashboardState {
  setMode: (mode: DataSourceMode) => void;
  setView: (view: ViewName) => void;
  setScrubIndex: (index: number) => void;
  setTrajectoryMode: (mode: 'traits' | 'emotions') => void;
}

export function useDashboardState() {
  const [state, setState] = useState<DashboardState>({
    mode: 'demo',
    view: 'trajectory',
    scrubIndex: 0,
    trajectoryMode: 'traits',
  });

  const setMode = useCallback((mode: DataSourceMode) => setState(s => ({ ...s, mode })), []);
  const setView = useCallback((view: ViewName) => setState(s => ({ ...s, view })), []);
  const setScrubIndex = useCallback((index: number) => setState(s => ({ ...s, scrubIndex: index })), []);
  const setTrajectoryMode = useCallback((mode: 'traits' | 'emotions') => setState(s => ({ ...s, trajectoryMode: mode })), []);

  return { ...state, setMode, setView, setScrubIndex, setTrajectoryMode };
}

export type { DashboardContextValue };
