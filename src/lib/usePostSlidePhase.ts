import { useEffect, useState } from 'react';
import { currentPhaseFor, type PostSlidePhase } from '@shared/slidePhases';
import { useSync } from '@/contexts/SyncContext';

// 現在表示中のスライドファイル名 + 後フェーズステップから、
// アクティブなフェーズ名を返す。null なら通常のスライド表示中。
export const usePostSlidePhase = (): {
  phase: PostSlidePhase | null;
  slideName: string;
  slideIndex: number;
} => {
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

  const idx = state?.slideIndex ?? 0;
  const step = state?.postSlideStep ?? 0;
  const slideName = slideNames[idx] ?? '';
  const phase = currentPhaseFor(slideName, step);

  return { phase, slideName, slideIndex: idx };
};
