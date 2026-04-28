import { useEffect, useState } from 'react';

interface ClassForestProps {
  classes: string[];
  perClassCount: Record<string, number>;
  totalStudents: number;
}

const PALETTE = [
  'text-emerald-500',
  'text-teal-500',
  'text-lime-500',
  'text-green-500',
  'text-cyan-500',
];

const Sprout = ({ delay, color }: { delay: number; color: string }) => (
  <span
    className={`inline-block ${color}`}
    style={{
      animation: `sproutPop 600ms ease-out ${delay}ms both`,
      transformOrigin: 'bottom center',
    }}
  >
    🌱
  </span>
);

export const ClassForest = ({ classes, perClassCount, totalStudents }: ClassForestProps) => {
  const [seed, setSeed] = useState(0);

  // 入室があるたびに一瞬リフレッシュさせるトリガー
  useEffect(() => {
    setSeed((s) => s + 1);
  }, [totalStudents]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-6 overflow-hidden">
      <style>
        {`
          @keyframes sproutPop {
            0%   { transform: scale(0.2) translateY(10px); opacity: 0; }
            60%  { transform: scale(1.15) translateY(0); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}
      </style>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-bold">クラスの森</h3>
        <div className="text-sm text-emerald-800">
          <span className="font-bold text-2xl">{totalStudents}</span> 人 入室中
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {classes.map((cls, ci) => {
          const count = perClassCount[cls] ?? 0;
          const color = PALETTE[ci % PALETTE.length];
          // 表示は最大100個まで（多すぎ防止）
          const visible = Math.min(count, 100);
          return (
            <div key={cls}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-700">{cls}</span>
                <span className="text-xs text-slate-500">{count}人</span>
              </div>
              <div className="mt-1 leading-7 text-2xl">
                {Array.from({ length: visible }).map((_, i) => (
                  <Sprout
                    key={`${seed}-${cls}-${i}`}
                    delay={(i % 20) * 30}
                    color={color}
                  />
                ))}
                {count === 0 && (
                  <span className="text-xs text-slate-400 italic">まだ入室がありません</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
