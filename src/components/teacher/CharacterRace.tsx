import { useSync } from '@/contexts/SyncContext';

// 集計直前〜集計中、各クラスの回答進捗をキャラが横移動するアニメで表現
const ICONS = ['🔥', '🌱', '⭐', '💧', '⚡', '🎯', '🌸', '🍀'];

export const CharacterRace = () => {
  const { state, progress } = useSync();
  if (!state) return null;
  if (state.classes.length === 0) return null;

  const maxClassSize = Math.max(
    1,
    ...state.classes.map((c) => state.perClassCount[c] ?? 0)
  );

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 border border-sky-200 p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-bold">クラスのレース</h3>
        <span className="text-xs text-slate-500">回答が来るたびに進む</span>
      </div>
      <div className="mt-4 space-y-3">
        {state.classes.map((cls, i) => {
          const total = state.perClassCount[cls] ?? 0;
          const done = progress.perClass[cls] ?? 0;
          // 進捗率：そのクラスの回答完了率
          const r = total > 0 ? done / total : 0;
          // クラス比較も加味して横幅最大調整
          const widthRatio = Math.min(1, r * (total / maxClassSize) * 1.2 + 0.05);
          const icon = ICONS[i % ICONS.length];
          return (
            <div key={cls}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{icon} {cls}</span>
                <span className="text-slate-500 tabular-nums">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-1 relative h-9 rounded-full bg-white border border-sky-200 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-sky-100 transition-all duration-700"
                  style={{ width: `${widthRatio * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-700"
                  style={{ left: `calc(${widthRatio * 100}% - 28px)` }}
                >
                  {icon}
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-lg select-none">
                  🏁
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
