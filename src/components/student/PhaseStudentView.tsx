import { useEffect, useState } from 'react';
import type { PostSlidePhase } from '@shared/slidePhases';
import { useSync } from '@/contexts/SyncContext';
import { Stage6QuestCard } from '@/components/stages/Stage6QuestCard';
import { OpinionInputForm } from '@/components/student/OpinionInputForm';
import { OpinionBubbles } from '@/components/common/OpinionBubbles';

// 生徒画面：スライド後フェーズ別 UI
export const PhaseStudentView = ({ phase }: { phase: PostSlidePhase }) => {
  switch (phase) {
    case 'stage2-summary':
      return <Stage2PersonalSummary />;
    case 'game-reflection-input':
      return <GameReflectionInputForm />;
    case 'game-reflection-view':
      return <GameReflectionViewStudent />;
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

const GameReflectionInputForm = () => {
  const { state, send, mySid } = useSync();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setText('');
    setSubmitted(false);
  }, [mySid]);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, []);

  const expiresAt =
    state?.activeStartedAt && state?.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  const remainingMs = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  const min = Math.floor(remainingMs / 60000);
  const sec = Math.floor((remainingMs % 60000) / 1000);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    send({ type: 'S_SKILL_OPINION', text: t });
    setSubmitted(true);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-300 p-4 space-y-3">
      <div>
        <h3 className="text-base font-bold text-sky-900">
          💭 ゲームをやってみてどうだった？
        </h3>
        <p className="text-xs text-slate-700 mt-1">
          結果を見ての感想、ゲームをやって感じたことを自由に。
          時間内なら再送信で上書きOK。
        </p>
      </div>

      {expiresAt && (
        <div className="text-center">
          <div className="text-2xl font-black tabular-nums text-sky-900">
            残り {min}:{String(sec).padStart(2, '0')}
          </div>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 200))}
        placeholder="例：思ったより難しかった／意外と自分の傾向と合ってた／〇〇のゲームが楽しかった など"
        rows={4}
        className="w-full px-3 py-2 rounded-lg border-2 border-sky-300 focus:border-sky-500 focus:outline-none text-sm bg-white resize-none"
      />
      <div className="text-right text-[10px] text-slate-400">{text.length} / 200</div>

      <button
        onClick={submit}
        disabled={!text.trim()}
        className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold"
      >
        {submitted ? '✓ 提出済み（上書き送信）' : '提出'}
      </button>
    </div>
  );
};

const GameReflectionViewStudent = () => (
  <div className="rounded-2xl bg-sky-50 border-2 border-sky-300 p-3 text-center">
    <h3 className="text-sm font-bold text-sky-900 mb-1">💭 みんなの感想</h3>
    <p className="text-xs text-slate-500">大きい画面でみんなの感想を見てみよう</p>
  </div>
);

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
  <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 text-center">
    <h3 className="text-base font-bold text-amber-900 mb-2">📱 授業アンケート</h3>
    <p className="text-xs text-slate-600 mb-3">大きい画面のQRを読み取り、または下のリンク</p>
    <div className="rounded-xl bg-white border border-slate-200 p-2 inline-block">
      <img
        src="/img/survey-qr.png"
        alt="アンケートQRコード"
        className="w-40 h-40 object-contain"
      />
    </div>
  </div>
);
