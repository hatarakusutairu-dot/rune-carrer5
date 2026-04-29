import { useSync } from '@/contexts/SyncContext';

// ゲーム実施中の回答進捗を講師大画面に出す
export const LiveProgress = () => {
  const { state, progress } = useSync();
  if (!state) return null;
  const total = Math.max(state.totalStudents, 1);
  const ratio = total > 0 ? Math.min(1, progress.count / total) : 0;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="font-bold">回答状況</div>
        <div className="text-sm text-slate-700">
          <span className="font-bold tabular-nums text-2xl">{progress.count}</span>
          <span className="text-slate-500">/{total}人</span>
        </div>
      </div>

      {/* 全体プログレスバー */}
      <div className="mt-3 h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      {/* クラス別 */}
      {state.classes.length > 1 && (
        <div className="mt-4 space-y-2">
          {state.classes.map((cls) => {
            const classTotal = state.perClassCount[cls] ?? 0;
            const classDone = progress.perClass[cls] ?? 0;
            const r = classTotal > 0 ? classDone / classTotal : 0;
            return (
              <div key={cls}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-slate-700">{cls}</span>
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
