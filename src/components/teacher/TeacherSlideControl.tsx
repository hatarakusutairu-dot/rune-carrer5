import { useEffect, useState } from 'react';
import { useSync } from '@/contexts/SyncContext';

// 講師ホーム画面の最上部に置く「▶ 次へ」コントロール
// このボタン1つでスライド・Stage・ゲームが連動して進む
export const TeacherSlideControl = () => {
  const { state, send } = useSync();
  const [slideNames, setSlideNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // manifest.json から取得（プレビュー表示用）
  useEffect(() => {
    fetch('/slides/manifest.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data: { slides?: string[] }) => {
        setSlideNames(Array.isArray(data?.slides) ? data.slides : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!state) return null;

  const idx = state.slideIndex ?? 0;
  const total = slideNames.length;
  const currentName = slideNames[idx] ?? '';
  const isLast = total === 0 ? true : idx >= total - 1;
  const isFirst = idx <= 0;

  const goNext = () => send({ type: 'T_NEXT_SLIDE' });
  const goPrev = () => send({ type: 'T_PREV_SLIDE' });

  if (total === 0 && !loading) {
    return (
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 text-sm">
        <div className="font-bold text-amber-900 mb-1">⚠ スライドが未配置</div>
        <div className="text-amber-800">
          <code className="bg-white px-1 rounded text-xs">public/slides/</code> に PNG/JPG/PDF を配置して
          git push、再ビルドすると ▶ 次へ ボタンで進行できるようになります。
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-100 via-orange-50 to-amber-50 border-2 border-rose-300 p-3 sm:p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm sm:text-base font-bold text-rose-900">
          🎬 スライド進行
        </h3>
        <span className="text-xs text-slate-600 tabular-nums">
          {idx + 1} / {total}
        </span>
      </div>

      {/* プレビュー */}
      {currentName && (
        <div className="rounded-xl bg-black overflow-hidden shadow-inner mb-3">
          <div className="aspect-video flex items-center justify-center">
            <img
              src={`/slides/${currentName}`}
              alt={currentName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* メインの「▶ 次へ」ボタン（最重要） */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="col-span-1 py-3 rounded-xl bg-white border-2 border-rose-300 text-rose-800 font-bold text-base hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◀ 戻る
        </button>
        <button
          onClick={goNext}
          disabled={isLast}
          className="col-span-3 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg sm:text-xl shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ▶ 次へ進む
        </button>
      </div>

      <div className="mt-2 text-[11px] text-slate-600 leading-relaxed">
        このボタン1つでスライドが進み、Stage/ゲームも自動で同期します。
        {currentName && (
          <span className="block mt-0.5 text-slate-500 truncate">
            現在：<code className="bg-white/60 px-1 rounded">{currentName}</code>
          </span>
        )}
      </div>
    </div>
  );
};
