import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

// 適応式（staircase）数字記憶課題
// - 時間制限内、何度でも挑戦
// - 桁数 N で正解 → N+1 桁
// - 不正解 → N-1 桁（下限あり）
// - 表示時間は桁数に応じて（多いほど長く見せる）
// - 自分の限界が見える「どこまで覚えられるか」体験

const MIN_LEN = 3;
const MAX_LEN = 10; // 人間の限界 7±2 を考慮
const STARTING_LEN = 4;
const SHOW_BASE_MS = 800;
const SHOW_PER_DIGIT_MS = 350;
const SHOW_MAX_MS = 5000;
const FEEDBACK_MS = 500;

const generateDigits = (len: number): string => {
  let s = '';
  let prev = '';
  for (let i = 0; i < len; i++) {
    let d = Math.floor(Math.random() * 10).toString();
    // 同じ数字が3回連続しないよう緩く制約
    if (i > 0 && d === prev && Math.random() < 0.5) {
      d = ((Number(d) + 1 + Math.floor(Math.random() * 8)) % 10).toString();
    }
    s += d;
    prev = d;
  }
  return s;
};

const showMsFor = (len: number) =>
  Math.min(SHOW_MAX_MS, SHOW_BASE_MS + len * SHOW_PER_DIGIT_MS);

type Phase = 'show' | 'input' | 'feedback';

export const DigitSpan = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [len, setLen] = useState(STARTING_LEN);
  const [digits, setDigits] = useState<string>(() => generateDigits(STARTING_LEN));
  const [phase, setPhase] = useState<Phase>('show');
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [maxLen, setMaxLen] = useState(STARTING_LEN);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const finishedRef = useRef(false);

  // 表示→入力遷移
  const showMs = useMemo(() => showMsFor(len), [len]);
  useEffect(() => {
    if (phase !== 'show') return;
    const t = window.setTimeout(() => setPhase('input'), showMs);
    return () => clearTimeout(t);
  }, [phase, digits, showMs]);

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
    let newLen = len;
    let newMaxLen = maxLen;
    if (isRight) {
      newMaxLen = Math.max(maxLen, len);
      newLen = Math.min(MAX_LEN, len + 1);
    } else {
      newLen = Math.max(MIN_LEN, len - 1);
    }
    setCorrect(newCorrect);
    setTotal(newTotal);
    setMaxLen(newMaxLen);
    setFeedback(isRight ? 'right' : 'wrong');
    setPhase('feedback');

    window.setTimeout(() => {
      setFeedback(null);
      setInput('');
      setLen(newLen);
      setDigits(generateDigits(newLen));
      setPhase('show');
    }, FEEDBACK_MS);
  };

  return (
    <GameShell
      title="数字記憶"
      description="正解で +1 桁、間違えで -1 桁。時間内に自分の限界を探そう。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: maxLen, total: MAX_LEN, label: '最高記録' }}
      footer={
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">いまの桁数</div>
            <div className="text-xl font-black tabular-nums">{len}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <div className="text-emerald-700">最高記録</div>
            <div className="text-xl font-black text-emerald-800 tabular-nums">{maxLen}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">挑戦回数</div>
            <div className="text-xl font-black tabular-nums">{total}</div>
          </div>
        </div>
      }
    >
      {phase === 'show' && (
        <div className="py-8 text-center">
          <div className="text-xs text-slate-500 mb-2">覚えてください（{len}桁）</div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.1em] sm:tracking-[0.25em] md:tracking-[0.4em] tabular-nums select-none break-all leading-relaxed">
            {digits}
          </div>
        </div>
      )}
      {phase === 'input' && (
        <form
          className="py-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="text-xs text-slate-500 mb-2 text-center">
            さっきの数字を入力（{len}桁） / Enterで送信
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, '').slice(0, len))}
            autoFocus
            className="w-full text-center text-2xl sm:text-3xl tracking-[0.15em] sm:tracking-[0.3em] font-black tabular-nums rounded-xl border-2 border-slate-300 px-3 py-3 focus:border-teal-500 outline-none"
          />
          <button
            type="submit"
            disabled={input.length !== len}
            className="mt-3 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold"
          >
            送信
          </button>
        </form>
      )}
      {phase === 'feedback' && (
        <div className="py-8 text-center">
          <div className={`text-6xl ${feedback === 'right' ? 'text-emerald-500' : 'text-red-500'}`}>
            {feedback === 'right' ? '◎' : '✕'}
          </div>
          <div className="mt-2 text-sm text-slate-600">正解：{digits}</div>
          <div className="mt-1 text-xs text-slate-500">
            {feedback === 'right' ? `次は ${Math.min(len + 1, MAX_LEN)} 桁` : `次は ${Math.max(len - 1, MIN_LEN)} 桁`}
          </div>
        </div>
      )}
    </GameShell>
  );
};
