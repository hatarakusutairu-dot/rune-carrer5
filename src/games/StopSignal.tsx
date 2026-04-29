import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

const TOTAL_TRIALS = 30;
const STOP_RATE = 0.3; // 30%は赤（押してはいけない）

interface Trial {
  isStop: boolean;
  shownAt: number; // ms
  reactedAt: number | null; // ms or null（押さなかった）
}

export const StopSignal = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [current, setCurrent] = useState<{ isStop: boolean; shownAt: number } | null>(null);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (trials.length >= TOTAL_TRIALS) {
      complete(trials);
      return;
    }
    if (current) return;
    // 0.6〜1.4秒の間隔で次の刺激
    const delay = 600 + Math.random() * 800;
    const t = window.setTimeout(() => {
      setCurrent({ isStop: Math.random() < STOP_RATE, shownAt: Date.now() });
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trials, current]);

  // 刺激出現後、押さなければ900ms後に自動で次へ
  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => {
      // 押さなかった
      const trial: Trial = { ...current, reactedAt: null };
      setFeedback(current.isStop ? 'good' : 'bad');
      setTrials((prev) => [...prev, trial]);
      setCurrent(null);
      window.setTimeout(() => setFeedback(null), 250);
    }, 900);
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
    // commission：止まる場面で押した
    const commission = stopTrials.filter((t) => t.reactedAt !== null).length;
    // omission：押す場面で押さなかった
    const omission = goTrials.filter((t) => t.reactedAt === null).length;
    // 反応時間（押した試行の平均）
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
    window.setTimeout(() => setFeedback(null), 250);
  };

  return (
    <GameShell
      title="Stop Signal（信号反応）"
      description="緑が出たら即タップ。赤は押さない。"
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
      <div className="mt-2 text-xs text-slate-500 text-center">
        緑＝即タップ ／ 赤＝押さない
      </div>
    </GameShell>
  );
};
