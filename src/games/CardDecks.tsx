import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';
import { DecorImage } from '@/components/common/DecorImage';

const DECK_KEYS = ['a', 'b', 'c', 'd'] as const;

// 本物の Iowa Gambling Task (IGT) スケジュール
// 各デッキは固定パターンで報酬と罰金が出る
// - A：高報酬+100、頻繁な罰金（10枚ごとに5回、平均-250）→ 期待値マイナス
// - B：高報酬+100、稀な大罰金（10枚ごとに1回 -1250）→ 期待値マイナス
// - C：低報酬+50、頻繁な小罰金（10枚ごとに5回、平均-50）→ 期待値プラス
// - D：低報酬+50、稀な罰金（10枚ごとに1回 -250）→ 期待値プラス

const TOTAL_PICKS = 50;

interface DeckCard {
  reward: number;
  penalty: number; // 0 なら罰金なし
}

const DECK_CYCLES: Record<number, DeckCard[]> = {
  // Deck A：10枚で +1000、罰金合計 -1250
  0: [
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: -150 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: -300 },
    { reward: 100, penalty: -200 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: -250 },
    { reward: 100, penalty: -350 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
  ],
  // Deck B：10枚で +1000、罰金 -1250 を1回
  1: [
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: 0 },
    { reward: 100, penalty: -1250 },
    { reward: 100, penalty: 0 },
  ],
  // Deck C：10枚で +500、罰金合計 -250（小さく分散）
  2: [
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: -50 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: -50 },
    { reward: 50, penalty: -50 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: -25 },
    { reward: 50, penalty: -75 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
  ],
  // Deck D：10枚で +500、罰金 -250 を1回
  3: [
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: -250 },
    { reward: 50, penalty: 0 },
    { reward: 50, penalty: 0 },
  ],
};

const DECK_NAMES = ['A', 'B', 'C', 'D'];
const COLORS = ['bg-red-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'];

// シャッフルされた山を作成（各デッキ独立）
const buildShuffledDecks = (): Record<number, DeckCard[]> => {
  const decks: Record<number, DeckCard[]> = {};
  for (let i = 0; i < 4; i++) {
    const cycle = DECK_CYCLES[i];
    const deck: DeckCard[] = [];
    // 50枚を満たすために cycle を繰り返してシャッフル
    while (deck.length < TOTAL_PICKS + 5) {
      const shuffled = [...cycle].sort(() => Math.random() - 0.5);
      deck.push(...shuffled);
    }
    decks[i] = deck;
  }
  return decks;
};

export const CardDecks = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const decksRef = useRef(buildShuffledDecks());
  const [pickCounters, setPickCounters] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 });
  const [picks, setPicks] = useState<number[]>([]);
  const [score, setScore] = useState(2000); // IGT は初期所持金 $2000
  const [flash, setFlash] = useState<{ deckIdx: number; gain: number; penalty: number } | null>(null);
  const finishedRef = useRef(false);

  const finish = (allPicks: number[], finalScore: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'card_decks', picks: allPicks, finalScore });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => finish(picks, score));

  const handlePick = (deckIdx: number) => {
    if (flash) return;
    const counter = pickCounters[deckIdx] ?? 0;
    const card = decksRef.current[deckIdx][counter];
    const gain = card.reward + card.penalty;
    const nextScore = score + gain;
    const nextPicks = [...picks, deckIdx];
    setScore(nextScore);
    setPicks(nextPicks);
    setPickCounters({ ...pickCounters, [deckIdx]: counter + 1 });
    setFlash({ deckIdx, gain: card.reward, penalty: card.penalty });
    window.setTimeout(() => {
      setFlash(null);
      if (nextPicks.length >= TOTAL_PICKS) {
        finish(nextPicks, nextScore);
      }
    }, 900);
  };

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0];
    picks.forEach((i) => c[i]++);
    return c;
  }, [picks]);

  return (
    <GameShell
      title="カード山引き"
      description="4つの山から好きな山を引く。良い山を見つけよう（最初の所持金は2000）。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: picks.length, total: TOTAL_PICKS }}
      footer={
        <div className="text-center">
          <div className="text-xs text-slate-500">現在の所持金</div>
          <div
            className={`text-3xl font-black tabular-nums ${
              score >= 2000 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            ${score}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            開始時 $2000 → 増やそう
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-4 gap-2">
        {DECK_NAMES.map((name, i) => (
          <button
            key={name}
            onClick={() => handlePick(i)}
            disabled={!!flash}
            className={`relative aspect-[2/3] rounded-xl border-2 border-slate-300 ${COLORS[i]} flex flex-col items-center justify-center font-black text-3xl active:scale-95 transition disabled:opacity-50 overflow-hidden`}
          >
            <DecorImage
              src={`/img/card-deck-${DECK_KEYS[i]}.png`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="relative text-white drop-shadow z-10">{name}</span>
            <span className="absolute bottom-1 text-[10px] text-slate-800 font-normal bg-white/70 rounded px-1 z-10">
              {counts[i]}回
            </span>
            {flash?.deckIdx === i && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-sm font-bold bg-white/85 rounded-xl z-20">
                <span className="text-emerald-700">+${flash.gain}</span>
                {flash.penalty < 0 && (
                  <span className="text-red-700">{flash.penalty}</span>
                )}
                <span className={`text-base mt-1 ${flash.gain + flash.penalty >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                  {flash.gain + flash.penalty >= 0 ? `+${flash.gain + flash.penalty}` : flash.gain + flash.penalty}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500 text-center">
        山によって報酬と罰金のパターンが違います。試しながら良い山を見つけよう。
      </p>
    </GameShell>
  );
};
