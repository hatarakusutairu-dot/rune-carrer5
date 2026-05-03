interface Props {
  variant: 'teacher' | 'student';
}

const QUESTIONS = [
  { q: '結果は自分っぽかった？', icon: '🤔' },
  { q: '意外だったところは？', icon: '😮' },
  { q: 'ゲーム中の自分にも、似ているところはある？', icon: '🎮' },
  { q: '自分と違うタイプの人がチームにいたら、どんな場面で助かりそう？', icon: '🤝' },
];

export const Stage3Share = ({ variant }: Props) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 border border-amber-200 p-6">
      <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
        Stage 3
      </div>
      <h2 className="mt-1 text-2xl font-black text-slate-900">
        ペア・グループで話してみよう
      </h2>
      <p className="mt-2 text-sm text-slate-700">
        正解はありません。「自分はこう思った」を伝えてみる時間です。
      </p>

      <div className="mt-5 space-y-3">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className="rounded-xl bg-white border border-slate-200 p-4 flex gap-3 items-start"
          >
            <span className="text-2xl shrink-0">{q.icon}</span>
            <span className="text-sm sm:text-base font-medium text-slate-800">
              {q.q}
            </span>
          </div>
        ))}
      </div>

      {variant === 'teacher' && (
        <div className="mt-5 rounded-lg bg-white border border-amber-200 p-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700 mb-1">進行ガイド</div>
          <ul className="list-disc list-inside space-y-0.5">
            <li>ペア2分 → グループ3分 → 数名指名で全体共有</li>
            <li>「この芽はダメ／良い」と評価しない</li>
            <li>違いがあることを肯定的に扱う</li>
          </ul>
        </div>
      )}
      {variant === 'student' && (
        <div className="mt-5 text-xs text-slate-500">
          隣の人から話してみよう。「自分っぽかった？」から始めるとラクだよ。
        </div>
      )}
    </div>
  );
};
