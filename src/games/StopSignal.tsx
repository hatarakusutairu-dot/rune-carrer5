import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

const TOTAL_TRIALS = 60;

// 段階的難易度：序盤はゆっくり、後半は短く
const ITI_INITIAL_MIN = 600;  // 初期インターバル下限
const ITI_INITIAL_MAX = 1100; // 初期インターバル上限
const ITI_FINAL_MIN = 200;
const ITI_FINAL_MAX = 500;

const SHOW_INITIAL_MS = 900;  // 反応猶予 初期
const SHOW_FINAL_MS = 380;    // 反応猶予 終盤

const STOP_RATE_INITIAL = 0.2;
const STOP_RATE_FINAL = 0.4;  // 後半はストップが増えて誘惑強化

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

interface Trial {
  isStop: boolean;
  shownAt: number;
  reactedAt: number | null;
  showMs: number;
}

export const StopSignal = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [current, setCurrent] = useState<{ isStop: boolean; shownAt: number; showMs: number } | null>(null);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const finishedRef = useRef(false);

  // 進行度（0..1）
  const progress = trials.length / TOTAL_TRIALS;
  const itiMin = lerp(ITI_INITIAL_MIN, ITI_FINAL_MIN, progress);
  const itiMax = lerp(ITI_INITIAL_MAX, ITI_FINAL_MAX, progress);
  const showMs = lerp(SHOW_INITIAL_MS, SHOW_FINAL_MS, progress);
  const stopRate = lerp(STOP_RATE_INITIAL, STOP_RATE_FINAL, progress);

  useEffect(() => {
    if (trials.length >= TOTAL_TRIALS) {
      complete(trials);
      return;
    }
    if (current) return;
    const delay = itiMin + Math.random() * (itiMax - itiMin);
    const t = window.setTimeout(() => {
      setCurrent({
        isStop: Math.random() < stopRate,
        shownAt: Date.now(),
        showMs,
      });
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trials, current]);

  // 刺激出現後、反応猶予内に押さなければ自動で次へ
  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => {
      const trial: Trial = { ...current, reactedAt: null };
      // 押すべき時に押さなかった = 見逃し（bad）。ストップ時に押さなかった = good
      setFeedback(current.isStop ? 'good' : 'bad');
      setTrials((prev) => [...prev, trial]);
      setCurrent(null);
      window.setTimeout(() => setFeedback(null), 200);
    }, current.showMs);
    return () => clearTimeout(t);
  }, [current]);

  useTimeoutOnce(startedAtMs, durationMs, () => {
    if (finishedRef.current) return;
    complete(trials);
  });

  const complete = (allTrials: Trial[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const goTrials = allTrials.filter((t) => !t.isStop);
    const stopTrials = allTrials.filter((t) => t.isStop);
    const commission = stopTrials.filter((t) => t.reactedAt !== null).length;
    const omission = goTrials.filter((t) => t.reactedAt === null).length;
    const reacted = allTrials.filter((t) => t.reactedAt !== null);
    const rtMs = reacted.length
      ? reacted.reduce((acc, t) => acc + (t.reactedAt! - t.shownAt), 0) / reacted.length
      : 0;
    onComplete({ kind: 'stop_signal', commission, omission, rtMs });
  };

  const handleTap = () => {
    if (!current) return;
    const trial: Trial = { ...current, reactedAt: Date.now() };
    setFeedback(current.isStop ? 'bad' : 'good');
    setTrials((prev) => [...prev, trial]);
    setCurrent(null);
    window.setTimeout(() => setFeedback(null), 200);
  };

  return (
    <GameShell
      title="信号反応（だんだん速く！）"
      description="緑が出たら即タップ。赤は押さない。後半ほどスピードアップ。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: trials.length, total: TOTAL_TRIALS }}
    >
      <button
        onClick={handleTap}
        className={`w-full h-56 rounded-2xl text-7xl font-black flex items-center justify-center select-none active:scale-[0.98] transition ${
          current?.isStop
            ? 'bg-red-500 text-white'
            : current
              ? 'bg-emerald-500 text-white'
              : feedback === 'good'
                ? 'bg-emerald-100 text-emerald-700'
                : feedback === 'bad'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-400'
        }`}
        aria-label="signal"
      >
        {current?.isStop ? '✋' : current ? '▶' : feedback === 'good' ? '◎' : feedback === 'bad' ? '✕' : '・'}
      </button>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
        <div>反応猶予<br /><span className="font-bold text-slate-700 text-sm">{Math.round(showMs)}ms</span></div>
        <div>STOP頻度<br /><span className="font-bold text-slate-700 text-sm">{Math.round(stopRate * 100)}%</span></div>
        <div>進行度<br /><span className="font-bold text-slate-700 text-sm">{Math.round(progress * 100)}%</span></div>
      </div>
      <div className="mt-2 text-xs text-slate-500 text-center">
        緑＝即タップ／赤＝押さない（だんだん速くなる）
      </div>
    </GameShell>
  );
};
