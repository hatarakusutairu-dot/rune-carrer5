import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSlides, type SlideRecord } from '@/lib/slidesDB';

export const SlidesRoute = () => {
  const [slides, setSlides] = useState<SlideRecord[]>([]);
  const [idx, setIdx] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listSlides()
      .then((list) => {
        setSlides(list);
        setPreviews(list.map((s) => URL.createObjectURL(s.blob)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      // unmount: revoke is handled in next effect via current refs; minimal cleanup here
    };
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previews.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
        setIdx((i) => Math.min(slides.length - 1, i + 1));
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        setIdx((i) => Math.max(0, i - 1));
        e.preventDefault();
      } else if (e.key === 'Home') {
        setIdx(0);
      } else if (e.key === 'End') {
        setIdx(slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">読み込み中…</div>;
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8 gap-4">
        <p className="text-lg">スライドが登録されていません。</p>
        <Link to="/admin" className="px-4 py-2 rounded bg-white text-black font-bold">
          管理ページでアップロード
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-black flex flex-col select-none"
      onClick={() => setIdx((i) => Math.min(slides.length - 1, i + 1))}
    >
      <div className="flex-1 flex items-center justify-center p-2">
        {previews[idx] && (
          <img
            src={previews[idx]}
            alt={slides[idx].name}
            className="max-w-full max-h-[100vh] object-contain"
          />
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-white/10 text-white tabular-nums">
          {idx + 1} / {slides.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
          title="全画面（F）"
        >
          ⛶
        </button>
        <Link
          to="/admin"
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
        >
          管理
        </Link>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40">
        ←/→ で移動　F で全画面　クリックで次へ
      </div>
    </div>
  );
};
