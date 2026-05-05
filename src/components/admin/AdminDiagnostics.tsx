import { useEffect, useState } from 'react';
import {
  IMAGE_CATEGORIES,
  IMAGE_REGISTRY,
  type ImageSlot,
} from '@/content/imageRegistry';
import {
  getImageOverride,
  listOverrides,
  overrideStorageBytes,
} from '@/lib/imageOverride';
import { listSlides, totalBytes } from '@/lib/slidesDB';

type CheckResult = 'pending' | 'overridden' | 'public' | 'fallback';

const checkPath = async (src: string): Promise<CheckResult> => {
  if (getImageOverride(src)) return 'overridden';
  try {
    const res = await fetch(src, { method: 'HEAD' });
    if (res.ok) return 'public';
    return 'fallback';
  } catch {
    return 'fallback';
  }
};

const fmt = (b: number): string => {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(2)}MB`;
};

export const AdminDiagnostics = () => {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [overrideBytes, setOverrideBytes] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [slideBytes, setSlideBytes] = useState(0);
  const [overridesList, setOverridesList] = useState<Array<{ src: string; dataUrl: string }>>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const reload = async () => {
    setOverrideBytes(overrideStorageBytes());
    setOverridesList(listOverrides());
    try {
      const slides = await listSlides();
      setSlideCount(slides.length);
      setSlideBytes(await totalBytes());
    } catch {
      setSlideCount(0);
      setSlideBytes(0);
    }
    const init: Record<string, CheckResult> = {};
    for (const p of IMAGE_REGISTRY) init[p.src] = 'pending';
    setResults(init);
    const next = { ...init };
    // 並列度を制限（一度に大量のHEADを投げない）
    const chunkSize = 10;
    for (let i = 0; i < IMAGE_REGISTRY.length; i += chunkSize) {
      const chunk = IMAGE_REGISTRY.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (p) => {
          next[p.src] = await checkPath(p.src);
        }),
      );
      setResults({ ...next });
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const counts = IMAGE_REGISTRY.reduce(
    (acc, p) => {
      const r = results[p.src] ?? 'pending';
      acc[r]++;
      return acc;
    },
    { pending: 0, overridden: 0, public: 0, fallback: 0 } as Record<CheckResult, number>,
  );

  // カテゴリ別にグループ化
  const byCategory = IMAGE_CATEGORIES.map((cat) => {
    const slots = IMAGE_REGISTRY.filter((s) => s.category === cat);
    const cnt = slots.reduce(
      (acc, s) => {
        const r = results[s.src] ?? 'pending';
        acc[r]++;
        return acc;
      },
      { pending: 0, overridden: 0, public: 0, fallback: 0 } as Record<CheckResult, number>,
    );
    return { cat, slots, cnt };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat title="ローカル上書き画像" value={`${overridesList.length}枚`} sub={fmt(overrideBytes)} />
        <Stat title="スライド" value={`${slideCount}枚`} sub={fmt(slideBytes)} />
        <Stat
          title="public/img/ 配信状況"
          value={`${counts.public} 配置済 / ${IMAGE_REGISTRY.length}`}
          sub={`${counts.fallback} 未配置（絵文字）`}
        />
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold">画像スロット状態（カテゴリ別）</h4>
          <button
            onClick={reload}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
          >
            再チェック
          </button>
        </div>

        <div className="grid gap-2">
          {byCategory.map(({ cat, slots, cnt }) => {
            const isOpen = openCategory === cat;
            const total = slots.length;
            const placedRatio = total === 0 ? 0 : ((cnt.public + cnt.overridden) / total) * 100;
            return (
              <div key={cat} className="rounded-lg bg-slate-50 border border-slate-200">
                <button
                  onClick={() => setOpenCategory(isOpen ? null : cat)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left"
                >
                  <span className="font-bold text-sm">{cat}</span>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {cnt.public + cnt.overridden} / {total}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden mx-2">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${placedRatio}%` }}
                    />
                  </div>
                  {cnt.overridden > 0 && (
                    <span className="text-[10px] text-violet-700 font-semibold">
                      ◎{cnt.overridden}
                    </span>
                  )}
                  {cnt.fallback > 0 && (
                    <span className="text-[10px] text-amber-700 font-semibold">
                      ×{cnt.fallback}
                    </span>
                  )}
                  <span className="text-slate-400 text-xs">{isOpen ? '▼' : '▶'}</span>
                </button>
                {isOpen && (
                  <ul className="px-3 pb-2 grid gap-1 sm:grid-cols-2">
                    {slots.map((s) => (
                      <SlotRow key={s.src} slot={s} result={results[s.src] ?? 'pending'} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        優先順位: <strong>ローカル上書き</strong> →
        <strong> public/img/ の画像</strong> → <strong>絵文字フォールバック</strong>。
        本番（学校PCなど他端末）で表示するには <code>public/img/</code> に配置して git push してください。
      </p>
    </div>
  );
};

const SlotRow = ({ slot, result }: { slot: ImageSlot; result: CheckResult }) => {
  const meta = STATUS[result];
  return (
    <li className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white">
      <span className={`inline-flex items-center justify-center w-5 h-5 text-[10px] rounded-full ${meta.dot}`}>
        {meta.icon}
      </span>
      <span className="font-semibold text-slate-800 truncate flex-1">{slot.label}</span>
      <span className="text-slate-500 text-[10px] truncate" title={slot.src}>
        {slot.src.replace('/img/', '')}
      </span>
      <span className={`text-[10px] font-semibold ${meta.text}`}>{meta.label}</span>
    </li>
  );
};

const STATUS: Record<CheckResult, { icon: string; label: string; dot: string; text: string }> = {
  pending: { icon: '…', label: 'チェック中', dot: 'bg-slate-200 text-slate-600', text: 'text-slate-500' },
  overridden: { icon: '◎', label: '上書き', dot: 'bg-violet-200 text-violet-800', text: 'text-violet-700' },
  public: { icon: '○', label: '配置済', dot: 'bg-emerald-200 text-emerald-800', text: 'text-emerald-700' },
  fallback: { icon: '×', label: '未配置', dot: 'bg-amber-200 text-amber-800', text: 'text-amber-700' },
};

const Stat = ({ title, value, sub }: { title: string; value: string; sub: string }) => (
  <div className="rounded-xl bg-white border border-slate-200 p-3">
    <div className="text-[11px] text-slate-500">{title}</div>
    <div className="mt-1 text-xl font-black text-slate-800 tabular-nums">{value}</div>
    <div className="text-[11px] text-slate-500">{sub}</div>
  </div>
);
