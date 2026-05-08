import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSlides } from '@/lib/slidesDB';

// 表示用に統一された Slide 型（デフォルトデッキ・ローカル両方）
type DisplaySlide = {
  url: string;
  name: string;
  source: 'default' | 'local';
};

const fetchDefaultDeck = async (): Promise<DisplaySlide[]> => {
  try {
    const res = await fetch('/slides/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return [];
    const data: { slides?: string[] } = await res.json();
    if (!Array.isArray(data?.slides)) return [];
    return data.slides.map((name) => ({
      url: `/slides/${name}`,
      name,
      source: 'default' as const,
    }));
  } catch {
    return [];
  }
};

export const SlidesRoute = () => {
  const [slides, setSlides] = useState<DisplaySlide[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const localUrlsRef = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDefaultDeck(), listSlides()])
      .then(([defaults, locals]) => {
        if (cancelled) return;
        const localSlides: DisplaySlide[] = locals.map((s) => {
          const url = URL.createObjectURL(s.blob);
          localUrlsRef.current.push(url);
          return { url, name: s.name, source: 'local' };
        });
        // デフォルト先、ローカル後（ローカルは "おまけ" 扱い）
        setSlides([...defaults, ...localSlides]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
      localUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      localUrlsRef.current = [];
    };
  }, []);

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
        <p className="text-xs text-white/60 max-w-md text-center leading-relaxed">
          公式デッキ：<code className="bg-white/10 px-1 rounded">public/slides/</code> にPNG/JPGを入れて git push<br />
          一時テスト：<code className="bg-white/10 px-1 rounded">/admin</code> でアップロード（このPCのみ）
        </p>
        <Link to="/admin" className="px-4 py-2 rounded bg-white text-black font-bold">
          管理ページへ
        </Link>
      </div>
    );
  }

  const current = slides[idx];

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-black flex flex-col select-none"
      onClick={() => setIdx((i) => Math.min(slides.length - 1, i + 1))}
    >
      <div className="flex-1 flex items-center justify-center p-2">
        {current && (
          <img
            src={current.url}
            alt={current.name}
            className="max-w-full max-h-[100vh] object-contain"
          />
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-white/10 text-white tabular-nums">
          {idx + 1} / {slides.length}
        </span>
        {current?.source === 'local' && (
          <span className="px-2 py-1 rounded bg-violet-500/40 text-white" title="この端末のみのスライド">
            local
          </span>
        )}
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
