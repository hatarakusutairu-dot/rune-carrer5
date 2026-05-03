interface Props {
  variant: 'teacher' | 'student';
}

const LINKS: Array<{ action: string; skill: string; future: string; icon: string }> = [
  { action: '味方に声をかける', skill: 'コミュニケーション力', future: 'チーム作業・面接・接客', icon: '📣' },
  { action: '負けた理由を考える', skill: '分析力・改善力', future: '勉強の振り返り・仕事の改善', icon: '🔎' },
  { action: 'アップデートに対応する', skill: '適応力', future: 'AI時代・デジタル社会', icon: '⚡' },
  { action: 'ボイチャで指示を出す', skill: 'リーダーシップ', future: 'プロジェクト・部活運営', icon: '🎤' },
  { action: '毎日ログインして練習', skill: '継続力', future: '資格取得・スキル習得', icon: '📅' },
  { action: '役割を決めて連携する', skill: '協働力', future: 'グループワーク・職場', icon: '🧩' },
];

export const Stage5SkillLink = ({ variant }: Props) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyan-50 via-emerald-50 to-amber-50 border border-cyan-200 p-6">
      <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
        Stage 5
      </div>
      <h2 className="mt-1 text-2xl font-black text-slate-900">
        ゲームで育つ力 → 社会で活きる場面
      </h2>
      <p className="mt-2 text-sm text-slate-700">
        ゲームで自然にやっていることが、そのまま社会につながります。
      </p>

      <div className="mt-5 grid gap-2">
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

      {variant === 'teacher' && (
        <p className="mt-4 text-xs text-slate-500">
          講師メモ：1〜2例を口頭で深掘りすると伝わりやすいです（推し例：ボイチャ→リーダーシップ）。
        </p>
      )}
    </div>
  );
};
