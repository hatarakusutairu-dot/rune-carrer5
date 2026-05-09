import type { GameId } from '@shared/protocol';
import { GAME_INFO } from '@/content/gameInfo';

type Props = {
  gameId: GameId;
  variant?: 'student' | 'teacher';
};

// ゲーム紹介カード（スライド表示中・ゲーム未開始時に出す）
// 講師・生徒両方で使用
export const GameIntroCard = ({ gameId, variant = 'student' }: Props) => {
  const info = GAME_INFO[gameId];
  if (!info) return null;
  const isTeacher = variant === 'teacher';
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 p-5">
      <div className="text-center">
        <div className="text-6xl mb-2">{info.emoji}</div>
        <div className="text-xl font-black text-emerald-900">{info.name}</div>
      </div>
      <p className={`mt-3 text-slate-800 leading-relaxed ${isTeacher ? 'text-base' : 'text-sm'}`}>
        {info.description}
      </p>
      {info.rules.length > 0 && (
        <ul className={`mt-3 space-y-1.5 text-slate-700 ${isTeacher ? 'text-sm' : 'text-xs'}`}>
          {info.rules.map((r, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-emerald-600 shrink-0">●</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[11px] text-slate-500 text-center">
        {isTeacher
          ? '上の「ゲーム を開始」ボタンでスタート'
          : '先生がスタートしたらゲーム画面に切り替わります'}
      </p>
    </div>
  );
};
