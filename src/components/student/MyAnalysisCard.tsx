import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';
import { scoreAnswer } from '@shared/scoring';
import { getMyAnswer } from '@/lib/myAnswers';
import { analyzeMyAnswer, GAME_PURPOSE, traitLabel } from '@/content/gameAnalysis';
import { RadarChart } from '@/components/common/RadarChart';

interface MyAnalysisCardProps {
  gameId: GameId;
  refreshKey?: number;
}

export const MyAnalysisCard = ({ gameId, refreshKey }: MyAnalysisCardProps) => {
  const [payload, setPayload] = useState(() => getMyAnswer(gameId));

  useEffect(() => {
    setPayload(getMyAnswer(gameId));
  }, [gameId, refreshKey]);

  if (!payload) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600">
        このゲームの結果はまだありません。
      </div>
    );
  }

  const a = analyzeMyAnswer(payload);
  const scores = scoreAnswer(payload);

  return (
    <div className="rounded-2xl bg-white border border-emerald-200 p-5 space-y-4 shadow-sm">
      {/* ヘッダ：適性検査風 */}
      <header className="border-b border-slate-100 pb-3">
        <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
          {a.gameLabel}
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900 leading-snug">
          {a.headline}
        </h3>
        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium">
          測定軸：{a.trait}
        </div>
      </header>

      {/* 数値メトリクス */}
      {a.metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {a.metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-slate-50 px-2 py-1.5">
              <div className="text-[10px] text-slate-500">{m.label}</div>
              <div className="text-sm font-bold tabular-nums">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* レーダー */}
      <section className="flex justify-center">
        <RadarChart scores={scores} max={10} size={240} color="emerald" label="このゲームから見えた芽の傾向" />
      </section>

      {/* サマリ */}
      <section>
        <div className="text-xs text-slate-500 mb-1">
          このゲームについて：{GAME_PURPOSE[gameId]}
        </div>
        <p className="text-sm text-slate-800 leading-relaxed">{a.summary}</p>
      </section>

      {/* 強み */}
      <Section title="あなたの強みとして見えたもの" items={a.strengths} bullet="✓" />

      {/* 日常で現れる場面 */}
      <Section title="この特性が日常で出る場面" items={a.realLife} bullet="・" />

      {/* 向いている働き方 */}
      <Section title="向いている働き方・場面" items={a.workStyles} bullet="▶" />

      {/* 関連する仕事 */}
      <section>
        <div className="text-xs font-semibold text-slate-700 mb-2">
          関連する仕事の例
        </div>
        <div className="flex flex-wrap gap-1.5">
          {a.careers.map((c) => (
            <span
              key={c}
              className="px-2.5 py-0.5 rounded-full text-xs bg-teal-50 text-teal-800 border border-teal-200"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* 伸ばすには */}
      <Section title="この力を伸ばすヒント" items={a.develop} bullet="🌱" />

      {/* 上位の芽 */}
      {a.topTraits.length > 0 && (
        <section>
          <div className="text-xs font-semibold text-slate-700 mb-2">
            今日のあなたから見えた芽
          </div>
          <div className="flex flex-wrap gap-2">
            {a.topTraits.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200"
              >
                🌱 {traitLabel(t)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 出典 */}
      <footer className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 leading-relaxed">
        <div>
          <span className="font-semibold">元ネタ：</span>
          {a.origin}
        </div>
        <p className="mt-2 italic whitespace-pre-line">{a.encourage}</p>
      </footer>
    </div>
  );
};

const Section = ({ title, items, bullet }: { title: string; items: string[]; bullet: string }) => {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="text-xs font-semibold text-slate-700 mb-1.5">{title}</div>
      <ul className="space-y-0.5 text-sm text-slate-800">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-emerald-600 select-none">{bullet}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
