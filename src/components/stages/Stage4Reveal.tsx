interface Props {
  variant: 'teacher' | 'student';
}

export const Stage4Reveal = ({ variant }: Props) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-rose-50 border border-violet-200 p-6 sm:p-8">
      <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
        Stage 4
      </div>
      <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
        実は採用で使われています
      </h2>

      <div className="mt-5 rounded-xl bg-white border border-violet-200 p-4">
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          さっきの7つのゲーム、本当に企業の採用で使われているものに似ています。
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {[
          {
            title: '海外の大手金融・人材プラットフォーム・日用品メーカー',
            games: '風船リスク／カード山引き／表情認識',
          },
          {
            title: '海外の大手通信・ホテルチェーン',
            games: '数字記憶／信号反応',
          },
          {
            title: '海外の大手会計・コンサル系企業',
            games: 'パターン推論',
          },
        ].map((row, i) => (
          <div
            key={i}
            className="rounded-xl bg-white border border-slate-200 p-3 text-sm"
          >
            <div className="text-xs text-slate-500 mb-0.5">採用で使っている例</div>
            <div className="font-semibold text-slate-800">{row.title}</div>
            <div className="text-xs text-violet-700 mt-0.5">→ {row.games}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-white border border-violet-200 p-4 space-y-2 text-sm text-slate-800 leading-relaxed">
        <p>
          見ているのは <strong>ゲームのうまさ</strong> ではなく、
          <br />
          <strong>どんな風に考えるか／どう選ぶか／どう仲間と関わるか</strong> です。
        </p>
        <p>
          AI面接やアバター面接など、新しい採用の形も出てきています。
        </p>
        <p className="font-bold text-violet-900">
          ゲーム・アバター・オンライン空間に慣れていることは、
          これからの社会では<strong className="text-pink-600">強みになる可能性</strong>があります。
        </p>
      </div>

      {variant === 'teacher' && (
        <p className="mt-4 text-xs text-slate-500">
          講師メモ：ここはアプリの文字を読むより、口頭で熱量を込めて話すと刺さります。
        </p>
      )}
    </div>
  );
};
