import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { restoreTeacherSession, useSync } from '@/contexts/SyncContext';

// /slides は投影専用：サーバー（state.slideIndex）に従って自動表示
// 講師の「▶ 次へ」ボタンが押されるとリアルタイム反映される
export const SlidesRoute = () => {
  const { state, resumeAsTeacher } = useSync();
  const [slideNames, setSlideNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // /teacher タブと同じ localStorage トークンを使って自動再接続（同ブラウザ）
  useEffect(() => {
    if (state) return;
    const sess = restoreTeacherSession();
    if (sess) {
      resumeAsTeacher(sess.code, sess.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/slides/manifest.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data: { slides?: string[] }) => {
        setSlideNames(Array.isArray(data?.slides) ? data.slides : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        読み込み中…
      </div>
    );
  }

  if (slideNames.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8 gap-4">
        <p className="text-lg">スライドが登録されていません。</p>
        <p className="text-xs text-white/60 max-w-md text-center leading-relaxed">
          <code className="bg-white/10 px-1 rounded">public/slides/</code> にPNG/JPG/GIFを入れて git push してください。
        </p>
        <Link to="/admin" className="px-4 py-2 rounded bg-white text-black font-bold">
          管理ページへ
        </Link>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8 gap-4">
        <p className="text-lg">講師ルームが未接続です。</p>
        <p className="text-xs text-white/60 max-w-md text-center">
          <code className="bg-white/10 px-1 rounded">/teacher</code> でルーム作成すると、このページにスライドが表示されます。
        </p>
        <Link to="/teacher" className="px-4 py-2 rounded bg-white text-black font-bold">
          講師モードへ
        </Link>
      </div>
    );
  }

  const idx = Math.min(slideNames.length - 1, Math.max(0, state.slideIndex ?? 0));
  const currentName = slideNames[idx];

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-black flex flex-col select-none"
    >
      <div className="flex-1 flex items-center justify-center p-2">
        {currentName && (
          <img
            src={`/slides/${currentName}`}
            alt={currentName}
            className="max-w-full max-h-[100vh] object-contain"
          />
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-white/10 text-white tabular-nums">
          {idx + 1} / {slideNames.length}
        </span>
        <button
          onClick={toggleFullscreen}
          className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
          title="全画面（F）"
        >
          ⛶
        </button>
        <Link
          to="/teacher"
          className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
        >
          講師
        </Link>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40">
        進行は /teacher の「▶ 次へ」で操作 / F で全画面
      </div>
    </div>
  );
};
