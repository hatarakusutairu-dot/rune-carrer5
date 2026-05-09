import { useEffect, useRef, useState } from 'react';
import type { GameProps } from './types';
import { GameShell } from './_GameShell';
import { useTimeoutOnce } from './_useTimer';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

// Knack の Wasabi Waiter に近い接客マルチタスク課題
// eスポーツコース生徒向けに難易度を上げた版:
//  - 席数 4
//  - 我慢時間 短い（5〜8秒）、後半さらに短縮
//  - 客到着間隔 短い（300〜800ms）、後半さらに加速
//  - 誤答ペナルティ：その席の patience が半減
//  - 注文を出す瞬間にメニューがランダム入れ替えで認知負荷UP

const SEAT_COUNT = 4;
const MENU = [
  { key: 'sushi', label: '寿司', icon: '🍣' },
  { key: 'ramen', label: 'ラーメン', icon: '🍜' },
  { key: 'tempura', label: '天ぷら', icon: '🍤' },
  { key: 'curry', label: 'カレー', icon: '🍛' },
  { key: 'salad', label: 'サラダ', icon: '🥗' },
  { key: 'tea', label: 'お茶', icon: '🍵' },
] as const;

type MenuItem = (typeof MENU)[number];

// 進行度0〜1に応じて [min, max] を線形補間
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

interface Customer {
  id: number;
  customerNum: number;
  happyFace: string;
  neutralFace: string;
  impatientFace: string;
  order: MenuItem;
  arrivedAt: number;
  patience: number;
}

const FACES_HAPPY = ['😀', '😊', '😄', '🙂', '😃'];
const FACES_NEUTRAL = ['😐', '😑'];
const FACES_IMPATIENT = ['😤', '😠', '😡'];

const pickRandom = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

let nextCustomerId = 1;

// 進行度に応じた我慢時間（後半ほど短い）
const newPatience = (progress: number): number => {
  const min = lerp(5500, 3500, progress);
  const max = lerp(8500, 5500, progress);
  return min + Math.random() * (max - min);
};

// 進行度に応じた客到着間隔
const nextArrivalDelay = (progress: number): number => {
  const min = lerp(350, 200, progress);
  const max = lerp(900, 500, progress);
  return min + Math.random() * (max - min);
};

const newCustomer = (now: number, progress: number): Customer => ({
  id: nextCustomerId++,
  customerNum: 1 + Math.floor(Math.random() * 8),
  happyFace: pickRandom(FACES_HAPPY),
  neutralFace: pickRandom(FACES_NEUTRAL),
  impatientFace: pickRandom(FACES_IMPATIENT),
  order: pickRandom(MENU),
  arrivedAt: now,
  patience: newPatience(progress),
});

const faceFor = (customer: Customer, now: number): string => {
  const elapsed = now - customer.arrivedAt;
  const ratio = elapsed / customer.patience;
  if (ratio < 0.5) return customer.happyFace;
  if (ratio < 0.8) return customer.neutralFace;
  return customer.impatientFace;
};

export const WasabiWaiter = ({ startedAtMs, durationMs, onComplete }: GameProps) => {
  const [seats, setSeats] = useState<Array<Customer | null>>(() => Array(SEAT_COUNT).fill(null));
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [served, setServed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [waitTimes, setWaitTimes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ seat: number; type: 'good' | 'bad' | 'lost' } | null>(null);
  const [now, setNow] = useState(Date.now());
  const finishedRef = useRef(false);

  // タイマー
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  // 新規客の自動発生（進行度に応じて間隔が短くなる）
  useEffect(() => {
    const empty = seats.findIndex((s) => s === null);
    if (empty < 0) return;
    const progress = Math.min(1, (Date.now() - startedAtMs) / durationMs);
    const t = window.setTimeout(() => {
      setSeats((prev) => {
        const arr = [...prev];
        const i = arr.findIndex((s) => s === null);
        if (i >= 0) arr[i] = newCustomer(Date.now(), progress);
        return arr;
      });
    }, nextArrivalDelay(progress));
    return () => clearTimeout(t);
  }, [seats, startedAtMs, durationMs]);

  // 我慢切れチェック
  useEffect(() => {
    let changed = false;
    const next = seats.map((c, i) => {
      if (!c) return c;
      if (now - c.arrivedAt > c.patience) {
        changed = true;
        setMissed((m) => m + 1);
        setFeedback({ seat: i, type: 'lost' });
        window.setTimeout(() => setFeedback(null), 350);
        return null;
      }
      return c;
    });
    if (changed) setSeats(next);
  }, [now, seats]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const avgWait = waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0;
    onComplete({
      kind: 'wasabi_waiter',
      served,
      correctOrders: correct,
      missed,
      avgWaitMs: avgWait,
    });
  };

  useTimeoutOnce(startedAtMs, durationMs, finish);

  const handleServe = (menuKey: string) => {
    if (selectedSeat === null) return;
    const c = seats[selectedSeat];
    if (!c) return;
    const isCorrect = c.order.key === menuKey;
    setServed((s) => s + 1);
    if (isCorrect) {
      setCorrect((s) => s + 1);
      setWaitTimes((arr) => [...arr, Date.now() - c.arrivedAt]);
      // 正解：客退店
      setFeedback({ seat: selectedSeat, type: 'good' });
      setSeats((prev) => {
        const arr = [...prev];
        arr[selectedSeat] = null;
        return arr;
      });
    } else {
      // 誤答ペナルティ：客は残るが我慢時間半減（強制的にイラつく）
      setFeedback({ seat: selectedSeat, type: 'bad' });
      setSeats((prev) => {
        const arr = [...prev];
        const cur = arr[selectedSeat];
        if (cur) {
          const elapsed = Date.now() - cur.arrivedAt;
          const remain = Math.max(0, cur.patience - elapsed);
          // 残時間を半分にして、すぐ怒り顔エリアへ
          arr[selectedSeat] = { ...cur, patience: elapsed + remain / 2 };
        }
        return arr;
      });
    }
    setSelectedSeat(null);
    window.setTimeout(() => setFeedback(null), 350);
  };

  return (
    <GameShell
      title="食堂タイム（マルチタスク接客）"
      description="お客さんを席ごと選んで、注文の料理を出してね。怒り出したら帰ってしまうよ。"
      startedAtMs={startedAtMs}
      durationMs={durationMs}
      footer={
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-emerald-50 p-2">
            <div className="text-emerald-700">提供</div>
            <div className="text-xl font-black text-emerald-800 tabular-nums">{served}</div>
          </div>
          <div className="rounded-lg bg-sky-50 p-2">
            <div className="text-sky-700">注文一致</div>
            <div className="text-xl font-black text-sky-800 tabular-nums">{correct}</div>
          </div>
          <div className="rounded-lg bg-red-50 p-2">
            <div className="text-red-700">取りこぼし</div>
            <div className="text-xl font-black text-red-700 tabular-nums">{missed}</div>
          </div>
        </div>
      }
    >
      {/* 席エリア */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {seats.map((c, i) => {
          const fb = feedback?.seat === i ? feedback.type : null;
          const isSelected = selectedSeat === i;
          return (
            <button
              key={i}
              onClick={() => c && setSelectedSeat(isSelected ? null : i)}
              disabled={!c}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition relative ${
                fb === 'good'
                  ? 'border-emerald-500 bg-emerald-50'
                  : fb === 'bad'
                    ? 'border-red-400 bg-red-50'
                    : fb === 'lost'
                      ? 'border-red-500 bg-red-100'
                      : isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : c
                          ? 'border-slate-300 bg-white'
                          : 'border-dashed border-slate-200 bg-slate-50'
              }`}
            >
              {c ? (
                <>
                  <ImageWithFallback
                    src={`/img/customer-${c.customerNum}.png`}
                    fallback={faceFor(c, now)}
                    alt="客"
                    imgClassName="w-14 h-14 rounded-full object-cover"
                    fallbackClassName="text-4xl leading-none"
                  />
                  <div className="mt-1 text-xs font-semibold flex items-center gap-1">
                    <ImageWithFallback
                      src={`/img/food-${c.order.key}.png`}
                      fallback={c.order.icon}
                      alt={c.order.label}
                      imgClassName="w-5 h-5 object-contain"
                      fallbackClassName="text-base leading-none"
                    />
                    <span>{c.order.label}</span>
                  </div>
                  {/* 我慢ゲージ */}
                  <div className="absolute bottom-1 left-2 right-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        (now - c.arrivedAt) / c.patience > 0.7
                          ? 'bg-red-500'
                          : (now - c.arrivedAt) / c.patience > 0.4
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                      }`}
                      style={{
                        width: `${Math.max(0, 100 - ((now - c.arrivedAt) / c.patience) * 100)}%`,
                      }}
                    />
                  </div>
                  {fb === 'good' && <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>}
                  {fb === 'bad' && <div className="absolute inset-0 flex items-center justify-center text-3xl">✕</div>}
                  {fb === 'lost' && <div className="absolute inset-0 flex items-center justify-center text-3xl">💢</div>}
                </>
              ) : (
                <div className="text-xs text-slate-400">空席</div>
              )}
            </button>
          );
        })}
      </div>

      {/* メニュー */}
      <div className="rounded-xl bg-slate-50 p-2">
        <div className="text-[10px] text-slate-500 mb-1 text-center">
          {selectedSeat !== null ? '料理を選んで提供' : '席を選んでから料理を出す'}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => handleServe(m.key)}
              disabled={selectedSeat === null}
              className="rounded-lg bg-white border border-slate-200 p-2 disabled:opacity-40 active:scale-95 flex flex-col items-center"
            >
              <ImageWithFallback
                src={`/img/food-${m.key}.png`}
                fallback={m.icon}
                alt={m.label}
                imgClassName="w-10 h-10 object-contain"
                fallbackClassName="text-2xl leading-none"
              />
              <div className="text-xs mt-0.5">{m.label}</div>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
