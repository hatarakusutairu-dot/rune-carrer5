import { useSync } from '@/contexts/SyncContext';

// 全員意見のバブル可視化
// items は count 降順。バブルサイズ = log(count+1) ベースで段階化
export const OpinionBubbles = ({ compact = false }: { compact?: boolean }) => {
  const { gameSkills, state } = useSync();
  if (!gameSkills) {
    return (
      <div className="rounded-xl bg-white border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        まだ提出はありません
      </div>
    );
  }
  const expected = state?.totalStudents ?? 0;
  const submittedRatio = expected > 0 ? (gameSkills.totalSubmissions / expected) * 100 : 0;
  const maxCount = Math.max(1, ...gameSkills.items.map((it) => it.count));

  const bubbleSize = (count: number): { size: string; text: string; bg: string } => {
    const ratio = count / maxCount;
    if (ratio >= 0.66) return { size: 'px-5 py-3', text: 'text-lg', bg: 'bg-amber-300 text-amber-950 shadow-lg' };
    if (ratio >= 0.33) return { size: 'px-4 py-2.5', text: 'text-base', bg: 'bg-amber-200 text-amber-900 shadow' };
    return { size: 'px-3 py-1.5', text: 'text-sm', bg: 'bg-emerald-100 text-emerald-900' };
  };

  return (
    <div className={compact ? '' : 'space-y-3'}>
      {!compact && (
        <div className="flex items-baseline justify-between text-xs text-slate-700">
          <span>
            提出 <span className="font-bold tabular-nums">{gameSkills.totalSubmissions}</span>
            {expected > 0 && (
              <span className="text-slate-500"> / {expected}人（{submittedRatio.toFixed(0)}%）</span>
            )}
          </span>
          <span>
            合計意見数 <span className="font-bold tabular-nums">{gameSkills.totalEntries}</span>
          </span>
        </div>
      )}
      {gameSkills.items.length === 0 ? (
        <div className="rounded-xl bg-white border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          まだ提出はありません
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200 p-4 flex flex-wrap gap-2 justify-center items-center min-h-[180px]">
          {gameSkills.items.map((it, i) => {
            const b = bubbleSize(it.count);
            return (
              <span
                key={i}
                className={`${b.size} ${b.text} ${b.bg} rounded-full font-bold inline-flex items-center gap-1.5`}
                title={`${it.text}（${it.count}人）`}
              >
                <span>{it.text}</span>
                <span className="text-[10px] tabular-nums opacity-70">×{it.count}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
