import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';

interface GameResultBurstProps {
  gameId: GameId;
  // 集計直前のドラマチック演出。AggregationDisplayの上に出す
  durationMs?: number;
  onDone?: () => void;
}

const THEMES: Record<
  GameId,
  { emoji: string; subEmoji: string; color: string; label: string; sub: string }
> = {
  balloon: {
    emoji: '🎈',
    subEmoji: '✨',
    color: 'from-rose-100 via-amber-100 to-yellow-100',
    label: 'みんなの風船をふくらまし方',
    sub: 'リスクをどう取ったか、見せて〜',
  },
  digit_span: {
    emoji: '🧠',
    subEmoji: '💡',
    color: 'from-indigo-100 via-sky-100 to-cyan-100',
    label: 'みんなの記憶力',
    sub: '何桁まで覚えられたかな？',
  },
  card_decks: {
    emoji: '🃏',
    subEmoji: '✨',
    color: 'from-emerald-100 via-teal-100 to-cyan-100',
    label: 'みんなの選び方',
    sub: '良い山を見つけられた？',
  },
  emotion_match: {
    emoji: '🤝',
    subEmoji: '💞',
    color: 'from-pink-100 via-rose-100 to-amber-100',
    label: 'みんなの気持ち察知度',
    sub: '相手の表情、読めたかな？',
  },
  money_split: {
    emoji: '🪙',
    subEmoji: '✨',
    color: 'from-amber-100 via-yellow-100 to-orange-100',
    label: 'みんなの分け方',
    sub: '自分？相手？フェア？',
  },
  stop_signal: {
    emoji: '🚦',
    subEmoji: '⚡',
    color: 'from-emerald-100 via-lime-100 to-amber-100',
    label: 'みんなの反応速度',
    sub: '止まれた？飛び出した？',
  },
  pattern_match: {
    emoji: '🧩',
    subEmoji: '🌟',
    color: 'from-violet-100 via-fuchsia-100 to-rose-100',
    label: 'みんなのパターン読み',
    sub: '法則、見抜けたかな？',
  },
  towers: {
    emoji: '🗼',
    subEmoji: '✨',
    color: 'from-slate-100 via-sky-100 to-emerald-100',
    label: 'みんなの段取り力',
    sub: '何手で解けたかな？',
  },
  wasabi_waiter: {
    emoji: '🍣',
    subEmoji: '✨',
    color: 'from-orange-100 via-amber-100 to-rose-100',
    label: 'みんなの接客スタイル',
    sub: 'お客さんに笑顔届いた？',
  },
};

export const GameResultBurst = ({ gameId, durationMs = 1800, onDone }: GameResultBurstProps) => {
  const [show, setShow] = useState(true);
  const theme = THEMES[gameId];

  useEffect(() => {
    const t = window.setTimeout(() => {
      setShow(false);
      onDone?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onDone]);

  if (!show) return null;

  return (
    <div
      className={`relative rounded-2xl border border-amber-200 p-6 overflow-hidden bg-gradient-to-br ${theme.color}`}
    >
      <style>
        {`
          @keyframes burstIn {
            0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
            50%  { transform: scale(1.15) rotate(2deg); opacity: 1; }
            100% { transform: scale(1.0) rotate(0deg); opacity: 1; }
          }
          @keyframes confetti {
            0%   { transform: translateY(-20px) scale(0.6); opacity: 0; }
            30%  { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(80px) scale(0.6); opacity: 0; }
          }
          @keyframes labelSlide {
            0%   { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      {/* 紙吹雪・粒子 */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${(i * 11) % 100}%`,
              top: `${(i * 9) % 60}px`,
              animation: `confetti 1.6s ease-out ${(i * 0.06) % 1}s both`,
            }}
          >
            {i % 2 === 0 ? theme.subEmoji : theme.emoji}
          </span>
        ))}
      </div>

      <div className="relative text-center py-3">
        <div
          className="text-7xl inline-block"
          style={{ animation: 'burstIn 700ms ease-out both' }}
        >
          {theme.emoji}
        </div>
        <p
          className="mt-3 text-xl font-black text-slate-900"
          style={{ animation: 'labelSlide 800ms ease-out 200ms both' }}
        >
          {theme.label}
        </p>
        <p
          className="mt-1 text-sm text-slate-700"
          style={{ animation: 'labelSlide 800ms ease-out 350ms both' }}
        >
          {theme.sub}
        </p>
      </div>
    </div>
  );
};
