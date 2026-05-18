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
  const { send, state } = useSync();
  const [growSkill, setGrowSkill] = useState('');
  const [gameAction, setGameAction] = useState('');
  const [schoolAction, setSchoolAction] = useState('');
  const [saved, setSaved] = useState<ReturnType<typeof loadQuestCard>>(null);
  const [editing, setEditing] = useState(false);

  // 残り時間表示用の再描画用 tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, []);

  const expiresAt =
    state?.activeStartedAt && state?.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  const remainingMs = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  const remainMin = Math.floor(remainingMs / 60000);
  const remainSec = Math.floor((remainingMs % 60000) / 1000);

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

  // 入力フォーム（自分の言葉で書くがメイン、ヒント例は折りたたみ）
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
            ヒント：今日のあなたの傾向（{recommended.label}）から想像すると書きやすいかも。
          </p>
        )}
        {expiresAt && (
          <div className="mt-3 text-center">
            <div className="text-2xl font-black tabular-nums text-amber-900">
              残り {remainMin}:{String(remainSec).padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      <QuestField
        label="① 育てたい力"
        placeholder="例：コミュニケーション力／継続力／判断力 など"
        value={growSkill}
        onChange={(v) => setGrowSkill(v.slice(0, 30))}
        rows={2}
        maxLen={30}
        hints={GROW_SKILLS}
        hintColor="amber"
      />

      <QuestField
        label="② ゲームの中で意識したい行動"
        placeholder="例：味方への声かけ／毎日の練習継続 など"
        value={gameAction}
        onChange={(v) => setGameAction(v.slice(0, 40))}
        rows={2}
        maxLen={40}
        hints={GAME_ACTIONS}
        hintColor="emerald"
      />

      <QuestField
        label="③ 学校生活で意識したい行動"
        placeholder="例：質問を1日1個する／挨拶を自分から など"
        value={schoolAction}
        onChange={(v) => setSchoolAction(v.slice(0, 40))}
        rows={2}
        maxLen={40}
        hints={SCHOOL_ACTIONS}
        hintColor="cyan"
      />

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

// 入力フィールド + 折りたたみヒント例
const HINT_COLORS = {
  amber: 'bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-300',
  emerald: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-300',
  cyan: 'bg-cyan-100 text-cyan-900 hover:bg-cyan-200 border-cyan-300',
} as const;

const QuestField = ({
  label,
  placeholder,
  value,
  onChange,
  rows,
  maxLen,
  hints,
  hintColor,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  maxLen: number;
  hints: readonly string[];
  hintColor: keyof typeof HINT_COLORS;
}) => {
  const [showHints, setShowHints] = useState(false);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <span className="text-[10px] text-slate-400">
          {value.length} / {maxLen}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLen}
        className="w-full rounded-lg border-2 border-slate-300 focus:border-amber-500 px-3 py-2 text-base resize-none outline-none"
      />
      <button
        type="button"
        onClick={() => setShowHints((v) => !v)}
        className="mt-1.5 text-[11px] text-slate-500 hover:text-slate-700 underline"
      >
        {showHints ? 'ヒント例を隠す' : '💡 ヒント例を見る（自分の言葉でOK）'}
      </button>
      {showHints && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {hints.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onChange(h)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition ${HINT_COLORS[hintColor]}`}
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
