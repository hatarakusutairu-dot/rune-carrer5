import { ReactNode } from 'react';
import { useRemainingSec } from './_useTimer';

interface GameShellProps {
  title: string;
  description?: string;
  startedAtMs: number;
  durationMs: number;
  progress?: { current: number; total: number };
  children: ReactNode;
  footer?: ReactNode;
}

export const GameShell = ({
  title,
  description,
  startedAtMs,
  durationMs,
  progress,
  children,
  footer,
}: GameShellProps) => {
  const remain = useRemainingSec(startedAtMs, durationMs);
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
            ゲーム実施中
          </div>
          <h3 className="mt-0.5 text-base font-bold">{title}</h3>
          {description && (
            <p className="text-xs text-slate-600 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {progress && (
            <div className="text-xs text-slate-600">
              <span className="font-bold tabular-nums">{progress.current}</span>/{progress.total}
            </div>
          )}
          <div
            className={`text-2xl font-black tabular-nums ${
              remain <= 5 ? 'text-red-600 animate-pulse' : 'text-slate-700'
            }`}
          >
            {remain}秒
          </div>
        </div>
      </header>
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
};
