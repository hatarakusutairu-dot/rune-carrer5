import type { PerClassAggregation, SeedType } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { traitLabel } from '@/content/gameAnalysis';

// 6タイプそれぞれの「クラスの色」テンプレ
const CLASS_COLOR_TEMPLATE: Record<SeedType, string> = {
  challenge: '前向きで動きが早いクラスです。新しいことに飛び込める雰囲気があります。',
  analysis: 'よく考えてから動くクラスです。深掘りや戦略立てが得意な空気感です。',
  support: '優しさと協力の色が強いクラスです。困っている人を助け合える雰囲気です。',
  leader: '誰かが先頭に立つことを良しとするクラスです。意思決定が早い空気があります。',
  continuity: 'コツコツ続けることを大事にできるクラスです。粘り強さが共有されています。',
  balance: '冷静で全体を見られるクラスです。極端に走らない安定感があります。',
};

const computeMostSplit = (perClass: PerClassAggregation[]): string | null => {
  // 「クラス間で最も意見が割れたクラス」を判別する簡易ロジック：
  //  クラス内の各タイプスコアの分散が小さいクラスを「割れた」とみなす
  if (perClass.length === 0) return null;
  let mostSplitName: string | null = null;
  let mostSplitVar = Infinity;
  for (const c of perClass) {
    if (c.count === 0) continue;
    const vals = Object.values(c.scoresAvg);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    if (variance < mostSplitVar) {
      mostSplitVar = variance;
      mostSplitName = c.className;
    }
  }
  return mostSplitName;
};

const computeStrongestClass = (
  perClass: PerClassAggregation[]
): { className: string; trait: SeedType } | null => {
  let best: { className: string; trait: SeedType; score: number } | null = null;
  for (const c of perClass) {
    if (c.count === 0 || !c.topType) continue;
    const v = c.scoresAvg[c.topType];
    if (!best || v > best.score) {
      best = { className: c.className, trait: c.topType, score: v };
    }
  }
  return best ? { className: best.className, trait: best.trait } : null;
};

interface Props {
  isStageSummary?: boolean;
}

export const ClassAnalysisCard = ({ isStageSummary = false }: Props) => {
  const { lastAggregation, stageSummary } = useSync();
  const overall = isStageSummary ? stageSummary?.overall : lastAggregation?.overall;
  const perClass = isStageSummary
    ? stageSummary?.perClass ?? []
    : lastAggregation?.perClass ?? [];

  if (!overall) return null;

  const totalAnswers = perClass.reduce((acc, c) => acc + c.count, 0);
  if (totalAnswers === 0) return null;

  const overallTopText = overall.topType
    ? CLASS_COLOR_TEMPLATE[overall.topType]
    : null;

  const strongest = computeStrongestClass(perClass);
  const mostSplit = perClass.length > 1 ? computeMostSplit(perClass) : null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 space-y-4">
      <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
        今日のクラス傾向（自動分析）
      </div>

      {overall.topType && (
        <p className="text-sm text-slate-800 leading-relaxed">
          <span className="font-bold">「{traitLabel(overall.topType)}」</span>
          が一番多く見えました。
          <br />
          {overallTopText}
        </p>
      )}

      {strongest && (
        <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm">
          <span className="text-xs text-slate-500">特に強く出たクラス：</span>
          <br />
          <span className="font-bold">{strongest.className}</span> は{' '}
          <span className="font-bold text-emerald-700">
            {traitLabel(strongest.trait)}
          </span>{' '}
          がとくに強めです。
        </div>
      )}

      {mostSplit && (
        <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm">
          <span className="text-xs text-slate-500">いろんな芽が見えたクラス：</span>
          <br />
          <span className="font-bold">{mostSplit}</span>{' '}
          は意見や行動の幅が広く、多様性のあるクラスです。
        </div>
      )}

      <p className="text-xs text-slate-600 italic">
        ※ これはクラス全体の傾向で、個人を決めつけるものではありません。
      </p>
    </div>
  );
};
