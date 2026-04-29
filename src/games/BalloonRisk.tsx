import { useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

const TOTAL_BALLOONS = 3;
const PUMP_VALUE = 1; // 1ポンプ = 1pt
const POP_BASE_PROB = 0.04; // 1ポンプ目から徐々に上がる
const POP_PROB_GROWTH = 0.02;

const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400'];

export const BalloonRisk = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [balloonIdx, setBalloonIdx] = useState(0);
  const [pumps, setPumps] = useState<number[]>([]);
  const [popped, setPopped] = useState<boolean[]>([]);
  const [banked, setBanked] = useState<number[]>([]);
  const [currentPumps, setCurrentPumps] = useState(0);
  const [showResult, setShowResult] = useState<'banked' | 'popped' | null>(null);
  const finishedRef = useRef(false);

  const finish = (
    p: number[],
    pp: boolean[],
    b: number[]
  ) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'balloon', pumps: p, popped: pp, banked: b });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => finish(pumps, popped, banked));

  const proceed = (p: number[], pp: boolean[], b: number[]) => {
    if (balloonIdx + 1 >= TOTAL_BALLOONS) {
      finish(p, pp, b);
      return;
    }
    setBalloonIdx((i) => i + 1);
    setCurrentPumps(0);
    setShowResult(null);
  };

  const handlePump = () => {
    if (showResult) return;
    const next = currentPumps + 1;
    const popProb = POP_BASE_PROB + POP_PROB_GROWTH * (next - 1);
    if (Math.random() < popProb) {
      // 割れた
      const np = [...pumps, next];
      const npp = [...popped, true];
      const nb = [...banked, 0];
      setPumps(np);
      setPopped(npp);
      setBanked(nb);
      setShowResult('popped');
      window.setTimeout(() => proceed(np, npp, nb), 1100);
    } else {
      setCurrentPumps(next);
    }
  };

  const handleBank = () => {
    if (showResult) return;
    const np = [...pumps, currentPumps];
    const npp = [...popped, false];
    const nb = [...banked, currentPumps * PUMP_VALUE];
    setPumps(np);
    setPopped(npp);
    setBanked(nb);
    setShowResult('banked');
    window.setTimeout(() => proceed(np, npp, nb), 800);
  };

  const totalBank = banked.reduce((a, b) => a + b, 0);
  const balloonSize = Math.min(280, 80 + currentPumps * 12);

  return (
    <GameShell
      title="Balloon Risk（風船リスク）"
      description="タップで膨らます／STOPで確定。割れたら0pt。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: balloonIdx + 1, total: TOTAL_BALLOONS }}
    >
      <div className="text-xs text-slate-600 flex justify-between">
        <span>このバルーン：{currentPumps}pt</span>
        <span>これまで合計：{totalBank}pt</span>
      </div>
      <div className="flex justify-center items-end h-72 mt-4 relative">
        {showResult === 'popped' ? (
          <div className="text-7xl">💥</div>
        ) : showResult === 'banked' ? (
          <div className="text-7xl">💰</div>
        ) : (
          <div
            className={`${colors[balloonIdx % colors.length]} rounded-full transition-all duration-200 shadow-lg`}
            style={{ width: `${balloonSize}px`, height: `${balloonSize}px` }}
          />
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={handlePump}
          disabled={!!showResult}
          className="py-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold"
        >
          ふくらます
        </button>
        <button
          onClick={handleBank}
          disabled={!!showResult || currentPumps === 0}
          className="py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold"
        >
          STOP（確定）
        </button>
      </div>
    </GameShell>
  );
};
