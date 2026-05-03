interface Props {
  variant: 'teacher' | 'student';
}

export const Stage0Mission = ({ variant }: Props) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-6 sm:p-8">
      <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
        Stage 0
      </div>
      <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
        今日のミッション
      </h2>

      <div className="mt-5 space-y-3">
        {[
          '正解・不正解はありません',
          'ゲームのうまい下手を見る時間ではありません',
          '自分の強みの芽を見つける時間です',
        ].map((line, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-emerald-600 text-xl shrink-0">●</span>
            <span className="text-base sm:text-lg text-slate-800">{line}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white border border-emerald-200 p-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          このあと7つのミニゲームに挑戦します。
          <br />
          うまくできなくて大丈夫。<strong>選び方</strong>と<strong>考え方</strong>を見ています。
        </p>
      </div>

      {variant === 'teacher' && (
        <p className="mt-4 text-xs text-slate-500">
          講師メモ：「正解はない」を最初に強調してから次へ進んでください。
        </p>
      )}
      {variant === 'student' && (
        <p className="mt-4 text-xs text-slate-500">
          先生のスタートを待ってね。スマホはこのままにしておいてOK。
        </p>
      )}
    </div>
  );
};
