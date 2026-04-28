import { useEffect, useRef, useState } from 'react';

const TIMER_KEY = 'rune-carrer5:teacher-timer';

interface TimerStored {
  startedAtMs: number | null;
  pausedElapsedMs: number;
  paused: boolean;
}

const loadTimer = (): TimerStored => {
  if (typeof window === 'undefined') return { startedAtMs: null, pausedElapsedMs: 0, paused: false };
  try {
    const raw = window.sessionStorage.getItem(TIMER_KEY);
    if (!raw) return { startedAtMs: null, pausedElapsedMs: 0, paused: false };
    return JSON.parse(raw) as TimerStored;
  } catch {
    return { startedAtMs: null, pausedElapsedMs: 0, paused: false };
  }
};

const saveTimer = (t: TimerStored): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(TIMER_KEY, JSON.stringify(t));
  } catch {
    // ignore
  }
};

export const formatMMSS = (totalSeconds: number): string => {
  const sign = totalSeconds < 0 ? '-' : '';
  const s = Math.abs(Math.floor(totalSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${sign}${mm}:${ss}`;
};

export interface TimerControls {
  elapsedMs: number;
  running: boolean;
  paused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const useClassTimer = (): TimerControls => {
  const [state, setState] = useState<TimerStored>(loadTimer);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const base = state.pausedElapsedMs;
      const live = state.startedAtMs && !state.paused ? now - state.startedAtMs : 0;
      setElapsedMs(base + live);
      rafRef.current = window.setTimeout(tick, 250) as unknown as number;
    };
    tick();
    return () => {
      if (rafRef.current !== null) {
        clearTimeout(rafRef.current);
      }
    };
  }, [state]);

  const start = (): void => {
    const next: TimerStored = { startedAtMs: Date.now(), pausedElapsedMs: 0, paused: false };
    setState(next);
    saveTimer(next);
  };

  const pause = (): void => {
    if (!state.startedAtMs || state.paused) return;
    const now = Date.now();
    const next: TimerStored = {
      startedAtMs: null,
      pausedElapsedMs: state.pausedElapsedMs + (now - state.startedAtMs),
      paused: true,
    };
    setState(next);
    saveTimer(next);
  };

  const resume = (): void => {
    if (!state.paused) return;
    const next: TimerStored = {
      startedAtMs: Date.now(),
      pausedElapsedMs: state.pausedElapsedMs,
      paused: false,
    };
    setState(next);
    saveTimer(next);
  };

  const reset = (): void => {
    const next: TimerStored = { startedAtMs: null, pausedElapsedMs: 0, paused: false };
    setState(next);
    saveTimer(next);
  };

  return {
    elapsedMs,
    running: state.startedAtMs !== null && !state.paused,
    paused: state.paused,
    start,
    pause,
    resume,
    reset,
  };
};
