import { useEffect, useRef, useState } from 'react';

interface ClassForestProps {
  classes: string[];
  perClassCount: Record<string, number>;
  totalStudents: number;
}

const PALETTE = [
  { text: 'text-emerald-500', dot: 'bg-emerald-400', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { text: 'text-teal-500', dot: 'bg-teal-400', border: 'border-teal-200', bg: 'bg-teal-50' },
  { text: 'text-lime-600', dot: 'bg-lime-400', border: 'border-lime-200', bg: 'bg-lime-50' },
  { text: 'text-cyan-500', dot: 'bg-cyan-400', border: 'border-cyan-200', bg: 'bg-cyan-50' },
  { text: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-200', bg: 'bg-amber-50' },
];

export const ClassForest = ({ classes, perClassCount, totalStudents }: ClassForestProps) => {
  const prevTotalRef = useRef(totalStudents);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    if (totalStudents > prevTotalRef.current) {
      const d = totalStudents - prevTotalRef.current;
      setDelta(d);
      const t = window.setTimeout(() => setDelta(null), 1400);
      prevTotalRef.current = totalStudents;
      return () => clearTimeout(t);
    }
    prevTotalRef.current = totalStudents;
  }, [totalStudents]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-5 overflow-hidden">
      <style>
        {`
          @keyframes sproutPop {
            0%   { transform: scale(0.2) translateY(10px); opacity: 0; }
            55%  { transform: scale(1.25) translateY(-3px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(-2deg); }
            50%      { transform: rotate(2deg); }
          }
          @keyframes deltaFloat {
            0%   { transform: translateY(0) scale(0.9); opacity: 0; }
            20%  { transform: translateY(-6px) scale(1.05); opacity: 1; }
            100% { transform: translateY(-50px) scale(1); opacity: 0; }
          }
          .sprout-base {
            display: inline-block;
            transform-origin: bottom center;
          }
        `}
      </style>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-bold">クラスの森</h3>
        <div className="text-sm text-emerald-800 relative">
          <span className="font-bold text-2xl tabular-nums">{totalStudents}</span>
          <span className="ml-1">人 入室中</span>
          {delta !== null && (
            <span
              className="absolute -right-1 -top-2 text-emerald-600 font-bold pointer-events-none"
              style={{ animation: 'deltaFloat 1.4s ease-out forwards' }}
            >
              +{delta}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {classes.map((cls, ci) => {
          const count = perClassCount[cls] ?? 0;
          const palette = PALETTE[ci % PALETTE.length];
          const visible = Math.min(count, 100);
          return (
            <div key={cls} className={`rounded-lg p-2 ${palette.bg} border ${palette.border}`}>
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${palette.dot}`} />
                  <span className="text-sm font-semibold text-slate-700">{cls}</span>
                </div>
                <span className="text-xs text-slate-500 tabular-nums">{count}人</span>
              </div>
              <div className="mt-1 leading-7 text-xl">
                {visible === 0 ? (
                  <span className="text-xs text-slate-400 italic">入室待ち…</span>
                ) : (
                  Array.from({ length: visible }).map((_, i) => {
                    // 直近5個は弾むアニメ、それ以前はゆれるだけ
                    const isRecent = i >= visible - 5;
                    return (
                      <span
                        key={`${cls}-${i}-${count}`}
                        className={`sprout-base ${palette.text}`}
                        style={
                          isRecent
                            ? {
                                animation: `sproutPop 600ms ease-out ${(visible - 1 - i) * 30}ms both`,
                              }
                            : {
                                animation: `sway ${3 + (i % 3)}s ease-in-out ${(i % 7) * 0.2}s infinite`,
                              }
                        }
                      >
                        🌱
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
