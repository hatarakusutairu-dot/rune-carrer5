import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { EMOTIONS, type Emotion } from '../content/emotions';

const TOTAL = 10;

interface Q {
  key: string;
  emoji: string;
  answer: string;
  options: string[];
}

const buildQuestions = (): Q[] => {
  const shuffled = [...EMOTIONS].sort(() => Math.random() - 0.5);
  const list: Emotion[] = [];
  while (list.length < TOTAL) list.push(...shuffled);
  return list.slice(0, TOTAL).map((e) => {
    // ダミー：similarに含まれる感情を優先採用、足りなければランダム
    const similars = EMOTIONS.filter((x) => e.similar.includes(x.key));
    const others = EMOTIONS.filter(
      (x) => x.key !== e.key && !e.similar.includes(x.key)
    );
    const pool = [
      ...similars.sort(() => Math.random() - 0.5),
      ...others.sort(() => Math.random() - 0.5),
    ];
    const distractors = pool.slice(0, 3).map((x) => x.label);
    const opts = [e.label, ...distractors].sort(() => Math.random() - 0.5);
    return { key: e.key, emoji: e.emoji, answer: e.label, options: opts };
  });
};

export const EmotionMatch = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const questions = useMemo(() => buildQuestions(), []);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const finishedRef = useRef(false);

  const finish = (correctCount: number, total: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'emotion_match', correct: correctCount, total });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => finish(correct, idx));

  const handlePick = (label: string) => {
    if (picked) return;
    const q = questions[idx];
    const isRight = label === q.answer;
    setPicked(label);
    if (isRight) setCorrect((c) => c + 1);
    window.setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= TOTAL) {
        finish(correct + (isRight ? 1 : 0), TOTAL);
      } else {
        setIdx((n) => n + 1);
      }
    }, 700);
  };

  const q = questions[idx];

  return (
    <GameShell
      title="表情から気持ちを読む"
      description="似た感情が混ざります。微妙な違いを見抜こう。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: idx + 1, total: TOTAL }}
    >
      <div className="flex justify-center py-3">
        <ImageWithFallback
          src={`/img/emotion-${q.key}.png`}
          fallback={q.emoji}
          alt={q.answer}
          imgClassName="w-32 h-32 rounded-2xl object-cover shadow-sm"
          fallbackClassName="text-8xl leading-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((label) => {
          const isAnswer = picked && label === q.answer;
          const isWrong = picked === label && label !== q.answer;
          return (
            <button
              key={label}
              onClick={() => handlePick(label)}
              className={`py-3 rounded-xl border-2 font-semibold transition ${
                isAnswer
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : isWrong
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500 text-center">
        public/img/emotion-{'{key}'}.png を配置すると肖像イラストへ自動切替
      </p>
    </GameShell>
  );
};
