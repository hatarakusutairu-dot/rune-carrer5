import { useEffect } from 'react';
import { Layout } from '@/components/common/Layout';
import { Button } from '@/components/common/Button';
import { ConnectionBadge } from '@/components/common/ConnectionBadge';
import { RoomCreateForm } from '@/components/teacher/RoomCreateForm';
import { RoomCodeDisplay } from '@/components/teacher/RoomCodeDisplay';
import { ClassForest } from '@/components/teacher/ClassForest';
import { StageProgressionPanel } from '@/components/teacher/StageProgressionPanel';
import { ReactionStream } from '@/components/teacher/ReactionStream';
import { LiveProgress } from '@/components/teacher/LiveProgress';
import { CharacterRace } from '@/components/teacher/CharacterRace';
import { AggregationDisplay } from '@/components/teacher/AggregationDisplay';
import { ClassAnalysisCard } from '@/components/teacher/ClassAnalysisCard';
import { GameResultBurst } from '@/components/teacher/GameResultBurst';
import { CountdownBig } from '@/components/common/CountdownBig';
import { Stage0Mission } from '@/components/stages/Stage0Mission';
import { Stage3Share } from '@/components/stages/Stage3Share';
import { Stage4Reveal } from '@/components/stages/Stage4Reveal';
import { Stage5SkillLink } from '@/components/stages/Stage5SkillLink';
import { Stage6QuestCard } from '@/components/stages/Stage6QuestCard';
import { QuestAggregation } from '@/components/teacher/QuestAggregation';
import { restoreTeacherSession, useSync } from '@/contexts/SyncContext';

export const TeacherRoute = () => {
  const { state, conn, myRole, teacherToken, resumeAsTeacher, reset } = useSync();

  // ページ復帰時の自動再接続
  useEffect(() => {
    if (state) return;
    const sess = restoreTeacherSession();
    if (sess) {
      resumeAsTeacher(sess.code, sess.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inRoom = !!(state && teacherToken && myRole === 'teacher');
  const phase = state?.phase ?? 'lobby';
  const stage = state?.currentStage ?? 0;

  return (
    <Layout title="講師モード" subtitle={inRoom ? `参加コード ${state.code}` : '60分授業の進行管理'}>
      <div className="absolute right-4 top-4">
        <ConnectionBadge state={conn} />
      </div>

      {!inRoom ? (
        <RoomCreateForm />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 max-w-7xl">
          <div className="lg:col-span-2 space-y-4">
            <RoomCodeDisplay code={state.code} />

            {/* Stage 0：ミッション表示（lobbyフェーズ） */}
            {phase === 'lobby' && stage === 0 && <Stage0Mission variant="teacher" />}

            {/* Stage 3〜6（lobbyフェーズ） */}
            {phase === 'lobby' && stage === 3 && <Stage3Share variant="teacher" />}
            {phase === 'lobby' && stage === 4 && <Stage4Reveal variant="teacher" />}
            {phase === 'lobby' && stage === 5 && <Stage5SkillLink variant="teacher" />}
            {phase === 'lobby' && stage === 6 && (
              <>
                <Stage6QuestCard variant="teacher" />
                <QuestAggregation />
              </>
            )}

            {/* intro時：カウントダウン大表示 */}
            {phase === 'intro' && state.introCountdownAt !== null && (
              <div className="rounded-2xl bg-white border border-slate-200 p-3">
                <CountdownBig introStartedAtMs={state.introCountdownAt} />
              </div>
            )}

            {/* active時：進捗ライブ */}
            {phase === 'active' && (
              <>
                <LiveProgress />
                <CharacterRace />
              </>
            )}

            {/* 集計表示：results時 */}
            {phase === 'results' && (
              <>
                {state.currentGameId && (
                  <GameResultBurst gameId={state.currentGameId} />
                )}
                <ClassAnalysisCard />
                <AggregationDisplay />
              </>
            )}

            {/* Stage集計：stage_summary時 */}
            {phase === 'stage_summary' && (
              <>
                <ClassAnalysisCard isStageSummary />
                <AggregationDisplay isStageSummary />
              </>
            )}

            <StageProgressionPanel />
          </div>

          <aside className="space-y-4">
            <ClassForest
              classes={state.classes}
              perClassCount={state.perClassCount}
              totalStudents={state.totalStudents}
            />
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm('ルームを閉じてセッションをリセットします。よろしいですか？')) {
                  reset();
                }
              }}
              className="w-full text-red-700"
            >
              セッションをリセット
            </Button>
          </aside>
        </div>
      )}

      <ReactionStream />
    </Layout>
  );
};
