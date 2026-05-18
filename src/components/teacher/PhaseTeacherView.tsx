import { useEffect, useState } from 'react';
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
    case 'game-reflection-input':
      return <GameReflectionInputProgress />;
    case 'game-reflection-view':
      return <GameReflectionView />;
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

const GameReflectionInputProgress = () => {
  const { state, skillOpinions } = useSync();
  if (!state) return null;
  const expiresAt =
    state.activeStartedAt && state.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 border-2 border-sky-300 p-5">
        <h3 className="text-lg font-black text-sky-900">
          💭 ゲーム感想 収集中
        </h3>
        <p className="text-sm text-slate-700 mt-1">
          「結果を見てどう感じた？／ゲームをやってみてどうだった？」を自由に1分30秒。
          または ▶ 次へ で締切。
        </p>
        {expiresAt && <CountdownDisplay expiresAt={expiresAt} />}
      </div>
      <CharacterRace
        perClass={skillOpinions?.perClass}
        title="感想入力 進捗"
        subtitle="提出するたびに進む"
      />
    </div>
  );
};

const GameReflectionView = () => {
  const { skillOpinions, state } = useSync();
  if (!skillOpinions) {
    return (
      <div className="rounded-xl bg-white border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        まだ感想はありません
      </div>
    );
  }
  const expected = state?.totalStudents ?? 0;
  const ratio = expected > 0 ? (skillOpinions.total / expected) * 100 : 0;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-300 p-5 space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-lg font-black text-sky-900">💭 みんなの感想</h3>
        <span className="text-sm text-slate-700">
          <span className="text-2xl font-black tabular-nums">{skillOpinions.total}</span>
          {expected > 0 && (
            <span className="text-slate-500"> / {expected}人（{ratio.toFixed(0)}%）</span>
          )}
        </span>
      </div>
      {skillOpinions.opinions.length === 0 ? (
        <div className="rounded-xl bg-white border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          まだ提出はありません
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {skillOpinions.opinions.map((o, i) => (
            <div
              key={i}
              className="rounded-xl bg-white border border-sky-200 p-3 text-sm leading-relaxed shadow-sm"
            >
              <div className="text-[10px] text-sky-800 font-semibold mb-1">{o.className}</div>
              <p className="text-slate-800">{o.text}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-slate-500">匿名表示。クラス名のみ付記。</p>
    </div>
  );
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
  const { state, gameSkills } = useSync();
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
      <CharacterRace
        perClass={gameSkills?.perClass}
        title="意見入力 進捗"
        subtitle="生徒が提出するたびに進む"
      />
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

const QuestInputProgress = () => {
  const { questAgg, state } = useSync();
  const expiresAt =
    state?.activeStartedAt && state?.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300 p-5">
        <h3 className="text-lg font-black text-rose-900">
          🎯 My Quest 入力中
        </h3>
        <p className="text-sm text-slate-700 mt-1">
          各生徒が「育てたい力・ゲームで意識すること・学校で意識すること」を入力中。
          3分タイマー、または ▶ 次へ で締切。
        </p>
        {expiresAt && <CountdownDisplay expiresAt={expiresAt} />}
      </div>
      <CharacterRace
        perClass={questAgg?.perClass}
        title="My Quest 入力 進捗"
        subtitle="提出するたびに進む"
      />
    </div>
  );
};

const SurveyQRPlaceholder = () => (
  <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 border-2 border-amber-300 p-6 sm:p-8 text-center">
    <div className="text-4xl mb-2">📱</div>
    <h3 className="text-2xl font-black text-slate-800 mb-1">授業アンケート</h3>
    <p className="text-sm text-slate-600 mb-4">
      スマホでQRコードを読み取って回答してください（匿名）
    </p>
    <div className="rounded-2xl bg-white border-2 border-slate-200 p-4 inline-block shadow">
      <img
        src="/img/survey-qr.png"
        alt="アンケートQRコード"
        className="w-72 h-72 sm:w-80 sm:h-80 object-contain"
      />
    </div>
    <p className="mt-4 text-xs text-slate-500">
      今日の授業はいかがでしたか？感想・気づきを教えてください
    </p>
  </div>
);

const CountdownDisplay = ({ expiresAt }: { expiresAt: number }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, []);
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
