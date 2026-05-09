import type { PostSlidePhase } from '@shared/slidePhases';
import { Stage6QuestCard } from '@/components/stages/Stage6QuestCard';
import { OpinionInputForm } from '@/components/student/OpinionInputForm';
import { OpinionBubbles } from '@/components/common/OpinionBubbles';

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
  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-300 p-4 text-center">
    <div className="text-3xl mb-1">🌳</div>
    <h3 className="text-sm font-bold text-indigo-900">全ゲーム総合分析</h3>
    <p className="text-xs text-slate-600 mt-1">下にあなたの強みの芽が出ています</p>
  </div>
);

const OpinionView = () => (
  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-3">
    <h3 className="text-sm font-bold text-emerald-900 mb-2">💬 みんなの意見</h3>
    <OpinionBubbles compact />
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
