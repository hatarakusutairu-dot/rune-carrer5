import { useMemo, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

// 本物の Balloon Analogue Risk Task (BART) モデル
// - 各風船には隠された「爆発点」K がある（一様分布）
// - ポンプごとに pumps == K になったら確定爆発
// - 等価な確率モデル：j回目のポンプで爆発する確率は 1/(maxPossible - j + 1)
// - 結果として、ポンプを重ねるほど次の爆発確率は上がるが、各風船の運命は事前に決まっている

const TOTAL_BALLOONS = 6;
// 風船ごとに最小〜最大ポンプ数を変える（学術版BARTは128だが教育用に短縮）
const POP_RANGE: Array<[number, number]> = [
  [4, 12],   // やや簡単
  [6, 20],
  [8, 24],
  [5, 16],
  [10, 28],
  [7, 22],
];
const PUMP_VALUE = 1;

const colors = [
  'bg-red-400',
  'bg-yellow-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-pink-400',
];

const drawPopPoint = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const BalloonRisk = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  // 各風船の隠された爆発点
  const popPoints = useMemo(
    () => POP_RANGE.slice(0, TOTAL_BALLOONS).map(([min, max]) => drawPopPoint(min, max)),
    []
  );

  const [balloonIdx, setBalloonIdx] = useState(0);
  const [pumps, setPumps] = useState<number[]>([]);
  const [popped, setPopped] = useState<boolean[]>([]);
  const [banked, setBanked] = useState<number[]>([]);
  const [currentPumps, setCurrentPumps] = useState(0);
  const [showResult, setShowResult] = useState<'banked' | 'popped' | null>(null);
  const finishedRef = useRef(false);

  const finish = (p: number[], pp: boolean[], b: number[]) => {
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
    const popPoint = popPoints[balloonIdx];
    if (next >= popPoint) {
      // 爆発確定（事前に決まっている爆発点に到達）
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
  const balloonSize = Math.min(280, 80 + currentPumps * 8);

  return (
    <GameShell
      title="風船リスク"
      description="ふくらますほど高得点。でも割れたら0。各風船には限界がある（毎回違う）。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: balloonIdx + 1, total: TOTAL_BALLOONS }}
      footer={
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">この風船</div>
            <div className="text-xl font-black tabular-nums">{currentPumps}pt</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <div className="text-emerald-700">これまで合計</div>
            <div className="text-xl font-black text-emerald-800 tabular-nums">{totalBank}pt</div>
          </div>
        </div>
      }
    >
      <div className="flex justify-center items-end h-72 mt-2 relative">
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
