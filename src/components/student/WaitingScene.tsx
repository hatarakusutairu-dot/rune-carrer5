import { DecorImage } from '@/components/common/DecorImage';

interface WaitingSceneProps {
  variant?: 'answered' | 'results';
  total?: number;
  done?: number;
}

// 早終了組や結果待ちの生徒に出す穏やかな待機アニメ
export const WaitingScene = ({ variant = 'answered', total, done }: WaitingSceneProps) => {
  const others = (total ?? 0) - (done ?? 0);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-5 overflow-hidden relative">
      <style>
        {`
          @keyframes drift {
            0%   { transform: translateY(0) translateX(0); opacity: 0.7; }
            50%  { transform: translateY(-8px) translateX(4px); opacity: 1; }
            100% { transform: translateY(0) translateX(0); opacity: 0.7; }
          }
          @keyframes pulse-soft {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.08); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50%      { opacity: 1; transform: scale(1.2); }
          }
        `}
      </style>

      {/* 背景の漂う粒子 */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-emerald-300 text-xs"
            style={{
              left: `${(i * 13 + 7) % 90 + 5}%`,
              top: `${(i * 17 + 11) % 80 + 10}%`,
              animation: `sparkle ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <DecorImage
        src="/img/waiting-scene.png"
        alt=""
        className="block w-full h-auto rounded-xl mb-3 max-h-40 object-cover"
      />

      <div className="relative text-center py-2">
        <div
          className="text-6xl inline-block"
          style={{ animation: 'pulse-soft 2.4s ease-in-out infinite' }}
        >
          🌱
        </div>
        <p className="mt-2 text-sm font-bold text-emerald-900">
          {variant === 'answered' ? '回答完了！' : '集計タイム'}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          {variant === 'answered'
            ? `他のクラスメイトを待っています${others > 0 ? `（残り ${others} 人）` : ''}`
            : '先生の画面でみんなの傾向を見よう'}
        </p>

        <div className="mt-3 flex justify-center gap-1.5 text-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{ animation: `drift ${3 + (i % 2)}s ease-in-out ${i * 0.4}s infinite` }}
            >
              {i % 2 === 0 ? '🌱' : '🍃'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
