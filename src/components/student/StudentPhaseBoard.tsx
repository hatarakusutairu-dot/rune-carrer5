import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { ReactionBar } from '@/components/common/ReactionBar';
import { MyAnalysisCard } from '@/components/student/MyAnalysisCard';
import { GameContainer } from '@/games/GameContainer';
import { CountdownBig } from '@/components/common/CountdownBig';
import { WaitingScene } from '@/components/student/WaitingScene';
import { getMyAnswer } from '@/lib/myAnswers';

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
          <CountdownBig introStartedAtMs={introCountdownAt} />
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
          <div className="mt-3">
            <WaitingScene variant="answered" />
            <p className="mt-2 text-xs text-slate-500 text-center">
              下に「あなたの結果」を出しています
            </p>
          </div>
        )}

        {phase === 'results' && (
          <div className="mt-3">
            <WaitingScene variant="results" />
            {currentGameId && myAnswerForCurrent ? (
              <p className="mt-2 text-xs text-slate-500 text-center">
                下にあなた個人の結果を表示しています
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500 text-center">
                次のゲームまで、リアクションで盛り上げよう
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
