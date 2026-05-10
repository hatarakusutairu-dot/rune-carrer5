import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSync, ReactionBurst } from '@/contexts/SyncContext';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import type { ReactionEmoji } from '@shared/protocol';

interface FloatingReaction extends ReactionBurst {
  x: number; // 0-100 (%)
  fromLeft: boolean;
}

const REACTION_KEY: Record<ReactionEmoji, string> = {
  '👍': 'thumbs',
  '❤️': 'heart',
  '😂': 'laugh',
  '😮': 'surprise',
  '🌱': 'sprout',
  '🔥': 'fire',
  '👏': 'clap',
  '🎉': 'party',
};

export const ReactionStream = () => {
  const { reactionBursts } = useSync();
  const [floats, setFloats] = useState<FloatingReaction[]>([]);
  // 全画面要素を検知して、そこにポータル描画する（投影中も見えるように）
  const [fsElement, setFsElement] = useState<Element | null>(null);

  useEffect(() => {
    const update = () => setFsElement(document.fullscreenElement);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  // 新しい reaction が来たら 1 個だけ float を追加
  // 既処理 id は重複追加しない（1回押し=1個保証）
  // タイマーは effect の cleanup でキャンセルしない（複数押しで前の float が残る不具合修正）
  useEffect(() => {
    if (reactionBursts.length === 0) return;
    const last = reactionBursts[reactionBursts.length - 1];
    let added = false;
    setFloats((prev) => {
      if (prev.some((f) => f.id === last.id)) return prev;
      added = true;
      const fromLeft = Math.random() < 0.5;
      const x = fromLeft ? 5 + Math.random() * 25 : 70 + Math.random() * 25;
      return [...prev.slice(-15), { ...last, x, fromLeft }];
    });
    if (added) {
      window.setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== last.id));
      }, 2800);
    }
  }, [reactionBursts]);

  const target = fsElement ?? document.body;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <style>
        {`
          @keyframes floatUp {
            0%   { transform: translateY(0) scale(0.6); opacity: 0; }
            15%  { transform: translateY(-30px) scale(1.1); opacity: 1; }
            85%  { transform: translateY(-360px) scale(1); opacity: 1; }
            100% { transform: translateY(-460px) scale(0.7); opacity: 0; }
          }
        `}
      </style>
      {floats.map((f) => (
        <div
          key={f.id}
          className="absolute bottom-10 select-none"
          style={{
            left: `${f.x}%`,
            animation: 'floatUp 2.6s ease-out both',
          }}
        >
          <ImageWithFallback
            src={`/img/reaction-${REACTION_KEY[f.emoji]}.png`}
            fallback={f.emoji}
            alt=""
            imgClassName="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            fallbackClassName="text-5xl sm:text-6xl leading-none"
          />
        </div>
      ))}
    </div>,
    target,
  );
};
