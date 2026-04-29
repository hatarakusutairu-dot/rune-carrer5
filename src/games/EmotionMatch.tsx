import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

// 8感情と対応する絵文字（AI画像未到着時のフォールバック）
const EMOTIONS = [
  { key: 'joy', label: '喜び', emoji: '😊' },
  { key: 'sad', label: '悲しみ', emoji: '😢' },
  { key: 'anger', label: '怒り', emoji: '😠' },
  { key: 'surprise', label: '驚き', emoji: '😲' },
  { key: 'fear', label: '恐れ', emoji: '😨' },
  { key: 'curiosity', label: '好奇心', emoji: '🤔' },
  { key: 'trust', label: '信頼', emoji: '😌' },
  { key: 'disgust', label: '嫌悪', emoji: '😖' },
] as const;

const TOTAL = 8;

interface Q {
  emoji: string;
  answer: string;
  options: string[];
}

const buildQuestions = (): Q[] => {
  const shuffled = [...EMOTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL).map((e) => {
    // 4択：正解 + 3個ダミー
    const distractors = EMOTIONS.filter((x) => x.key !== e.key)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((x) => x.label);
    const opts = [e.label, ...distractors].sort(() => Math.random() - 0.5);
    return { emoji: e.emoji, answer: e.label, options: opts };
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
    }, 600);
  };

  const q = questions[idx];

  return (
    <GameShell
      title="表情から気持ちを読む"
      description="この表情はどの感情？"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: idx + 1, total: TOTAL }}
    >
      <div className="flex justify-center py-4">
        <div className="text-8xl">{q.emoji}</div>
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
        AI画像配信時はここに多様な肖像イラストが表示されます（Pass 6で差し替え）
      </p>
    </GameShell>
  );
};
