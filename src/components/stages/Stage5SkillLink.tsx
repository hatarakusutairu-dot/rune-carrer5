import { useState } from 'react';
import { useSync } from '@/contexts/SyncContext';
import { Button } from '@/components/common/Button';

interface Props {
  variant: 'teacher' | 'student';
}

const STEPS = [
  { idx: 0, key: 'think', label: '① まず考えてみよう' },
  { idx: 1, key: 'collect', label: '② みんなの意見を集計' },
  { idx: 2, key: 'reveal', label: '③ クラスの意見を開示' },
  { idx: 3, key: 'map', label: '④ 一般的な対応マップ' },
] as const;

const LINKS: Array<{ action: string; skill: string; future: string; icon: string }> = [
  { action: '味方に声をかける', skill: 'コミュニケーション力', future: 'チーム作業・面接・接客', icon: '📣' },
  { action: '負けた理由を考える', skill: '分析力・改善力', future: '勉強の振り返り・仕事の改善', icon: '🔎' },
  { action: 'アップデートに対応する', skill: '適応力', future: 'AI時代・デジタル社会', icon: '⚡' },
  { action: 'ボイチャで指示を出す', skill: 'リーダーシップ', future: 'プロジェクト・部活運営', icon: '🎤' },
  { action: '毎日ログインして練習', skill: '継続力', future: '資格取得・スキル習得', icon: '📅' },
  { action: '役割を決めて連携する', skill: '協働力', future: 'グループワーク・職場', icon: '🧩' },
];

export const Stage5SkillLink = ({ variant }: Props) => {
  const { state, send } = useSync();
  const step = state?.stageStep ?? 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyan-50 via-emerald-50 to-amber-50 border border-cyan-200 p-6 space-y-5">
      <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
        Stage 5：ゲームで育つ力 → 社会で活きる場面
      </div>

      {/* ステップ表示 */}
      <div className="flex flex-wrap gap-1">
        {STEPS.map((s) => (
          <div
            key={s.idx}
            className={`px-3 py-1.5 text-xs rounded-full font-semibold ${
              step === s.idx
                ? 'bg-cyan-700 text-white'
                : step > s.idx
                  ? 'bg-cyan-100 text-cyan-800'
                  : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {step === 0 && <ThinkStep variant={variant} />}
      {step === 1 && <CollectStep variant={variant} />}
      {step === 2 && <RevealStep variant={variant} />}
      {step >= 3 && <MapStep variant={variant} />}

      {variant === 'teacher' && (
        <div className="flex justify-between gap-2 pt-2 border-t border-cyan-200">
          <Button
            variant="secondary"
            onClick={() => send({ type: 'T_PREV_STEP' })}
            disabled={step === 0}
          >
            ← 前のステップ
          </Button>
          <Button
            onClick={() => send({ type: 'T_NEXT_STEP' })}
            disabled={step >= STEPS.length - 1}
          >
            次のステップ →
          </Button>
        </div>
      )}
    </div>
  );
};

// ─────────── ① 考える ───────────
const ThinkStep = ({ variant }: { variant: 'teacher' | 'student' }) => {
  const { send } = useSync();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!text.trim()) return;
    send({ type: 'S_SKILL_OPINION', text: text.trim().slice(0, 80) });
    setSubmitted(true);
  };

  if (variant === 'teacher') {
    return (
      <div className="rounded-xl bg-white border border-cyan-200 p-4 space-y-2">
        <h3 className="font-bold text-lg">
          ゲームをやっていて、どんな力が育ったと思う？
        </h3>
        <p className="text-sm text-slate-700">
          生徒は手元のスマホで自分の考えを書いてもらってください。
          <br />
          1〜2分時間を取ってから「次のステップ →」を押すとみんなで集計します。
        </p>
        <ul className="mt-3 text-sm text-slate-700 list-disc list-inside space-y-0.5">
          <li>「上手くなった」「身についた」とよく聞かれること</li>
          <li>「ゲームをやっていて自然に育ったと思う力」</li>
          <li>正解はありません</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-cyan-200 p-4 space-y-3">
      <h3 className="font-bold">ゲームで育ったと思う力は何？</h3>
      <p className="text-xs text-slate-600">
        短くてOK（80文字以内）。例：「集中力」「諦めない力」「英語」
      </p>

      {submitted ? (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
          <div className="text-2xl">✅</div>
          <p className="text-sm font-bold text-emerald-900 mt-1">送信しました</p>
          <p className="text-xs text-slate-600 mt-1">
            違う意見があれば、もう一度送ってOK
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-xs text-emerald-700 underline"
          >
            書き直す
          </button>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 80))}
            rows={2}
            placeholder="例：チームで動く力／反応の速さ／英語"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="text-right text-[10px] text-slate-500">{text.length}/80</div>
          <Button onClick={submit} disabled={!text.trim()} className="w-full">
            送る
          </Button>
        </>
      )}
    </div>
  );
};

// ─────────── ② 集計（待機） ───────────
const CollectStep = ({ variant }: { variant: 'teacher' | 'student' }) => {
  const { state, skillOpinions } = useSync();
  if (!state) return null;
  const total = skillOpinions?.total ?? 0;
  const expected = state.totalStudents;

  return (
    <div className="rounded-xl bg-white border border-cyan-200 p-5 text-center">
      <div className="text-4xl">📥</div>
      <h3 className="mt-3 font-bold text-lg">みんなの意見を集計中</h3>
      <div className="mt-2 text-sm text-slate-700">
        <span className="text-2xl font-black text-cyan-800 tabular-nums">{total}</span>
        <span className="text-slate-500"> / {expected}人 提出</span>
      </div>
      {variant === 'teacher' && (
        <p className="mt-3 text-xs text-slate-500">
          みんな提出できたら「次のステップ →」で開示してください。
          <br />
          まだ書いていない子には書く時間を追加で取ってもOK。
        </p>
      )}
      {variant === 'student' && (
        <p className="mt-3 text-xs text-slate-500">
          先生がみんなの意見を画面に出してくれます。
          <br />
          まだ書いてない場合は「← 前のステップ」を先生にお願いしよう。
        </p>
      )}
    </div>
  );
};

// ─────────── ③ 開示 ───────────
const RevealStep = ({ variant: _variant }: { variant: 'teacher' | 'student' }) => {
  const { skillOpinions } = useSync();
  if (!skillOpinions || skillOpinions.total === 0) {
    return (
      <div className="rounded-xl bg-white border border-cyan-200 p-5 text-center text-sm text-slate-600">
        まだ意見がありません。
      </div>
    );
  }

  // 単語頻度の上位
  const topWords = Object.entries(skillOpinions.wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  return (
    <div className="space-y-4">
      {/* よく出てきた言葉（雑なワードクラウド） */}
      {topWords.length > 0 && (
        <div className="rounded-xl bg-white border border-cyan-200 p-4">
          <h3 className="font-bold text-sm">よく出てきた言葉</h3>
          <div className="mt-3 flex flex-wrap gap-2 items-baseline">
            {topWords.map(([w, n], i) => {
              const size = Math.min(2.6, 1 + n * 0.3);
              return (
                <span
                  key={w + i}
                  className="font-bold text-cyan-800"
                  style={{ fontSize: `${size}rem`, lineHeight: 1 }}
                  title={`${n}回`}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 個別意見一覧（匿名） */}
      <div className="rounded-xl bg-white border border-cyan-200 p-4">
        <h3 className="font-bold text-sm">
          みんなの意見（匿名・最大{skillOpinions.opinions.length}件）
        </h3>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {skillOpinions.opinions.map((o, i) => (
            <li
              key={i}
              className="rounded-lg bg-cyan-50 border border-cyan-100 px-3 py-2 text-xs"
            >
              <span className="text-[10px] text-cyan-800 font-semibold mr-2">
                {o.className}
              </span>
              <span className="text-slate-800">{o.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ─────────── ④ 既存マップ ───────────
const MapStep = ({ variant: _variant }: { variant: 'teacher' | 'student' }) => (
  <div className="space-y-3">
    <div className="rounded-xl bg-white border border-cyan-200 p-4">
      <h3 className="font-bold">
        参考：実際にこんな対応がよく言われます
      </h3>
      <p className="text-xs text-slate-600 mt-1">
        みんなが書いてくれた力の多くは、これらに近いはず。
      </p>
    </div>

    <div className="grid gap-2">
      {LINKS.map((l, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-slate-200 p-3 sm:p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl shrink-0">{l.icon}</span>
              <div>
                <div className="text-[11px] text-slate-500">ゲームでの行動</div>
                <div className="text-sm font-semibold">{l.action}</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">育つ力</div>
              <div className="text-sm font-bold text-emerald-700">{l.skill}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">社会で活きる場面</div>
              <div className="text-sm text-slate-700">{l.future}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
