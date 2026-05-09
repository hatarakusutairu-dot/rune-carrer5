import { useEffect, useState } from 'react';
import { useSync } from '@/contexts/SyncContext';

// 生徒画面に表示するスライドプレビュー
// 講師の進行に追従、ゲーム中は非表示
export const StudentSlideView = () => {
  const { state } = useSync();
  const [slideNames, setSlideNames] = useState<string[]>([]);

  useEffect(() => {
    fetch('/slides/manifest.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data: { slides?: string[] }) => {
        setSlideNames(Array.isArray(data?.slides) ? data.slides : []);
      })
      .catch(() => {});
  }, []);

  if (!state || slideNames.length === 0) return null;
  // ゲーム実行中・カウントダウン中は出さない（ゲームに集中させる）
  if (state.phase === 'active' || state.phase === 'intro') return null;
  // スライド後フェーズ中も非表示（フェーズUIに譲る）
  if ((state.postSlideStep ?? 0) > 0) return null;

  const idx = Math.min(slideNames.length - 1, Math.max(0, state.slideIndex ?? 0));
  const name = slideNames[idx];
  if (!name) return null;

  return (
    <div className="rounded-xl bg-black overflow-hidden border border-slate-300 shadow mb-3">
      <div className="aspect-video flex items-center justify-center">
        <img
          src={`/slides/${name}`}
          alt=""
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};
