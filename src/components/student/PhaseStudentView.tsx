import type { PostSlidePhase } from '@shared/slidePhases';
import { useSync } from '@/contexts/SyncContext';
import { Stage6QuestCard } from '@/components/stages/Stage6QuestCard';

// 生徒画面：スライド後フェーズ別 UI
export const PhaseStudentView = ({ phase }: { phase: PostSlidePhase }) => {
  switch (phase) {
    case 'stage2-summary':
      return <Stage2PersonalSummary />;
    case 'opinion-input':
      return <OpinionInputForm />;
    case 'opinion-view':
      return <OpinionView />;
    case 'quest-input':
      return <Stage6QuestCard variant="student" />;
    case 'quest-view':
      return <QuestViewStub />;
    case 'survey-qr':
      return <SurveyQRStudent />;
  }
};

const Stage2PersonalSummary = () => (
  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-300 p-4">
    <h3 className="text-base font-black text-indigo-900">
      🌳 あなたの全ゲーム総合分析
    </h3>
    <p className="text-xs text-slate-600 mt-1">
      5つのゲームを通して見えてきた強みの芽
    </p>
    <div className="mt-3 rounded-xl bg-white border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      （個人診断結果：実装予定）
    </div>
  </div>
);

const OpinionInputForm = () => {
  const { state } = useSync();
  if (!state) return null;
  const expiresAt =
    state.activeStartedAt && state.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-4">
      <h3 className="text-base font-bold text-amber-900">
        ✏️ ゲームで得られる力は何があるだろう？
      </h3>
      <p className="text-xs text-slate-700 mt-1">
        思いつくことを5つまで短く入力してください
      </p>
      {expiresAt && <CountdownLine expiresAt={expiresAt} />}
      <div className="mt-3 rounded-xl bg-white border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
        （5枠入力フォーム：実装予定）
      </div>
    </div>
  );
};

const OpinionView = () => (
  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-4">
    <h3 className="text-base font-bold text-emerald-900 mb-2">💬 みんなの意見</h3>
    <p className="text-xs text-slate-500">大きい画面で結果を見てみよう</p>
  </div>
);

const QuestViewStub = () => (
  <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-4">
    <h3 className="text-base font-bold text-rose-900 mb-2">🎯 みんなのMy Quest</h3>
    <p className="text-xs text-slate-500">大きい画面でみんなのカードを見てみよう</p>
  </div>
);

const SurveyQRStudent = () => (
  <div className="rounded-2xl bg-slate-100 border-2 border-slate-300 p-4 text-center">
    <h3 className="text-base font-bold text-slate-800 mb-2">📱 アンケート</h3>
    <p className="text-xs text-slate-500">大きい画面のQRコードを読み取ってください</p>
  </div>
);

const CountdownLine = ({ expiresAt }: { expiresAt: number }) => {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const sec = Math.floor(remainingMs / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (
    <div className="mt-2 text-amber-800 font-bold text-sm">
      残り {m}:{String(s).padStart(2, '0')}
    </div>
  );
};
