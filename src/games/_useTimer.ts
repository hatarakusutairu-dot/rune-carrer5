import { useEffect, useState } from 'react';

// 残り時間を計算する hook（秒単位）
export const useRemainingSec = (startedAtMs: number, durationMs: number): number => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (durationMs <= 0) return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [durationMs]);
  if (durationMs <= 0) return 0;
  const endAt = startedAtMs + durationMs;
  return Math.max(0, Math.ceil((endAt - now) / 1000));
};

// 時間切れで onTimeout を呼ぶ hook
export const useTimeoutOnce = (
  startedAtMs: number,
  durationMs: number,
  onTimeout: () => void
): void => {
  const [fired, setFired] = useState(false);
  useEffect(() => {
    if (durationMs <= 0 || fired) return;
    const remain = startedAtMs + durationMs - Date.now();
    const t = window.setTimeout(() => {
      setFired(true);
      onTimeout();
    }, Math.max(0, remain));
    return () => clearTimeout(t);
  }, [startedAtMs, durationMs, onTimeout, fired]);
};
