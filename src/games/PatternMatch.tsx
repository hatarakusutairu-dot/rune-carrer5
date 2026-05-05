import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

type Shape = { key: string; emoji: string };

const SHAPES: Shape[] = [
  { key: 'circle', emoji: '●' },
  { key: 'triangle', emoji: '▲' },
  { key: 'square', emoji: '■' },
  { key: 'star', emoji: '★' },
  { key: 'diamond', emoji: '◆' },
  { key: 'hex', emoji: '⬣' },
];

const COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'] as const;
type ColorName = typeof COLORS[number];

const COLOR_TEXT: Record<ColorName, string> = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  yellow: 'text-yellow-500',
  green: 'text-green-500',
  orange: 'text-orange-500',
  purple: 'text-purple-500',
};

interface Question {
  color: ColorName;
  sequence: Shape[]; // 4つ
  options: Shape[]; // 4択
  answerIndex: number;
}

const generateQuestion = (): Question => {
  // 単純パターン：A,B,A,B → ?  あるいは A,A,B,B → ?
  const a = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  let b = a;
  while (b.key === a.key) b = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  const patterns: Array<{ seq: Shape[]; ans: Shape }> = [
    { seq: [a, b, a, b], ans: a },
    { seq: [a, a, b, b], ans: a },
    { seq: [a, b, b, a], ans: b },
    { seq: [a, a, a, b], ans: b },
    { seq: [a, b, a, a], ans: b },
  ];
  const p = patterns[Math.floor(Math.random() * patterns.length)];
  // 4択：正解+ a/b + ランダム2種、重複は省く
  const pool: Shape[] = [];
  const seen = new Set<string>();
  const push = (s: Shape) => {
    if (!seen.has(s.key)) {
      seen.add(s.key);
      pool.push(s);
    }
  };
  push(p.ans);
  push(a);
  push(b);
  while (pool.length < 4) push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  const options = pool.slice(0, 4);
  // シャッフル
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    color,
    sequence: p.seq,
    options,
    answerIndex: options.findIndex((s) => s.key === p.ans.key),
  };
};

const TOTAL = 12;

export const PatternMatch = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const questions = useMemo(() => Array.from({ length: TOTAL }, () => generateQuestion()), []);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const finishedRef = useRef(false);

  const finish = (correctCount: number, total: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'pattern_match', correct: correctCount, total });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => {
    finish(correct, idx);
  });

  const handlePick = (i: number) => {
    if (feedback) return;
    const q = questions[idx];
    const isRight = i === q.answerIndex;
    setFeedback(isRight ? 'right' : 'wrong');
    if (isRight) setCorrect((c) => c + 1);
    window.setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= TOTAL) {
        finish(correct + (isRight ? 1 : 0), TOTAL);
      } else {
        setIdx((n) => n + 1);
      }
    }, 500);
  };

  const q = questions[idx];

  return (
    <GameShell
      title="パターン推論"
      description="次に来る図形を選んでね"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: idx + 1, total: TOTAL }}
    >
      <div className="flex justify-center items-center gap-2 py-3">
        {q.sequence.map((s, i) => (
          <ShapeIcon key={i} shape={s} color={q.color} size="md" />
        ))}
        <span className="text-slate-400 text-3xl">→</span>
        <span className="text-emerald-600 text-5xl">？</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {q.options.map((s, i) => (
          <button
            key={i}
            onClick={() => handlePick(i)}
            className={`py-5 rounded-xl border-2 transition flex items-center justify-center ${
              feedback && i === q.answerIndex
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <ShapeIcon shape={s} color={q.color} size="lg" />
          </button>
        ))}
      </div>
    </GameShell>
  );
};

const SIZE_CLASSES = {
  md: { img: 'w-12 h-12', emoji: 'text-5xl' },
  lg: { img: 'w-16 h-16', emoji: 'text-6xl' },
};

const ShapeIcon = ({
  shape,
  color,
  size,
}: {
  shape: Shape;
  color: ColorName;
  size: keyof typeof SIZE_CLASSES;
}) => (
  <ImageWithFallback
    src={`/img/shape-${shape.key}-${color}.png`}
    fallback={shape.emoji}
    alt={shape.key}
    imgClassName={`${SIZE_CLASSES[size].img} object-contain`}
    fallbackClassName={`${SIZE_CLASSES[size].emoji} ${COLOR_TEXT[color]} leading-none`}
  />
);
