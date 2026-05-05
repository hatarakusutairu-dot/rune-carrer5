import { useEffect, useState } from 'react';
import { EMOTIONS } from '@/content/emotions';
import { AI_AVATARS } from '@/content/aiAvatars';
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

const ALL_PATHS = [
  ...EMOTIONS.map((e) => ({ src: `/img/emotion-${e.key}.png`, label: e.label, fallback: e.emoji })),
  ...AI_AVATARS.map((a) => ({ src: `/img/avatar-${a.key}.png`, label: a.name, fallback: a.face })),
];

export const AdminDiagnostics = () => {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [overrideBytes, setOverrideBytes] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [slideBytes, setSlideBytes] = useState(0);
  const [overridesList, setOverridesList] = useState<Array<{ src: string; dataUrl: string }>>([]);

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
    for (const p of ALL_PATHS) init[p.src] = 'pending';
    setResults(init);
    const next = { ...init };
    await Promise.all(
      ALL_PATHS.map(async (p) => {
        next[p.src] = await checkPath(p.src);
      }),
    );
    setResults({ ...next });
  };

  useEffect(() => {
    reload();
  }, []);

  const counts = ALL_PATHS.reduce(
    (acc, p) => {
      const r = results[p.src] ?? 'pending';
      acc[r]++;
      return acc;
    },
    { pending: 0, overridden: 0, public: 0, fallback: 0 } as Record<CheckResult, number>,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat title="ローカル上書き画像" value={`${overridesList.length}枚`} sub={fmt(overrideBytes)} />
        <Stat title="スライド" value={`${slideCount}枚`} sub={fmt(slideBytes)} />
        <Stat
          title="public/img/ 配信状況"
          value={`${counts.public} 配置済 / ${ALL_PATHS.length}`}
          sub={`${counts.fallback} 未配置（絵文字表示）`}
        />
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold">画像スロット状態</h4>
          <button
            onClick={reload}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
          >
            再チェック
          </button>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2 text-[11px]">
          {ALL_PATHS.map((p) => {
            const r = results[p.src] ?? 'pending';
            const meta = STATUS[r];
            return (
              <li key={p.src} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50">
                <span className={`inline-flex items-center justify-center w-5 h-5 text-[10px] rounded-full ${meta.dot}`}>
                  {meta.icon}
                </span>
                <span className="font-semibold text-slate-800 w-20 shrink-0 truncate">{p.label}</span>
                <span className="text-slate-500 truncate flex-1" title={p.src}>{p.src}</span>
                <span className={`text-[10px] font-semibold ${meta.text}`}>{meta.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        優先順位: <strong>ローカル上書き</strong> →
        <strong> public/img/ の画像</strong> → <strong>絵文字フォールバック</strong>。
        どれが効いているかを上のリストで確認できます。
      </p>
    </div>
  );
};

const STATUS: Record<CheckResult, { icon: string; label: string; dot: string; text: string }> = {
  pending: { icon: '…', label: 'チェック中', dot: 'bg-slate-200 text-slate-600', text: 'text-slate-500' },
  overridden: { icon: '◎', label: '上書き', dot: 'bg-violet-200 text-violet-800', text: 'text-violet-700' },
  public: { icon: '○', label: '配置済', dot: 'bg-emerald-200 text-emerald-800', text: 'text-emerald-700' },
  fallback: { icon: '×', label: '未配置（絵文字）', dot: 'bg-amber-200 text-amber-800', text: 'text-amber-700' },
};

const Stat = ({ title, value, sub }: { title: string; value: string; sub: string }) => (
  <div className="rounded-xl bg-white border border-slate-200 p-3">
    <div className="text-[11px] text-slate-500">{title}</div>
    <div className="mt-1 text-xl font-black text-slate-800 tabular-nums">{value}</div>
    <div className="text-[11px] text-slate-500">{sub}</div>
  </div>
);
