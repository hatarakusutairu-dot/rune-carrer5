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
    const scheduledAt = Date.now();
    const remain = startedAtMs + durationMs - scheduledAt;
    const t = window.setTimeout(fire, Math.max(0, remain));
    return () => {
      clearTimeout(t);
      // 一定時間経過後のクリーンアップ＝サーバーphase切替/teacher強制終了/時間切れと判断し
      // アンマウント直前に発火（finish側でidempotent）。500ms未満はStrictMode等の即時アンマウントなのでスキップ。
      if (!firedRef.current && Date.now() - scheduledAt >= 500) fire();
    };
  }, [startedAtMs, durationMs]);
};

