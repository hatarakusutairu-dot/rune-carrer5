import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

const SHOW_MS = 2000;
const STARTING_LEN = 3;
const MAX_LEN = 8;
const TRIALS_PER_LEN = 1;

const generateDigits = (len: number): string => {
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
};

type Phase = 'show' | 'input' | 'feedback';

export const DigitSpan = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [len, setLen] = useState(STARTING_LEN);
  const [trial, setTrial] = useState(0);
  const [digits, setDigits] = useState<string>(() => generateDigits(STARTING_LEN));
  const [phase, setPhase] = useState<Phase>('show');
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [maxLen, setMaxLen] = useState(STARTING_LEN);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const finishedRef = useRef(false);

  // 表示→入力遷移
  useEffect(() => {
    if (phase !== 'show') return;
    const t = window.setTimeout(() => setPhase('input'), SHOW_MS);
    return () => clearTimeout(t);
  }, [phase, digits]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'digit_span', correct, total, maxLen });
  };

  useTimeoutOnce(startedAtMs, durationMs, finish);

  const submit = () => {
    if (phase !== 'input') return;
    const isRight = input === digits;
    const newCorrect = correct + (isRight ? 1 : 0);
    const newTotal = total + 1;
    const newMaxLen = isRight ? Math.max(maxLen, len) : maxLen;
    setCorrect(newCorrect);
    setTotal(newTotal);
    setMaxLen(newMaxLen);
    setFeedback(isRight ? 'right' : 'wrong');
    setPhase('feedback');

    window.setTimeout(() => {
      setFeedback(null);
      setInput('');
      const nextTrial = trial + 1;
      if (nextTrial >= TRIALS_PER_LEN) {
        const nextLen = isRight ? len + 1 : len;
        if (!isRight || nextLen > MAX_LEN) {
          finishedRef.current = true;
          onComplete({
            kind: 'digit_span',
            correct: newCorrect,
            total: newTotal,
            maxLen: newMaxLen,
          });
          return;
        }
        setLen(nextLen);
        setTrial(0);
        setDigits(generateDigits(nextLen));
      } else {
        setTrial(nextTrial);
        setDigits(generateDigits(len));
      }
      setPhase('show');
    }, 800);
  };

  return (
    <GameShell
      title="Digit Span（数字記憶）"
      description="数字を覚えて入力。覚えた桁数までチャレンジ。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: total + 1, total: MAX_LEN - STARTING_LEN + 2 }}
    >
      {phase === 'show' && (
        <div className="py-10 text-center">
          <div className="text-xs text-slate-500 mb-2">覚えてください（{len}桁）</div>
          <div className="text-5xl font-black tracking-[0.4em] tabular-nums">{digits}</div>
        </div>
      )}
      {phase === 'input' && (
        <div className="py-4">
          <div className="text-xs text-slate-500 mb-2 text-center">
            さっきの数字を入力（{len}桁）
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, '').slice(0, len))}
            autoFocus
            className="w-full text-center text-3xl tracking-[0.4em] font-black tabular-nums rounded-xl border-2 border-slate-300 px-3 py-3 focus:border-teal-500 outline-none"
          />
          <button
            onClick={submit}
            disabled={input.length !== len}
            className="mt-3 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold"
          >
            送信
          </button>
        </div>
      )}
      {phase === 'feedback' && (
        <div className="py-10 text-center">
          <div className={`text-6xl ${feedback === 'right' ? 'text-emerald-500' : 'text-red-500'}`}>
            {feedback === 'right' ? '◎' : '✕'}
          </div>
          <div className="mt-2 text-sm text-slate-600">正解：{digits}</div>
        </div>
      )}
    </GameShell>
  );
};
