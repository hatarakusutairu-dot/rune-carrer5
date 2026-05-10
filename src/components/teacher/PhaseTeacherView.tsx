import type { PostSlidePhase } from '@shared/slidePhases';
import { useSync } from '@/contexts/SyncContext';
import { AggregationDisplay } from '@/components/teacher/AggregationDisplay';
import { ClassAnalysisCard } from '@/components/teacher/ClassAnalysisCard';
import { QuestAggregation } from '@/components/teacher/QuestAggregation';
import { CharacterRace } from '@/components/teacher/CharacterRace';
import { OpinionBubbles } from '@/components/common/OpinionBubbles';

// 講師画面：スライド後フェーズ別 UI
export const PhaseTeacherView = ({ phase }: { phase: PostSlidePhase }) => {
  switch (phase) {
    case 'stage2-summary':
      return <Stage2Summary />;
    case 'opinion-input':
      return <OpinionInputProgress />;
    case 'opinion-view':
      return <OpinionView />;
    case 'quest-input':
      return <QuestInputProgress />;
    case 'quest-view':
      return <QuestAggregation />;
    case 'survey-qr':
      return <SurveyQRPlaceholder />;
  }
};

const Stage2Summary = () => (
  <div className="space-y-4">
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 p-4">
      <h3 className="text-lg font-black text-indigo-900">
        🌳 全ゲーム総合分析（クラス全体）
      </h3>
      <p className="text-xs text-slate-600 mt-1">
        5つのゲームをすべて合わせた強みの傾向を表示します
      </p>
    </div>
    <ClassAnalysisCard isStageSummary />
    <AggregationDisplay isStageSummary />
  </div>
);

const OpinionInputProgress = () => {
  const { state } = useSync();
  if (!state) return null;
  const expiresAt =
    state.activeStartedAt && state.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 p-5">
        <h3 className="text-lg font-black text-amber-900">
          ✏️ 意見収集中：「ゲームで得られる力は何だろう？」
        </h3>
        <p className="text-sm text-slate-700 mt-1">
          各生徒が8つの短文を入力中。5分タイマー、または ▶ 次へ で締切。
        </p>
        {expiresAt && <CountdownDisplay expiresAt={expiresAt} />}
      </div>
      <CharacterRace />
    </div>
  );
};

const OpinionView = () => (
  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 p-5 space-y-3">
    <h3 className="text-lg font-black text-emerald-900">
      💬 みんなの意見：ゲームで得られる力
    </h3>
    <OpinionBubbles />
    <p className="text-[11px] text-slate-500">
      よく出た意見ほど大きいバブルで表示。同じ意見は自動でまとめています。
    </p>
  </div>
);

const QuestInputProgress = () => (
  <div className="space-y-3">
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300 p-5">
      <h3 className="text-lg font-black text-rose-900">
        🎯 My Quest 入力中
      </h3>
      <p className="text-sm text-slate-700 mt-1">
        各生徒が「育てたい力・ゲームで意識すること・学校で意識すること」を入力中
      </p>
    </div>
    <CharacterRace />
  </div>
);

const SurveyQRPlaceholder = () => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-400 p-8 text-center">
    <div className="text-5xl mb-3">📱</div>
    <h3 className="text-xl font-black text-slate-800 mb-2">アンケートQRコード</h3>
    <div className="rounded-xl bg-white border-2 border-dashed border-slate-300 p-12 inline-block">
      <span className="text-slate-400">（QRコードはここに表示予定）</span>
    </div>
    <p className="mt-3 text-xs text-slate-500">
      QRコードのURLが用意でき次第、ここに自動表示されます
    </p>
  </div>
);

const CountdownDisplay = ({ expiresAt }: { expiresAt: number }) => {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const sec = Math.floor(remainingMs / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (
    <div className="mt-3 text-center">
      <div className="text-4xl font-black tabular-nums text-amber-900">
        残り {m}:{String(s).padStart(2, '0')}
      </div>
    </div>
  );
};
