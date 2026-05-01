import { useEffect, useState } from 'react';

interface CountdownBigProps {
  // intro 開始時刻（serverTime ベース）
  introStartedAtMs: number;
  // 全体カウントダウンの長さ ms（既定：3000）
  durationMs?: number;
  // GO! の長さ
  goDurationMs?: number;
  // GO! 表示後にコールバック（オプション）
  onGo?: () => void;
}

// 大きく弾むカウントダウン。生徒画面と講師大画面で共有。
export const CountdownBig = ({
  introStartedAtMs,
  durationMs = 3000,
  goDurationMs = 700,
  onGo,
}: CountdownBigProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  const elapsed = now - introStartedAtMs;
  // どの数字（または GO!）を出すか
  // elapsed: 0..1000 → 3、1000..2000 → 2、2000..3000 → 1、3000..(3000+goDurationMs) → GO!
  let label: string | null;
  let key: string;
  if (elapsed < 0) {
    label = '3';
    key = 'pre';
  } else if (elapsed < durationMs) {
    const idx = Math.floor(elapsed / 1000);
    const num = Math.max(1, durationMs / 1000 - idx);
    label = String(Math.round(num));
    key = `n${label}`;
  } else if (elapsed < durationMs + goDurationMs) {
    label = 'GO!';
    key = 'go';
  } else {
    label = null;
    key = 'done';
  }

  useEffect(() => {
    if (key === 'go' && onGo) onGo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (label === null) return null;

  const isGo = label === 'GO!';

  return (
    <div className="relative flex items-center justify-center min-h-[60vh] sm:min-h-[420px] overflow-hidden">
      <style>
        {`
          @keyframes pop {
            0%   { transform: scale(0.2); opacity: 0; }
            40%  { transform: scale(1.3); opacity: 1; }
            70%  { transform: scale(1.0); opacity: 1; }
            100% { transform: scale(1.0); opacity: 0.8; }
          }
          @keyframes goBurst {
            0%   { transform: scale(0.4); opacity: 0; letter-spacing: 0; }
            40%  { transform: scale(1.6); opacity: 1; letter-spacing: 0.2em; }
            100% { transform: scale(2.4); opacity: 0; letter-spacing: 0.4em; }
          }
          @keyframes ringGrow {
            0%   { transform: scale(0.2); opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0; }
          }
        `}
      </style>

      {/* 拡大する円リング */}
      <div
        key={`ring-${key}`}
        className={`absolute rounded-full border-4 ${
          isGo ? 'border-amber-400' : 'border-emerald-400'
        }`}
        style={{
          width: '180px',
          height: '180px',
          animation: 'ringGrow 1s ease-out forwards',
        }}
      />

      <div
        key={key}
        className={`relative font-black tabular-nums select-none ${
          isGo ? 'text-amber-500' : 'text-emerald-600'
        }`}
        style={{
          fontSize: isGo ? 'clamp(80px, 22vw, 220px)' : 'clamp(120px, 28vw, 280px)',
          animation: isGo
            ? 'goBurst 0.7s ease-out forwards'
            : 'pop 1s ease-out forwards',
          textShadow: '0 8px 24px rgba(16,185,129,0.25)',
        }}
      >
        {label}
      </div>
    </div>
  );
};
