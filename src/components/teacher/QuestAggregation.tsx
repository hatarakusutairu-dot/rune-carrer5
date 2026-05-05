import { useSync } from '@/contexts/SyncContext';

const topN = (counts: Record<string, number>, n: number): Array<[string, number]> => {
  const arr = Object.entries(counts);
  arr.sort((a, b) => b[1] - a[1]);
  return arr.slice(0, n);
};

export const QuestAggregation = () => {
  const { state, questAgg } = useSync();
  if (!state) return null;

  if (!questAgg || questAgg.total === 0) {
    return (
      <div className="rounded-2xl bg-white border border-amber-200 p-5">
        <h3 className="font-bold">My Quest Card 集計</h3>
        <p className="mt-2 text-sm text-slate-600">
          まだ提出はありません。生徒の入力をお待ちください。
        </p>
      </div>
    );
  }

  const total = questAgg.total;
  const expected = state.totalStudents;
  const ratio = expected > 0 ? (total / expected) * 100 : 0;
  const topGrow = topN(questAgg.growSkillCounts, 5);
  const topGame = topN(questAgg.gameActionCounts, 5);
  const topSchool = topN(questAgg.schoolActionCounts, 5);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50 to-emerald-50 border border-amber-300 p-5">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h3 className="font-bold text-lg">My Quest Card 集計</h3>
          <div className="text-sm text-slate-700">
            <span className="text-2xl font-black tabular-nums">{total}</span>
            <span className="text-slate-500"> / {expected}人 提出（{ratio.toFixed(0)}%）</span>
          </div>
        </div>

        {/* クラス別提出数 */}
        {state.classes.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {state.classes.map((cls) => (
              <span
                key={cls}
                className="px-2.5 py-1 rounded-full text-xs bg-white border border-amber-200"
              >
                {cls}：<span className="font-bold tabular-nums">{questAgg.perClass[cls] ?? 0}</span>人
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <CountList title="育てたい力 TOP5" items={topGrow} color="amber" />
        <CountList title="ゲームでの行動 TOP5" items={topGame} color="emerald" />
        <CountList title="学校生活での行動 TOP5" items={topSchool} color="cyan" />
      </div>

      {questAgg.samples.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h4 className="font-bold text-sm mb-3">
            みんなのカード（匿名・最大{questAgg.samples.length}件）
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {questAgg.samples.map((s, i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200 p-3 text-xs leading-relaxed"
              >
                <div className="text-[10px] text-amber-800 font-semibold mb-1">
                  {s.className}
                </div>
                <div>
                  育てたい力：<strong className="text-amber-900">{s.growSkill}</strong>
                </div>
                <div>
                  ゲームで：<strong className="text-emerald-800">{s.gameAction}</strong>
                </div>
                <div>
                  学校で：<strong className="text-cyan-800">{s.schoolAction}</strong>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 italic">
            匿名表示。誰がどれを書いたかは特定できません。
          </p>
        </div>
      )}
    </div>
  );
};

const COLORS: Record<string, string> = {
  amber: 'from-amber-100 to-yellow-50 border-amber-200',
  emerald: 'from-emerald-100 to-green-50 border-emerald-200',
  cyan: 'from-cyan-100 to-sky-50 border-cyan-200',
};

const CountList = ({
  title,
  items,
  color,
}: {
  title: string;
  items: Array<[string, number]>;
  color: keyof typeof COLORS;
}) => {
  const max = Math.max(1, ...items.map(([, n]) => n));
  return (
    <div className={`rounded-xl bg-gradient-to-br ${COLORS[color]} border p-3`}>
      <div className="text-xs font-semibold text-slate-700">{title}</div>
      {items.length === 0 ? (
        <div className="mt-2 text-xs text-slate-500 italic">まだなし</div>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map(([k, v]) => (
            <li key={k}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-slate-800 truncate">{k}</span>
                <span className="text-slate-600 tabular-nums">{v}</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-white/50 overflow-hidden">
                <div
                  className="h-full bg-slate-700/60 transition-all duration-500"
                  style={{ width: `${(v / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
