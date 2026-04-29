import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';
import { getMyAnswer } from '@/lib/myAnswers';
import {
  analyzeMyAnswer,
  GAME_LABELS,
  GAME_PURPOSE,
  traitLabel,
} from '@/content/gameAnalysis';

interface MyAnalysisCardProps {
  gameId: GameId;
  // ↓ Pass 3 で実際の回答が保存されるたびに更新するためのトリガ
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
        <div className="font-semibold text-slate-700 mb-1">
          {GAME_LABELS[gameId]} の結果はまだありません
        </div>
        <p>このゲームをプレイすると、ここに「あなたの傾向」が表示されます。</p>
      </div>
    );
  }

  const a = analyzeMyAnswer(payload);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-5">
      <div className="text-xs text-emerald-700 font-medium">
        {GAME_LABELS[gameId]}
      </div>
      <div className="mt-1 text-xs text-slate-500">
        測ったもの：{GAME_PURPOSE[gameId]}
      </div>

      <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
        {a.headline}
      </h3>

      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {a.detail.map((d, i) => (
          <li key={i}>・{d}</li>
        ))}
      </ul>

      {a.topTraits.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-1">今日のあなたから見えた芽</div>
          <div className="flex flex-wrap gap-2">
            {a.topTraits.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-emerald-200 text-emerald-800"
              >
                🌱 {traitLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-600 italic">{a.encourage}</p>
    </div>
  );
};
