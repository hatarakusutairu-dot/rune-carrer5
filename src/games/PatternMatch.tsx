import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

// 図形：● ▲ ■ ★ ◆ ⬣
const SHAPES = ['●', '▲', '■', '★', '◆', '⬣'];

interface Question {
  sequence: string[]; // 4つ
  options: string[];  // 4択
  answerIndex: number;
}

const generateQuestion = (): Question => {
  // 単純パターン：A,B,A,B → ?  あるいは A,A,B,B → ?
  const a = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  let b = a;
  while (b === a) b = SHAPES[Math.floor(Math.random() * SHAPES.length)];

  const patterns: Array<{ seq: string[]; ans: string }> = [
    { seq: [a, b, a, b], ans: a },
    { seq: [a, a, b, b], ans: a },
    { seq: [a, b, b, a], ans: b },
    { seq: [a, a, a, b], ans: b },
    { seq: [a, b, a, a], ans: b },
  ];
  const p = patterns[Math.floor(Math.random() * patterns.length)];
  // 4択
  const options = [...new Set([p.ans, a, b, SHAPES[Math.floor(Math.random() * SHAPES.length)], SHAPES[Math.floor(Math.random() * SHAPES.length)]])].slice(0, 4);
  // 正解を含むようシャッフル
  const ansIdx = options.indexOf(p.ans);
  if (ansIdx === -1) options[0] = p.ans;
  // シャッフル
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    sequence: p.seq,
    options,
    answerIndex: options.indexOf(p.ans),
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
      <div className="flex justify-center items-center gap-2 text-5xl py-3">
        {q.sequence.map((s, i) => (
          <span key={i} className="text-slate-700">
            {s}
          </span>
        ))}
        <span className="text-slate-400 text-3xl">→</span>
        <span className="text-emerald-600">？</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {q.options.map((s, i) => (
          <button
            key={i}
            onClick={() => handlePick(i)}
            className={`text-4xl py-5 rounded-xl border-2 transition ${
              feedback && i === q.answerIndex
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </GameShell>
  );
};
