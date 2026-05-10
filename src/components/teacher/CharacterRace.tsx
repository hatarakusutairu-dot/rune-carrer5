import { useSync } from '@/contexts/SyncContext';

// 集計直前〜集計中、各クラスの回答進捗をキャラが横移動するアニメで表現
const ICONS = ['🔥', '🌱', '⭐', '💧', '⚡', '🎯', '🌸', '🍀'];

interface Props {
  // 表示用の per-class カウント数（指定時はゲーム回答progress を上書き）
  perClass?: Record<string, number>;
  // 各クラスの母数（ゴール）。未指定なら入室人数と同じ。
  goal?: number;
  // タイトル文言
  title?: string;
  // サブタイトル
  subtitle?: string;
}

export const CharacterRace = ({ perClass: overridePerClass, goal, title, subtitle }: Props = {}) => {
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
        <h3 className="font-bold">{title ?? 'クラスのレース'}</h3>
        <span className="text-xs text-slate-500">{subtitle ?? '回答が来るたびに進む'}</span>
      </div>
      <div className="mt-4 space-y-3">
        {state.classes.map((cls, i) => {
          const classSize = state.perClassCount[cls] ?? 0;
          const goalCount = goal ?? classSize;
          const done = overridePerClass
            ? (overridePerClass[cls] ?? 0)
            : (progress.perClass[cls] ?? 0);
          const r = goalCount > 0 ? done / goalCount : 0;
          const widthRatio = Math.min(1, r * (goalCount / maxClassSize) * 1.2 + 0.05);
          const icon = ICONS[i % ICONS.length];
          return (
            <div key={cls}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{icon} {cls}</span>
                <span className="text-slate-500 tabular-nums">
                  {done}/{goalCount}
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
