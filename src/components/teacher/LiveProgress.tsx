import { useEffect, useState } from 'react';
import { useSync } from '@/contexts/SyncContext';

const useRemainingSec = (startedAtMs: number | null, durationMs: number | null): number | null => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAtMs || !durationMs) return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [startedAtMs, durationMs]);
  if (!startedAtMs || !durationMs) return null;
  return Math.max(0, Math.ceil((startedAtMs + durationMs - now) / 1000));
};

// ゲーム実施中の回答進捗を講師大画面に出す
export const LiveProgress = () => {
  const { state, progress } = useSync();
  const remain = useRemainingSec(state?.activeStartedAt ?? null, state?.activeDurationMs ?? null);

  if (!state) return null;
  const total = Math.max(state.totalStudents, 1);
  const ratio = total > 0 ? Math.min(1, progress.count / total) : 0;
  const allDone = state.totalStudents > 0 && progress.count >= state.totalStudents;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="font-bold">回答状況</div>
        <div className="flex items-baseline gap-4">
          {remain !== null && (
            <div
              className={`flex items-baseline gap-1 ${
                remain <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-700'
              }`}
            >
              <span className="text-xs">残り</span>
              <span className="text-3xl font-black tabular-nums">{remain}</span>
              <span className="text-xs">秒</span>
            </div>
          )}
          <div className="text-sm text-slate-700">
            <span className="font-bold tabular-nums text-2xl">{progress.count}</span>
            <span className="text-slate-500">/{state.totalStudents}人</span>
          </div>
        </div>
      </div>

      {/* 全体プログレスバー */}
      <div className="mt-3 h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      {allDone && (
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-900 font-semibold animate-pulse">
          ✅ 全員回答完了！「締切（結果へ）」を押して結果発表へ
        </div>
      )}

      {/* クラス別 */}
      {state.classes.length > 1 && (
        <div className="mt-4 space-y-2">
          {state.classes.map((cls) => {
            const classTotal = state.perClassCount[cls] ?? 0;
            const classDone = progress.perClass[cls] ?? 0;
            const r = classTotal > 0 ? classDone / classTotal : 0;
            const classDoneAll = classTotal > 0 && classDone >= classTotal;
            return (
              <div key={cls}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {cls} {classDoneAll && <span className="text-emerald-600">✓</span>}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {classDone}/{classTotal}
                  </span>
                </div>
                <div className="mt-0.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-400 transition-all duration-500"
                    style={{ width: `${r * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
