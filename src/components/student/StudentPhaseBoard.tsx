import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { ReactionBar } from '@/components/common/ReactionBar';

const GAME_LABELS: Record<GameId, string> = {
  balloon: 'Balloon Risk（風船）',
  digit_span: 'Digit Span（数字記憶）',
  card_decks: 'Card Decks（カード山）',
  emotion_match: 'Emotion Match（感情）',
  money_split: 'Money Split（コイン分配）',
  stop_signal: 'Stop Signal（信号反応）',
  pattern_match: 'Pattern Match（パターン）',
};

const Countdown = ({ targetMs }: { targetMs: number }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);
  const remain = Math.max(0, Math.ceil((targetMs + 3000 - now) / 1000));
  return (
    <div className="text-center py-12">
      <div className="text-9xl font-black text-teal-600 animate-pulse tabular-nums">
        {remain || 'GO!'}
      </div>
      <p className="mt-4 text-slate-700">準備して…</p>
    </div>
  );
};

export const StudentPhaseBoard = () => {
  const { state, myClass } = useSync();
  if (!state) return null;

  const { phase, currentGameId, introCountdownAt } = state;

  return (
    <div className="max-w-md">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 min-h-[280px]">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>クラス：{myClass}</span>
          <span>{state.totalStudents}人入室中</span>
        </div>

        {phase === 'lobby' && (
          <div className="mt-8 text-center">
            <div className="text-6xl">🌱</div>
            <p className="mt-4 text-lg font-bold">先生のスタートを待っています</p>
            <p className="mt-2 text-sm text-slate-600">
              スマホはこのままにしておいてね
            </p>
          </div>
        )}

        {phase === 'intro' && introCountdownAt !== null && (
          <Countdown targetMs={introCountdownAt} />
        )}

        {phase === 'active' && currentGameId && (
          <div className="mt-6 text-center">
            <div className="text-xs text-slate-500">いま挑戦中</div>
            <div className="mt-1 text-xl font-bold">{GAME_LABELS[currentGameId]}</div>
            <div className="mt-6 text-sm text-slate-600 italic">
              （ゲーム本体は Pass 3 で実装予定）
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="mt-8 text-center">
            <div className="text-6xl">🎉</div>
            <p className="mt-4 text-lg font-bold">先生の画面で結果を見よう</p>
            <p className="mt-2 text-sm text-slate-600">
              次のゲームの開始まで、リアクションで盛り上げよう！
            </p>
          </div>
        )}

        {phase === 'stage_summary' && (
          <div className="mt-8 text-center">
            <div className="text-6xl">📊</div>
            <p className="mt-4 text-lg font-bold">クラスのまとめタイム</p>
            <p className="mt-2 text-sm text-slate-600">
              先生の画面に、みんなの傾向が出ています
            </p>
          </div>
        )}

        {phase === 'closed' && (
          <div className="mt-8 text-center">
            <div className="text-6xl">👋</div>
            <p className="mt-4 text-lg font-bold">授業おつかれさま！</p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <ReactionBar />
      </div>
    </div>
  );
};
