import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

// Iowa Gambling Task 風：4つのデッキにそれぞれ報酬と罰金分布
// A,B：高報酬・高罰金（不利） / C,D：低報酬・低罰金（有利）
const DECKS = [
  { name: 'A', reward: 12, punishMean: -25, punishProb: 0.5 }, // 期待値マイナス
  { name: 'B', reward: 12, punishMean: -50, punishProb: 0.1 },
  { name: 'C', reward: 5, punishMean: -10, punishProb: 0.5 }, // 期待値プラス
  { name: 'D', reward: 5, punishMean: -25, punishProb: 0.1 },
];
const COLORS = ['bg-red-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'];

const TOTAL_PICKS = 30;

export const CardDecks = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [picks, setPicks] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ deckIdx: number; gain: number } | null>(null);
  const finishedRef = useRef(false);

  const finish = (allPicks: number[], finalScore: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'card_decks', picks: allPicks, finalScore });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => finish(picks, score));

  const handlePick = (deckIdx: number) => {
    if (flash) return;
    const deck = DECKS[deckIdx];
    let gain = deck.reward;
    if (Math.random() < deck.punishProb) {
      gain += deck.punishMean;
    }
    const nextScore = score + gain;
    const nextPicks = [...picks, deckIdx];
    setScore(nextScore);
    setPicks(nextPicks);
    setFlash({ deckIdx, gain });
    window.setTimeout(() => {
      setFlash(null);
      if (nextPicks.length >= TOTAL_PICKS) {
        finish(nextPicks, nextScore);
      }
    }, 700);
  };

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0];
    picks.forEach((i) => c[i]++);
    return c;
  }, [picks]);

  return (
    <GameShell
      title="Card Decks（カード山）"
      description="4つの山から好きな山を引く。当たり外れの傾向を見つけよう。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: picks.length, total: TOTAL_PICKS }}
      footer={
        <div className="text-center">
          <div className="text-xs text-slate-500">現在のスコア</div>
          <div
            className={`text-3xl font-black tabular-nums ${
              score >= 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {score >= 0 ? `+${score}` : score}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-4 gap-2">
        {DECKS.map((d, i) => (
          <button
            key={d.name}
            onClick={() => handlePick(i)}
            disabled={!!flash}
            className={`relative aspect-[2/3] rounded-xl border-2 border-slate-300 ${COLORS[i]} flex flex-col items-center justify-center font-black text-3xl active:scale-95 transition disabled:opacity-50`}
          >
            <span className="text-white drop-shadow">{d.name}</span>
            <span className="text-[10px] text-slate-700 absolute bottom-1 font-normal">
              {counts[i]}回
            </span>
            {flash?.deckIdx === i && (
              <span
                className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
                  flash.gain >= 0 ? 'text-emerald-900 bg-emerald-100/80' : 'text-red-900 bg-red-100/80'
                }`}
              >
                {flash.gain >= 0 ? `+${flash.gain}` : flash.gain}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500 text-center">
        山によって報酬と罰金の確率が違います。良い山を見つけよう。
      </p>
    </GameShell>
  );
};
