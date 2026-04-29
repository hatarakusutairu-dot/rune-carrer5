import type { SeedType } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { RadarChart } from '@/components/common/RadarChart';
import { traitLabel } from '@/content/gameAnalysis';

const SEED_COLORS: Record<SeedType, string> = {
  challenge: 'bg-orange-200 text-orange-900 border-orange-300',
  analysis: 'bg-blue-200 text-blue-900 border-blue-300',
  support: 'bg-green-200 text-green-900 border-green-300',
  leader: 'bg-purple-200 text-purple-900 border-purple-300',
  continuity: 'bg-amber-200 text-amber-900 border-amber-300',
  balance: 'bg-teal-200 text-teal-900 border-teal-300',
};

const RADAR_COLOR_BY_INDEX = ['emerald', 'teal', 'indigo', 'amber', 'rose'];

interface Props {
  /** ステージサマリ表示にする場合true。falseならゲーム単位の集計 */
  isStageSummary?: boolean;
}

export const AggregationDisplay = ({ isStageSummary = false }: Props) => {
  const { state, lastAggregation, stageSummary } = useSync();
  if (!state) return null;

  const data = isStageSummary ? stageSummary : lastAggregation;
  if (!data) return null;

  const overall = isStageSummary
    ? stageSummary?.overall
    : lastAggregation?.overall;
  const perClass = isStageSummary
    ? stageSummary?.perClass ?? []
    : lastAggregation?.perClass ?? [];

  if (!overall) return null;

  const totalAnswers = isStageSummary
    ? perClass.reduce((acc, c) => acc + c.count, 0)
    : lastAggregation?.totalAnswers ?? 0;

  return (
    <div className="rounded-2xl bg-white border border-emerald-200 p-6 space-y-6 shadow-sm">
      {/* ヘッダ */}
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold">
          {isStageSummary ? 'Stage 1 全体集計' : 'クラスの結果（このゲーム）'}
        </h3>
        <span className="text-xs text-slate-500">
          {totalAnswers}人が回答
        </span>
      </div>

      {/* 全体の上位タイプ */}
      {overall.topType && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <div className="text-xs text-emerald-700">クラス全体で最も多く見えた芽</div>
          <div className="mt-1 text-2xl font-black text-emerald-900">
            🌱 {traitLabel(overall.topType)}
          </div>
        </div>
      )}

      {/* 全体レーダー */}
      <div className="flex justify-center">
        <RadarChart
          scores={overall.scoresAvg}
          size={300}
          color="emerald"
          label="クラス全体の平均"
        />
      </div>

      {/* クラス別 */}
      {perClass.length > 1 && (
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-3">クラス別の傾向</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perClass.map((c, i) => {
              if (c.count === 0) {
                return (
                  <div
                    key={c.className}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center text-sm text-slate-500"
                  >
                    <div className="font-semibold">{c.className}</div>
                    <div className="mt-2">回答なし</div>
                  </div>
                );
              }
              return (
                <div
                  key={c.className}
                  className="rounded-xl bg-white border border-slate-200 p-3"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-sm">{c.className}</span>
                    <span className="text-xs text-slate-500">{c.count}人</span>
                  </div>
                  {c.topType && (
                    <div
                      className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[11px] border ${
                        SEED_COLORS[c.topType]
                      }`}
                    >
                      🌱 {traitLabel(c.topType)}
                    </div>
                  )}
                  <div className="mt-2 flex justify-center">
                    <RadarChart
                      scores={c.scoresAvg}
                      size={180}
                      color={RADAR_COLOR_BY_INDEX[i % RADAR_COLOR_BY_INDEX.length]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
