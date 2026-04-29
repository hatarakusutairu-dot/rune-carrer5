import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { ReactionBar } from '@/components/common/ReactionBar';
import { MyAnalysisCard } from '@/components/student/MyAnalysisCard';
import { GameContainer } from '@/games/GameContainer';
import { getMyAnswer } from '@/lib/myAnswers';

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
  // 回答済みかどうかは、自分のlocalStorageを参照
  // Pass 3でゲーム実装時に saveMyAnswer が呼ばれて反映される
  const [answeredKey, setAnsweredKey] = useState(0);

  // ゲーム切替で再評価
  useEffect(() => {
    setAnsweredKey((k) => k + 1);
  }, [state?.currentGameId, state?.phase]);

  if (!state) return null;

  const { phase, currentGameId, introCountdownAt } = state;
  const myAnswerForCurrent =
    currentGameId ? getMyAnswer(currentGameId as GameId) : null;
  const showAnalysis =
    !!currentGameId && (phase === 'active' || phase === 'results') && !!myAnswerForCurrent;

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

        {phase === 'active' && currentGameId && !myAnswerForCurrent && state.activeStartedAt && (
          <div className="mt-2 -mx-2 sm:mx-0">
            <GameContainer
              gameId={currentGameId as GameId}
              startedAtMs={state.activeStartedAt}
              durationMs={state.activeDurationMs ?? 90_000}
            />
          </div>
        )}

        {phase === 'active' && currentGameId && myAnswerForCurrent && (
          <div className="mt-4 text-center">
            <div className="text-3xl">✅</div>
            <p className="mt-2 text-sm font-bold">回答完了！</p>
            <p className="text-xs text-slate-600">
              他のクラスメイトを待っています
            </p>
            <p className="mt-1 text-xs text-slate-500">
              下に「あなたの結果」を出しています
            </p>
          </div>
        )}

        {phase === 'results' && (
          <div className="mt-6 text-center">
            <div className="text-5xl">🎉</div>
            <p className="mt-3 text-lg font-bold">先生の画面でクラス傾向を発表中</p>
            {currentGameId && myAnswerForCurrent ? (
              <p className="mt-1 text-xs text-slate-500">
                下にあなた個人の結果を表示しています
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                次のゲームの開始まで、リアクションで盛り上げよう
              </p>
            )}
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

      {showAnalysis && currentGameId && (
        <div className="mt-3">
          <MyAnalysisCard gameId={currentGameId as GameId} refreshKey={answeredKey} />
        </div>
      )}

      <div className="mt-3">
        <ReactionBar />
      </div>
    </div>
  );
};
