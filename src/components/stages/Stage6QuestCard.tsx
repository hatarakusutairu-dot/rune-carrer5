import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { computeMyCumulative } from '@/lib/cumulativeScore';
import { loadQuestCard, saveQuestCard } from '@/lib/questCard';
import { SEED_TYPE_INFO } from '@/content/seedTypeDescriptions';
import { useSync } from '@/contexts/SyncContext';

const GROW_SKILLS = [
  'コミュニケーション力',
  '分析力・改善力',
  '適応力',
  'リーダーシップ',
  '継続力',
  '協働力',
  'バランス感覚',
  '判断力',
];

const GAME_ACTIONS = [
  '味方への声かけ',
  '負けたあとの振り返り',
  '新しい戦略を試す',
  'ボイチャでの指示',
  '毎日の練習継続',
  '役割を決めて連携',
];

const SCHOOL_ACTIONS = [
  'グループワークで一言は発言する',
  '質問を1日1個する',
  '提出物を期限内に出す',
  '挨拶を自分から',
  '苦手な人とも話してみる',
  '振り返りをノートに書く',
];

interface Props {
  variant: 'teacher' | 'student';
}

export const Stage6QuestCard = ({ variant }: Props) => {
  if (variant === 'teacher') return <TeacherView />;
  return <StudentView />;
};

const TeacherView = () => (
  <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50 to-emerald-50 border border-amber-200 p-6">
    <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
      Stage 6
    </div>
    <h2 className="mt-1 text-2xl font-black text-slate-900">
      この1年で育てたい力
    </h2>
    <p className="mt-2 text-sm text-slate-700">
      生徒は手元のスマホで My Quest Card を作成しています。
      <br />
      「育てたい力 → ゲームでの行動 → 学校生活での行動」を選んでもらいます。
    </p>

    <div className="mt-5 rounded-xl bg-white border border-amber-200 p-4">
      <div className="text-xs text-slate-500 mb-2">完成イメージ</div>
      <div className="text-sm leading-relaxed">
        <p>
          私がこの1年で育てたい力は
          <br />
          <span className="font-bold text-amber-800 text-lg">「コミュニケーション力」</span>
          です。
        </p>
        <p className="mt-3">
          ゲームの中では <strong>「味方への声かけ」</strong> を意識します。
        </p>
        <p>
          学校生活では <strong>「グループワークで一言は発言すること」</strong> を意識します。
        </p>
      </div>
    </div>
  </div>
);

const StudentView = () => {
  const { send } = useSync();
  const [growSkill, setGrowSkill] = useState('');
  const [gameAction, setGameAction] = useState('');
  const [schoolAction, setSchoolAction] = useState('');
  const [saved, setSaved] = useState<ReturnType<typeof loadQuestCard>>(null);
  const [editing, setEditing] = useState(false);

  // 既存カード読み込み
  useEffect(() => {
    const c = loadQuestCard();
    if (c) {
      setSaved(c);
      setGrowSkill(c.growSkill);
      setGameAction(c.gameAction);
      setSchoolAction(c.schoolAction);
    }
  }, []);

  const cumulative = computeMyCumulative();
  const recommendedTrait = cumulative.topTypes[0];
  const recommended = recommendedTrait ? SEED_TYPE_INFO[recommendedTrait] : null;

  const submit = () => {
    if (!growSkill || !gameAction || !schoolAction) return;
    saveQuestCard({ growSkill, gameAction, schoolAction });
    send({ type: 'S_QUEST', growSkill, gameAction, schoolAction });
    setSaved({ growSkill, gameAction, schoolAction, savedAt: new Date().toISOString() });
    setEditing(false);
  };

  // 完成後表示
  if (saved && !editing) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-amber-100 via-rose-50 to-emerald-50 border-2 border-amber-300 p-6 sm:p-8 shadow-lg">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider text-center">
            My Quest Card
          </div>
          <div className="mt-4 space-y-4 text-base sm:text-lg leading-relaxed">
            <p>
              私がこの1年で育てたい力は
              <br />
              <span className="block mt-1 text-2xl font-black text-amber-900">
                「{saved.growSkill}」
              </span>
              です。
            </p>
            <p>
              ゲームの中では
              <br />
              <span className="font-bold text-emerald-800">「{saved.gameAction}」</span>
              を意識します。
            </p>
            <p>
              学校生活では
              <br />
              <span className="font-bold text-cyan-800">「{saved.schoolAction}」</span>
              を意識します。
            </p>
            <p className="text-sm text-slate-700 mt-4 pt-4 border-t border-amber-200">
              この力は将来、
              <br />
              チームで働く力や、自分を伝える力につながります。
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          スクリーンショットして保存しよう。授業終了後にこの画面は消えます。
        </p>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setEditing(true)} className="text-sm">
            編集する
          </Button>
        </div>
      </div>
    );
  }

  // 入力フォーム
  return (
    <div className="rounded-2xl bg-white border border-amber-200 p-5 space-y-5">
      <div>
        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
          Stage 6
        </div>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          この1年で育てたい力
        </h2>
        {recommended && (
          <p className="mt-2 text-xs text-slate-600">
            ヒント：今日のあなたの傾向（{recommended.label}）から想像すると選びやすいかも。
          </p>
        )}
      </div>

      {/* 1. Grow Skill */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          ① 育てたい力（選ぶ or 自分で書く）
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {GROW_SKILLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setGrowSkill(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                growSkill === s
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={growSkill}
          onChange={(e) => setGrowSkill(e.target.value.slice(0, 30))}
          placeholder="自分の言葉で書いてもOK"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {/* 2. Game Action */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          ② ゲームの中で意識したい行動
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {GAME_ACTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setGameAction(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                gameAction === s
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={gameAction}
          onChange={(e) => setGameAction(e.target.value.slice(0, 40))}
          placeholder="自分の言葉で書いてもOK"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {/* 3. School Action */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          ③ 学校生活で意識したい行動
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {SCHOOL_ACTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSchoolAction(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                schoolAction === s
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={schoolAction}
          onChange={(e) => setSchoolAction(e.target.value.slice(0, 40))}
          placeholder="自分の言葉で書いてもOK"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <Button
        onClick={submit}
        disabled={!growSkill || !gameAction || !schoolAction}
        className="w-full"
      >
        My Quest Card を作る
      </Button>
    </div>
  );
};
