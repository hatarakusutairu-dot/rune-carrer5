import { useEffect, useRef, useState } from 'react';
import {
  addSlide,
  clearSlides,
  deleteSlide,
  listSlides,
  totalBytes,
  updateSlideOrder,
  type SlideRecord,
} from '@/lib/slidesDB';
import { imageDimensions, pdfToImages } from '@/lib/pdfToImages';

const fmtSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

export const AdminSlides = () => {
  const [slides, setSlides] = useState<SlideRecord[]>([]);
  const [bytes, setBytes] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = async () => {
    const list = await listSlides();
    setSlides(list);
    setBytes(await totalBytes());
    // 旧URLを破棄して新規作成
    setPreviews((prev) => {
      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
      const next: Record<number, string> = {};
      for (const s of list) {
        if (s.id !== undefined) next[s.id] = URL.createObjectURL(s.blob);
      }
      return next;
    });
  };

  useEffect(() => {
    reload().catch((e) => setError(String(e)));
    return () => {
      setPreviews((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    setProgress(null);
    try {
      const baseOrder =
        slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 0;
      let added = 0;
      for (const file of Array.from(files)) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          setProgress(`${file.name}: PDFを読み込み中…`);
          const pages = await pdfToImages(file, (cur, total) => {
            setProgress(`${file.name}: ${cur}/${total} ページ変換中…`);
          });
          for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            await addSlide({
              order: baseOrder + added,
              name: `${file.name} - p${i + 1}`,
              blob: p.blob,
              mime: 'image/png',
              width: p.width,
              height: p.height,
              createdAt: Date.now(),
            });
            added++;
          }
        } else if (file.type.startsWith('image/')) {
          setProgress(`${file.name}: 画像を読み込み中…`);
          const dim = await imageDimensions(file);
          await addSlide({
            order: baseOrder + added,
            name: file.name,
            blob: file,
            mime: file.type,
            width: dim.width,
            height: dim.height,
            createdAt: Date.now(),
          });
          added++;
        } else {
          setError(`非対応の形式: ${file.name}（PNG/JPG/PDFのみ）`);
        }
      }
      await reload();
      setProgress(null);
    } catch (e) {
      setError(String(e));
      setProgress(null);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= slides.length) return;
    const a = slides[idx];
    const b = slides[ni];
    if (a.id === undefined || b.id === undefined) return;
    await updateSlideOrder([
      { id: a.id, order: b.order },
      { id: b.id, order: a.order },
    ]);
    await reload();
  };

  const remove = async (id: number) => {
    if (!confirm('このスライドを削除しますか？')) return;
    await deleteSlide(id);
    await reload();
  };

  const removeAll = async () => {
    if (!confirm(`全${slides.length}枚を削除しますか？（取り消せません）`)) return;
    await clearSlides();
    await reload();
  };

  const openPreview = () => {
    if (slides.length === 0) return;
    window.open('/slides', '_blank', 'noopener');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf,.png,.jpg,.jpeg,.pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={busy}
          className="text-sm"
        />
        <button
          onClick={openPreview}
          disabled={slides.length === 0}
          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
        >
          スライドを表示（別タブ）
        </button>
        {slides.length > 0 && (
          <button
            onClick={removeAll}
            disabled={busy}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 ml-auto"
          >
            全削除
          </button>
        )}
      </div>

      <div className="text-xs text-slate-600">
        登録枚数: <span className="font-bold tabular-nums">{slides.length}</span>
        合計サイズ: <span className="font-bold tabular-nums">{fmtSize(bytes)}</span>
        <span className="text-slate-400">　（端末ローカルのIndexedDBに保存）</span>
      </div>

      {progress && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
          ⏳ {progress}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          ⚠ {error}
        </div>
      )}

      {slides.length === 0 ? (
        <div className="rounded-xl bg-white/70 border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          スライドが未登録です。PNG/JPG/PDF をアップロードしてください。
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((s, idx) => (
            <li key={s.id} className="rounded-xl bg-white border border-slate-200 p-2 shadow-sm">
              <div className="aspect-video bg-slate-50 rounded overflow-hidden flex items-center justify-center">
                {s.id !== undefined && previews[s.id] ? (
                  <img
                    src={previews[s.id]}
                    alt={s.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-xs">読み込み中…</span>
                )}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-700 truncate" title={s.name}>
                {idx + 1}. {s.name}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                {s.width}×{s.height}　{fmtSize(s.blob.size)}
              </div>
              <div className="mt-1.5 flex gap-1">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="flex-1 text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                  aria-label="上へ"
                >
                  ←
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === slides.length - 1}
                  className="flex-1 text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                  aria-label="下へ"
                >
                  →
                </button>
                <button
                  onClick={() => s.id !== undefined && remove(s.id)}
                  className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700"
                  aria-label="削除"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed space-y-1">
        <p>
          <strong>📌 これは「この端末だけ」のスライド</strong>です。当日の差し替えやテスト用。
        </p>
        <p>
          <strong>本番用デッキ</strong>は <code className="bg-white px-1 rounded">public/slides/</code>{' '}
          に PNG/JPG/GIF を入れて git push してください（自動で manifest.json が更新されて全端末に反映）。
        </p>
        <p className="text-amber-700">
          /slides 再生時の順序：<strong>本番デッキ → ローカルアップ</strong>（ファイル名昇順）
        </p>
      </div>
    </div>
  );
};
