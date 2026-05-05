import { useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';
import { DecorImage } from '@/components/common/DecorImage';

// 用意してある画像枚数: 1, 3, 5, 7, 10
const COIN_IMAGE_SIZES = [1, 3, 5, 7, 10];
const coinImg = (n: number): string => {
  const closest = COIN_IMAGE_SIZES.reduce((a, b) =>
    Math.abs(b - n) < Math.abs(a - n) ? b : a,
  );
  return `/img/coin-${closest}.png`;
};

interface Scenario {
  partner: string;
  description: string;
}

const SCENARIOS: Scenario[] = [
  { partner: '仲のいい友達', description: 'よく一緒にいる気の合う友達と。' },
  { partner: '同じ部活のメンバー', description: '同じ部・サークルだけ親しくはない人と。' },
  { partner: '初対面のチームメイト', description: '今日たまたま組むことになった人と。' },
  { partner: 'いつもライバルの相手', description: '張り合うことが多い相手と。' },
  { partner: '名前も知らない人', description: '会ったこともない他校の人と。' },
];

export const MoneySplit = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [idx, setIdx] = useState(0);
  const [selfShares, setSelfShares] = useState<number[]>([]);
  const [draft, setDraft] = useState<number>(5);
  const finishedRef = useRef(false);

  const finish = (final: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete({ kind: 'money_split', selfShares: final });
  };

  useTimeoutOnce(startedAtMs, durationMs, () => finish(selfShares));

  const handleConfirm = () => {
    const next = [...selfShares, draft];
    if (idx + 1 >= SCENARIOS.length) {
      finish(next);
    } else {
      setSelfShares(next);
      setIdx(idx + 1);
      setDraft(5);
    }
  };

  const sc = SCENARIOS[idx];
  const partnerShare = 10 - draft;

  return (
    <GameShell
      title="コイン分配"
      description="10コインを自分と相手でどう分ける？"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      progress={{ current: idx + 1, total: SCENARIOS.length }}
    >
      <div className="rounded-xl bg-slate-50 p-3 mb-3">
        <div className="text-xs text-slate-500">相手</div>
        <div className="font-semibold">{sc.partner}</div>
        <p className="text-xs text-slate-600 mt-0.5">{sc.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
          {draft > 0 && (
            <DecorImage
              src={coinImg(draft)}
              alt={`コイン${draft}枚`}
              className="w-14 h-14 mx-auto object-contain mb-1"
            />
          )}
          <div className="text-xs text-emerald-700">自分</div>
          <div className="text-3xl font-black text-emerald-800">{draft}</div>
          <div className="text-[10px] text-emerald-700">コイン</div>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 border border-amber-200">
          {partnerShare > 0 && (
            <DecorImage
              src={coinImg(partnerShare)}
              alt={`コイン${partnerShare}枚`}
              className="w-14 h-14 mx-auto object-contain mb-1"
            />
          )}
          <div className="text-xs text-amber-700">相手</div>
          <div className="text-3xl font-black text-amber-800">{partnerShare}</div>
          <div className="text-[10px] text-amber-700">コイン</div>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={draft}
          onChange={(e) => setDraft(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>相手に全部</span>
          <span>半々</span>
          <span>自分に全部</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        className="mt-4 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
      >
        この配分にする
      </button>
    </GameShell>
  );
};
