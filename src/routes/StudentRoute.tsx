import { useState } from 'react';
import { Layout } from '@/components/common/Layout';
import { Button } from '@/components/common/Button';
import { MESSAGES } from '@/content/messages';
import { MINI_GAMES } from '@/content/miniGames';
import { SEED_TYPES } from '@/content/seedTypes';
import { GROW_SKILLS_OPTIONS, SKILL_LINKS } from '@/content/skillLinks';
import {
  initialState,
  loadState,
  resetState,
  saveState,
  setAnswer,
  setQuestCard,
  setScoresAndTopTypes,
} from '@/lib/storage';
import { calcScores, topTypes } from '@/lib/scoring';
import type { Choice, QuestCard as QuestCardType, StoredState } from '@/types';

type Phase =
  | 'top'
  | 'minigame'
  | 'result'
  | 'share'
  | 'reveal'
  | 'skilllink'
  | 'myquest'
  | 'card';

export const StudentRoute = () => {
  const [phase, setPhase] = useState<Phase>('top');
  const [state, setState] = useState<StoredState>(() => loadState());
  const [qIndex, setQIndex] = useState(0);
  const [growSkill, setGrowSkill] = useState('');
  const [gameAction, setGameAction] = useState('');
  const [schoolAction, setSchoolAction] = useState('');

  const update = (next: StoredState) => {
    setState(next);
    saveState(next);
  };

  const handleStart = () => {
    const fresh = initialState();
    update(fresh);
    setQIndex(0);
    setPhase('minigame');
  };

  const handleAnswer = (choice: Choice) => {
    const q = MINI_GAMES[qIndex];
    const next = setAnswer(state, q.id, choice);
    update(next);
    if (qIndex + 1 < MINI_GAMES.length) {
      setQIndex(qIndex + 1);
    } else {
      const scores = calcScores(next.answers);
      const tops = topTypes(scores, 2);
      update(setScoresAndTopTypes(next, scores, tops));
      setPhase('result');
    }
  };

  const handleReset = () => {
    resetState();
    setState(initialState());
    setQIndex(0);
    setGrowSkill('');
    setGameAction('');
    setSchoolAction('');
    setPhase('top');
  };

  const handleCreateCard = () => {
    if (!growSkill || !gameAction || !schoolAction) return;
    const card: QuestCardType = { growSkill, gameAction, schoolAction };
    update(setQuestCard(state, card));
    setPhase('card');
  };

  return (
    <Layout title={MESSAGES.appName} subtitle="あなたの強みの芽を見つけよう">
      {phase === 'top' && (
        <div className="max-w-xl">
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <h2 className="text-xl font-bold">{MESSAGES.todayMission.title}</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              {MESSAGES.todayMission.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-teal-600">●</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              個人名・学籍番号などは入力しません。回答は端末内にのみ保存されます。
            </p>
            <div className="mt-6">
              <Button onClick={handleStart}>準備OK / はじめる</Button>
            </div>
          </div>
        </div>
      )}

      {phase === 'minigame' && (
        <div className="max-w-xl">
          <div className="text-sm text-slate-600">
            問題 {qIndex + 1} / {MINI_GAMES.length}
          </div>
          <h2 className="mt-2 text-xl font-bold">{MINI_GAMES[qIndex].prompt}</h2>
          <div className="mt-4 grid gap-3">
            {MINI_GAMES[qIndex].options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-500 hover:bg-teal-50 transition"
              >
                <div className="text-xs text-slate-500">{opt.key}</div>
                <div className="font-semibold">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="max-w-xl">
          <p className="text-slate-700">{MESSAGES.resultIntro}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {state.topTypes.map((t) => {
              const meta = SEED_TYPES[t];
              return (
                <div key={t} className={`rounded-2xl border p-5 ${meta.colorClass}`}>
                  <div className="text-sm">{meta.keyword}</div>
                  <div className="text-xl font-bold mt-1">{meta.name}</div>
                  <p className="mt-2 text-sm">{meta.description}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            これだけが「あなたの全部」ではありません。今日のあなたの一面です。
          </p>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => setPhase('share')}>次へ：ペアで話してみる</Button>
          </div>
        </div>
      )}

      {phase === 'share' && (
        <div className="max-w-xl">
          <h2 className="text-xl font-bold">ペア・グループで話してみよう</h2>
          <ul className="mt-4 space-y-3">
            {MESSAGES.shareQuestions.map((q) => (
              <li key={q} className="rounded-xl bg-white border border-slate-200 p-4">
                {q}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button onClick={() => setPhase('reveal')}>次へ</Button>
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div className="max-w-xl">
          <h2 className="text-xl font-bold">いまの採用とつなげる</h2>
          <div className="mt-4 space-y-3">
            {MESSAGES.reveal.map((p) => (
              <p key={p} className="rounded-xl bg-white border border-slate-200 p-4 text-slate-700">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={() => setPhase('skilllink')}>次へ</Button>
          </div>
        </div>
      )}

      {phase === 'skilllink' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold">ゲームで育つ力 → 社会で活きる場面</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {SKILL_LINKS.map((l) => (
              <li key={l.gameAction} className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="text-xs text-slate-500">ゲームでの行動</div>
                <div className="font-semibold">{l.gameAction}</div>
                <div className="my-2 text-slate-400">↓</div>
                <div className="text-xs text-slate-500">育つ力</div>
                <div className="font-semibold">{l.growSkill}</div>
                <div className="my-2 text-slate-400">↓</div>
                <div className="text-xs text-slate-500">社会で活きる場面</div>
                <div className="font-semibold">{l.realLife}</div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button onClick={() => setPhase('myquest')}>次へ：My Quest を作る</Button>
          </div>
        </div>
      )}

      {phase === 'myquest' && (
        <div className="max-w-xl">
          <h2 className="text-xl font-bold">この1年で育てたい力</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">育てたい力（選ぶ）</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {GROW_SKILLS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setGrowSkill(s)}
                    className={`px-3 py-2 rounded-full border text-sm ${
                      growSkill === s
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">ゲームの中で意識したい行動</label>
              <input
                type="text"
                value={gameAction}
                onChange={(e) => setGameAction(e.target.value)}
                placeholder="例：味方への声かけ"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">学校生活で意識したい行動</label>
              <input
                type="text"
                value={schoolAction}
                onChange={(e) => setSchoolAction(e.target.value)}
                placeholder="例：グループワークで一言は発言する"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleCreateCard} disabled={!growSkill || !gameAction || !schoolAction}>
              My Quest Card を作る
            </Button>
          </div>
        </div>
      )}

      {phase === 'card' && state.questCard && (
        <div className="max-w-xl">
          <h2 className="text-xl font-bold">My Quest Card</h2>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 p-6 leading-relaxed">
            <p>
              私がこの1年で育てたい力は
              <br />
              <span className="font-bold text-teal-700 text-xl">「{state.questCard.growSkill}」</span>
              です。
            </p>
            <p className="mt-4">
              ゲームの中では
              <br />
              <span className="font-bold">「{state.questCard.gameAction}」</span>を意識します。
            </p>
            <p className="mt-4">
              学校生活では
              <br />
              <span className="font-bold">「{state.questCard.schoolAction}」</span>を意識します。
            </p>
            <p className="mt-4 text-sm text-slate-700">
              この力は将来、チームで働く力や、自分を伝える力につながります。
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            スクリーンショットして保存しよう。
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={handleReset}>結果をリセット</Button>
          </div>
        </div>
      )}
    </Layout>
  );
};
