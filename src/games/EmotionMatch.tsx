import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

// 16感情：基本8感情 + 微妙な8感情を加え、ダミーは類似ペアを優先
// 実際の採用感情認識テストでは、似た感情を見分ける微差が重視される
type Emotion = {
  key: string;
  label: string;
  emoji: string;
  // 紛らわしいペア（ダミー候補に優先採用）
  similar: string[];
};

const EMOTIONS: Emotion[] = [
  // 基本感情
  { key: 'joy', label: '喜び', emoji: '😄', similar: ['relief', 'excitement'] },
  { key: 'sad', label: '悲しみ', emoji: '😢', similar: ['lonely', 'disappointed'] },
  { key: 'anger', label: '怒り', emoji: '😠', similar: ['irritated', 'contempt'] },
  { key: 'surprise', label: '驚き', emoji: '😲', similar: ['confused', 'fear'] },
  { key: 'fear', label: '恐れ', emoji: '😨', similar: ['anxious', 'surprise'] },
  { key: 'disgust', label: '嫌悪', emoji: '🤢', similar: ['contempt', 'irritated'] },
  { key: 'trust', label: '信頼', emoji: '😌', similar: ['relief', 'peaceful'] },
  { key: 'anticipation', label: '期待', emoji: '🤩', similar: ['excitement', 'joy'] },

  // 微差・採用試験で出やすい
  { key: 'relief', label: '安堵', emoji: '😮‍💨', similar: ['joy', 'trust', 'peaceful'] },
  { key: 'lonely', label: '寂しさ', emoji: '🥺', similar: ['sad', 'disappointed'] },
  { key: 'irritated', label: '苛立ち', emoji: '😤', similar: ['anger', 'disgust'] },
  { key: 'confused', label: '戸惑い', emoji: '😕', similar: ['surprise', 'anxious'] },
  { key: 'anxious', label: '不安', emoji: '😟', similar: ['fear', 'sad', 'confused'] },
  { key: 'contempt', label: '軽蔑', emoji: '😏', similar: ['disgust', 'anger'] },
  { key: 'peaceful', label: '安らぎ', emoji: '😊', similar: ['trust', 'relief'] },
  { key: 'excitement', label: '興奮', emoji: '😆', similar: ['joy', 'anticipation'] },
  // ハードモード
  { key: 'disappointed', label: '落胆', emoji: '😔', similar: ['sad', 'lonely'] },
  { key: 'tense', label: '緊張', emoji: '😬', similar: ['anxious', 'fear'] },
];

const TOTAL = 12;

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
          src={`/img/emotions/${q.key}.png`}
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
        public/img/emotions/{'{key}'}.png を配置すると肖像イラストへ自動切替
      </p>
    </GameShell>
  );
};
