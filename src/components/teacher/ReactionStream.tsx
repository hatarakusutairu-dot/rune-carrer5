import { useEffect, useState } from 'react';
import { useSync, ReactionBurst } from '@/contexts/SyncContext';

interface FloatingReaction extends ReactionBurst {
  x: number; // 0-100 (vw%)
  fromLeft: boolean;
}

export const ReactionStream = () => {
  const { reactionBursts } = useSync();
  const [floats, setFloats] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    if (reactionBursts.length === 0) return;
    const last = reactionBursts[reactionBursts.length - 1];
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? 5 + Math.random() * 25 : 70 + Math.random() * 25;
    setFloats((prev) => [...prev.slice(-15), { ...last, x, fromLeft }]);
    const timer = window.setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== last.id));
    }, 2800);
    return () => clearTimeout(timer);
  }, [reactionBursts]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
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
          className="absolute bottom-10 text-5xl sm:text-6xl select-none"
          style={{
            left: `${f.x}%`,
            animation: 'floatUp 2.6s ease-out both',
          }}
        >
          {f.emoji}
        </div>
      ))}
    </div>
  );
};
