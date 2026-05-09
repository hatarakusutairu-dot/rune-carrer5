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
import { Stage3Share } from '@/components/stages/Stage3Share';
import { Stage4Reveal } from '@/components/stages/Stage4Reveal';
import { Stage5SkillLink } from '@/components/stages/Stage5SkillLink';
import { Stage6QuestCard } from '@/components/stages/Stage6QuestCard';
import { QuestAggregation } from '@/components/teacher/QuestAggregation';
import { restoreTeacherSession, useSync } from '@/contexts/SyncContext';
import { TeacherSlideControl } from '@/components/teacher/TeacherSlideControl';
import { PhaseTeacherView } from '@/components/teacher/PhaseTeacherView';
import { usePostSlidePhase } from '@/lib/usePostSlidePhase';

export const TeacherRoute = () => {
  const { state, conn, myRole, teacherToken, resumeAsTeacher, reset, send } = useSync();

  // ページ復帰時の自動再接続
  useEffect(() => {
    if (state) return;
    const sess = restoreTeacherSession();
    if (sess) {
      resumeAsTeacher(sess.code, sess.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 講師接続後、スライド manifest を取得してサーバーに送信
  useEffect(() => {
    if (!state || myRole !== 'teacher') return;
    fetch('/slides/manifest.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data: { slides?: string[] }) => {
        const names = Array.isArray(data?.slides) ? data.slides : [];
        send({ type: 'T_SET_SLIDE_DECK', names });
      })
      .catch(() => {
        // manifest取得失敗時は空デッキ
        send({ type: 'T_SET_SLIDE_DECK', names: [] });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRole, state?.code]);

  const inRoom = !!(state && teacherToken && myRole === 'teacher');
  const phase = state?.phase ?? 'lobby';
  const stage = state?.currentStage ?? 0;
  const { phase: postSlidePhase } = usePostSlidePhase();

  // 意見入力フェーズの2分タイマー自動切り替え
  useEffect(() => {
    if (postSlidePhase !== 'opinion-input') return;
    if (!state?.activeStartedAt || !state?.activeDurationMs) return;
    const expiresAt = state.activeStartedAt + state.activeDurationMs;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      send({ type: 'T_NEXT_SLIDE' });
      return;
    }
    const t = window.setTimeout(() => {
      send({ type: 'T_NEXT_SLIDE' });
    }, remaining);
    return () => window.clearTimeout(t);
  }, [postSlidePhase, state?.activeStartedAt, state?.activeDurationMs, send]);

  return (
    <Layout title="講師モード" subtitle={inRoom ? `参加コード ${state.code}` : '60分授業の進行管理'}>
      <div className="absolute right-4 top-4">
        <ConnectionBadge state={conn} />
      </div>

      {!inRoom ? (
        <RoomCreateForm />
      ) : !state.classStarted ? (
        // 入室待機画面：参加コードを大きく + 授業開始ボタン
        <div className="max-w-3xl space-y-4">
          <RoomCodeDisplay code={state.code} />
          <ClassForest
            classes={state.classes}
            perClassCount={state.perClassCount}
            totalStudents={state.totalStudents}
          />
          <button
            onClick={() => send({ type: 'T_START_CLASS' })}
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-black text-2xl shadow-lg"
          >
            🎬 授業開始（スライド1枚目から表示）
          </button>
          <p className="text-xs text-slate-500 text-center">
            生徒の入室が揃ったら押してください。押すまで生徒画面は入室待ち状態です。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 max-w-7xl">
          {/* 隅にコードを小さく */}
          <div className="absolute right-20 top-4 px-2 py-1 rounded bg-white/80 border border-slate-200 text-xs">
            <span className="text-slate-500">コード </span>
            <span className="font-bold tabular-nums">{state.code}</span>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* スライド進行（最重要：▶ 次へ で全部進む） */}
            <TeacherSlideControl />

            {/* スライド後フェーズ（全体分析・意見収集・クエスト・QR） */}
            {postSlidePhase && <PhaseTeacherView phase={postSlidePhase} />}

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
