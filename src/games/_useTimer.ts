import { useEffect, useRef, useState } from 'react';

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
// onTimeout は ref で保持し、依存配列には入れない
// （毎レンダーごとに onTimeout 参照が変わってもタイマーがリセットされない）
export const useTimeoutOnce = (
  startedAtMs: number,
  durationMs: number,
  onTimeout: () => void
): void => {
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const firedRef = useRef(false);
  useEffect(() => {
    if (durationMs <= 0) return;
    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      onTimeoutRef.current();
    };
    const remain = startedAtMs + durationMs - Date.now();
    const t = window.setTimeout(fire, Math.max(0, remain));
    return () => {
      clearTimeout(t);
      // サーバーのphase切替broadcastでアンマウントされる際の競合対策：
      // 既に期限到来済みならアンマウント直前に発火させる（finish側でidempotent）。
      if (Date.now() >= startedAtMs + durationMs) fire();
    };
  }, [startedAtMs, durationMs]);
};

