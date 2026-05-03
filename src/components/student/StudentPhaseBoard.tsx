import { useEffect, useState } from 'react';
import type { GameId } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { ReactionBar } from '@/components/common/ReactionBar';
import { MyAnalysisCard } from '@/components/student/MyAnalysisCard';
import { GameContainer } from '@/games/GameContainer';
import { CountdownBig } from '@/components/common/CountdownBig';
import { WaitingScene } from '@/components/student/WaitingScene';
import { Stage0Mission } from '@/components/stages/Stage0Mission';
import { Stage2PersonalResult } from '@/components/stages/Stage2PersonalResult';
import { Stage3Share } from '@/components/stages/Stage3Share';
import { Stage4Reveal } from '@/components/stages/Stage4Reveal';
import { Stage5SkillLink } from '@/components/stages/Stage5SkillLink';
import { Stage6QuestCard } from '@/components/stages/Stage6QuestCard';
import { getMyAnswer } from '@/lib/myAnswers';

export const StudentPhaseBoard = () => {
  const { state, myClass } = useSync();
  const [answeredKey, setAnsweredKey] = useState(0);

  useEffect(() => {
    setAnsweredKey((k) => k + 1);
  }, [state?.currentGameId, state?.phase]);

  if (!state) return null;

  const { phase, currentStage, currentGameId, introCountdownAt } = state;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  answeredKey;
  const myAnswerForCurrent =
    currentGameId ? getMyAnswer(currentGameId as GameId) : null;
  const showAnalysis =
    !!currentGameId && (phase === 'active' || phase === 'results') && !!myAnswerForCurrent;

  // Stage 1 以外（lobbyフェーズ）はステージ別の固定コンテンツ
  const isStageContent =
    phase === 'lobby' && currentStage !== 1;
  const isStage2Summary =
    phase === 'stage_summary' && currentStage === 1; // Stage 1 締め後は currentStage=1 で stage_summary
  const isStage2Lobby =
    phase === 'lobby' && currentStage === 2;

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
        <span>クラス：{myClass}</span>
        <span>{state.totalStudents}人入室中</span>
      </div>

      {/* Stage 0：ミッション */}
      {phase === 'lobby' && currentStage === 0 && (
        <Stage0Mission variant="student" />
      )}

      {/* Stage 1 (current = 1) のフェーズ別表示 */}
      {currentStage === 1 && phase === 'lobby' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 min-h-[280px] text-center">
          <div className="text-6xl">🎮</div>
          <p className="mt-4 text-lg font-bold">先生のスタートを待っています</p>
          <p className="mt-2 text-sm text-slate-600">次のゲームの準備中</p>
        </div>
      )}

      {phase === 'intro' && introCountdownAt !== null && (
        <div className="rounded-2xl bg-white border border-slate-200 p-2">
          <CountdownBig introStartedAtMs={introCountdownAt} />
        </div>
      )}

      {phase === 'active' && currentGameId && !myAnswerForCurrent && state.activeStartedAt && (
        <GameContainer
          gameId={currentGameId as GameId}
          startedAtMs={state.activeStartedAt}
          durationMs={state.activeDurationMs ?? 90_000}
          onAnswered={() => setAnsweredKey((k) => k + 1)}
        />
      )}

      {phase === 'active' && currentGameId && myAnswerForCurrent && (
        <WaitingScene variant="answered" />
      )}

      {phase === 'results' && (
        <WaitingScene variant="results" />
      )}

      {/* Stage 1 締め後（stage_summary）：Stage 2 の個人結果を見せる */}
      {isStage2Summary && <Stage2PersonalResult />}

      {/* Stage 2 lobby（次へを押した後）：個人結果継続表示 */}
      {isStage2Lobby && <Stage2PersonalResult />}

      {/* Stage 3 〜 6（lobbyフェーズ）：ステージ固有 */}
      {isStageContent && currentStage === 3 && <Stage3Share variant="student" />}
      {isStageContent && currentStage === 4 && <Stage4Reveal variant="student" />}
      {isStageContent && currentStage === 5 && <Stage5SkillLink variant="student" />}
      {isStageContent && currentStage === 6 && <Stage6QuestCard variant="student" />}

      {phase === 'closed' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 min-h-[200px] text-center">
          <div className="text-6xl">👋</div>
          <p className="mt-4 text-lg font-bold">授業おつかれさま！</p>
          <p className="mt-2 text-sm text-slate-600">
            My Quest Cardはスクショで保存できます
          </p>
        </div>
      )}

      {/* ゲーム単位の個人分析 */}
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
