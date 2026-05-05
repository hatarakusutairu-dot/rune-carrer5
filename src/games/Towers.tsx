import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';

// ハノイの塔風の計画力課題
// - 3つの杭、N個の円盤
// - 大きい円盤は小さい円盤の上に置けない
// - 1手ずつ移動。最少手数 = 2^N - 1
// - 解けたら次のパズル（円盤が増える）
// - Pymetrics の Towers 課題に近い

const PUZZLES: Array<{ disks: number; goalPeg: 0 | 1 | 2; startPeg: 0 | 1 | 2 }> = [
  { disks: 3, startPeg: 0, goalPeg: 2 },
  { disks: 3, startPeg: 0, goalPeg: 1 },
  { disks: 4, startPeg: 0, goalPeg: 2 },
  { disks: 4, startPeg: 1, goalPeg: 2 },
  { disks: 5, startPeg: 0, goalPeg: 2 },
];

const DISK_COLORS = [
  'bg-rose-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-orange-400',
];

const optimalMovesFor = (disks: number) => Math.pow(2, disks) - 1;

interface PuzzleResult {
  moves: number;
  optimal: number;
  solved: boolean;
}

export const Towers = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [pegs, setPegs] = useState<number[][]>(() => initialPegs(PUZZLES[0]));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [results, setResults] = useState<PuzzleResult[]>([]);
  const [feedback, setFeedback] = useState<'invalid' | 'solved' | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  const puzzle = PUZZLES[puzzleIdx];
  const optimal = optimalMovesFor(puzzle.disks);

  const finish = (final: PuzzleResult[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const totalMoves = final.reduce((a, r) => a + r.moves, 0);
    const totalOptimal = final.reduce((a, r) => a + (r.solved ? r.optimal : 0), 0);
    const solved = final.filter((r) => r.solved).length;
    onComplete({
      kind: 'towers',
      puzzlesSolved: solved,
      totalMoves,
      optimalMoves: totalOptimal,
      timeMs: Date.now() - startTimeRef.current,
    });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => finish(results));

  // 解けたか判定
  useEffect(() => {
    if (finishedRef.current) return;
    if (pegs[puzzle.goalPeg].length === puzzle.disks && pegs[puzzle.goalPeg][0] === puzzle.disks) {
      // 完成
      const newResult: PuzzleResult = { moves, optimal, solved: true };
      const all = [...results, newResult];
      setResults(all);
      setFeedback('solved');
      window.setTimeout(() => {
        if (puzzleIdx + 1 >= PUZZLES.length) {
          finish(all);
        } else {
          const nextIdx = puzzleIdx + 1;
          setPuzzleIdx(nextIdx);
          setPegs(initialPegs(PUZZLES[nextIdx]));
          setMoves(0);
          setSelected(null);
          setFeedback(null);
        }
      }, 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pegs]);

  const handleTap = (pegIdx: number) => {
    if (feedback === 'solved') return;
    const peg = pegs[pegIdx];
    if (selected === null) {
      // 円盤選択（一番上）
      if (peg.length === 0) return;
      setSelected(pegIdx);
    } else if (selected === pegIdx) {
      setSelected(null);
    } else {
      // 移動
      const fromPeg = pegs[selected];
      const top = fromPeg[fromPeg.length - 1];
      const targetTop = peg[peg.length - 1];
      if (targetTop !== undefined && targetTop < top) {
        setFeedback('invalid');
        window.setTimeout(() => setFeedback(null), 300);
        setSelected(null);
        return;
      }
      const newPegs = pegs.map((p, i) => {
        if (i === selected) return p.slice(0, -1);
        if (i === pegIdx) return [...p, top];
        return p;
      });
      setPegs(newPegs);
      setMoves((m) => m + 1);
      setSelected(null);
    }
  };

  const skipPuzzle = () => {
    if (feedback === 'solved') return;
    const newResult: PuzzleResult = { moves, optimal, solved: false };
    const all = [...results, newResult];
    setResults(all);
    if (puzzleIdx + 1 >= PUZZLES.length) {
      finish(all);
    } else {
      const nextIdx = puzzleIdx + 1;
      setPuzzleIdx(nextIdx);
      setPegs(initialPegs(PUZZLES[nextIdx]));
      setMoves(0);
      setSelected(null);
    }
  };

  const totalSolved = results.filter((r) => r.solved).length;

  return (
    <GameShell
      title="塔の移動"
      description={`大きい円盤は小さい円盤の上に置けない。${puzzle.disks}個全部を「ゴール」杭に移そう。`}
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: puzzleIdx + 1, total: PUZZLES.length }}
      footer={
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">手数</div>
            <div className="text-xl font-black tabular-nums">{moves}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">最少手数</div>
            <div className="text-xl font-black tabular-nums">{optimal}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <div className="text-emerald-700">解けた数</div>
            <div className="text-xl font-black text-emerald-800 tabular-nums">{totalSolved}</div>
          </div>
        </div>
      }
    >
      <div className={`grid grid-cols-3 gap-2 h-56 items-end ${feedback === 'invalid' ? 'animate-pulse' : ''}`}>
        {[0, 1, 2].map((pegIdx) => (
          <button
            key={pegIdx}
            onClick={() => handleTap(pegIdx)}
            className={`h-full flex flex-col-reverse items-center pb-2 rounded-xl border-2 transition relative ${
              selected === pegIdx
                ? 'border-amber-500 bg-amber-50'
                : pegIdx === puzzle.goalPeg
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {/* 杭ラベル */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">
              {pegIdx === puzzle.goalPeg ? '🎯 ゴール' : pegIdx === puzzle.startPeg ? 'スタート' : ''}
            </div>
            {pegs[pegIdx].map((disk, i) => (
              <div
                key={i}
                className={`${DISK_COLORS[disk - 1]} rounded shadow my-0.5 transition-all`}
                style={{ width: `${20 + disk * 15}%`, height: '14px' }}
              />
            ))}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500 text-center">
        杭をタップして円盤を選択 → 移動先の杭をタップ
      </p>
      <div className="mt-2 flex justify-center">
        <button
          onClick={skipPuzzle}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          このパズルをスキップ
        </button>
      </div>
    </GameShell>
  );
};

const initialPegs = (puzzle: { disks: number; startPeg: 0 | 1 | 2 }): number[][] => {
  const pegs: number[][] = [[], [], []];
  // 大きい円盤を下、小さい円盤を上
  for (let i = puzzle.disks; i >= 1; i--) pegs[puzzle.startPeg].push(i);
  return pegs;
};
