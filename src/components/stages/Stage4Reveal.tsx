import { useState } from 'react';

interface Props {
  variant: 'teacher' | 'student';
}

type SubStage = 'reveal' | 'jp_examples' | 'ai_trend' | 'ai_avatar';

const REVEAL_HEADLINE = '実は…';

export const Stage4Reveal = ({ variant }: Props) => {
  const [sub, setSub] = useState<SubStage>('reveal');

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-rose-50 border border-violet-200 p-6 sm:p-8 space-y-5">
      <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
        Stage 4
      </div>

      {/* 上部：サブセクションタブ */}
      <div className="flex flex-wrap gap-1">
        {([
          ['reveal', '① 種明かし'],
          ['jp_examples', '② 日本での例'],
          ['ai_trend', '③ AI面接の今'],
          ['ai_avatar', '④ AIアバター面接'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={`px-3 py-1.5 text-xs rounded-full font-semibold transition ${
              sub === id
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === 'reveal' && (
        <RevealSection variant={variant} />
      )}
      {sub === 'jp_examples' && <JpExamplesSection />}
      {sub === 'ai_trend' && <AiTrendSection />}
      {sub === 'ai_avatar' && <AiAvatarSection />}
    </div>
  );
};

const RevealSection = ({ variant: _variant }: Props) => (
  <>
    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
      {REVEAL_HEADLINE}
    </h2>
    <div className="rounded-xl bg-white border-2 border-violet-300 p-4">
      <p className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
        さっき遊んでもらった<span className="text-violet-700">7つのゲーム</span>、
        <br />
        本当に<span className="text-violet-700">企業の採用</span>で使われている
        <br />
        テストにそっくりです。
      </p>
    </div>
    <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-700 space-y-2 leading-relaxed">
      <p>
        見ているのは<strong>「ゲームのうまさ」ではなく</strong>、
      </p>
      <p className="text-base font-bold text-violet-900">
        どんな風に考えるか／どう選ぶか／どう仲間と関わるか
      </p>
      <p>
        だから、ゲームに慣れていることは「採用の場でも自分を表現しやすい」ということ。
      </p>
    </div>
  </>
);

const JpExamplesSection = () => (
  <>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
      日本でも、こんなところで使われています
    </h2>
    <p className="text-sm text-slate-700">
      日本の採用の現場でも、ゲーム的なテストやAI面接が広がっています。
    </p>

    <div className="grid gap-3">
      {[
        {
          icon: '🏢',
          title: '日本の大手企業の採用',
          body: 'ソフトバンク・ユニリーバジャパン・電通・LINEヤフー など。「ゲーム型適性検査」や「AI面接」を選考に取り入れる企業が増えています。',
        },
        {
          icon: '🎓',
          title: '新卒・インターンの選考',
          body: 'リクナビ・マイナビ・ワンキャリア などの就活サイトでも、AI面接練習ツールが標準装備に。練習はもう「プロのカメラ」より「AIカメラ」が当たり前の時代へ。',
        },
        {
          icon: '⚽',
          title: 'Jリーグ・eスポーツの育成',
          body: 'スポーツ・eスポーツ団体でも、選手の認知特性や反応速度をゲームで測る取り組みが始まっています。',
        },
        {
          icon: '🏥',
          title: '医療・教育の現場',
          body: '医学部や看護系の採用、教員採用試験の一部でも、対人感受性をゲーム形式で見る動きがあります。',
        },
      ].map((row, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-violet-200 p-3 flex gap-3 items-start"
        >
          <span className="text-2xl shrink-0">{row.icon}</span>
          <div>
            <div className="font-bold text-sm text-slate-900">{row.title}</div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{row.body}</p>
          </div>
        </div>
      ))}
    </div>

    <p className="text-xs text-slate-500 italic">
      ※ 採用方式は各社で違います。「すべての会社で必ず使う」ではなく「導入が広がっている」段階です。
    </p>
  </>
);

const AiTrendSection = () => (
  <>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
      AI面接、もう普通になってきています
    </h2>

    <div className="grid gap-3">
      {[
        {
          icon: '🎤',
          title: 'AIに向かって話す面接',
          body: 'AIが「学生時代に頑張ったことを教えて」と聞き、回答を録画。AIが声・表情・話の構成を分析して評価コメントを返してくれます。',
        },
        {
          icon: '📱',
          title: 'スマホ1台で受けられる',
          body: '24時間どこからでも受けられる。会場に行かなくていいので地方の人にもチャンスが広がっています。',
        },
        {
          icon: '🧠',
          title: '評価の見方が変わってきた',
          body: '「正解を答える」より「自分の考えを自分の言葉で話せる」「相手の質問にどう向き合うか」が見られています。',
        },
        {
          icon: '💡',
          title: '練習も AI が相棒に',
          body: '無料の AI面接練習アプリも登場。何度でも練習できて、すぐにフィードバックがもらえます。',
        },
      ].map((row, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-violet-200 p-3 flex gap-3 items-start"
        >
          <span className="text-2xl shrink-0">{row.icon}</span>
          <div>
            <div className="font-bold text-sm text-slate-900">{row.title}</div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{row.body}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-white border-2 border-violet-300 p-4">
      <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
        ということは——
        <br />
        <span className="text-violet-700">
          ゲーム・配信・オンライン会話に慣れている人ほど、
          <br />
          AI面接の場でも自然に振る舞える可能性が高い。
        </span>
      </p>
    </div>
  </>
);

const AiAvatarSection = () => (
  <>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
      AIアバター面接の世界
    </h2>
    <p className="text-sm text-slate-700">
      最近は <strong>AIが作ったアバター面接官</strong> が登場しています。
    </p>

    {/* アバターのイメージ（CSSで描画。実画像は後で差し替え可） */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { name: 'AI 面接官 A', color: 'from-rose-200 to-orange-200', face: '🤖', tag: '優しい系' },
        { name: 'AI 面接官 B', color: 'from-sky-200 to-violet-200', face: '👩‍💼', tag: '冷静系' },
        { name: 'AI 面接官 C', color: 'from-emerald-200 to-cyan-200', face: '🧑‍💼', tag: '親しみ系' },
        { name: 'AI 面接官 D', color: 'from-amber-200 to-pink-200', face: '👨‍💻', tag: '現場系' },
      ].map((a) => (
        <div
          key={a.name}
          className={`rounded-xl bg-gradient-to-br ${a.color} border border-white p-3 text-center shadow-sm`}
        >
          <div className="text-5xl">{a.face}</div>
          <div className="mt-2 text-xs font-bold text-slate-800">{a.name}</div>
          <div className="text-[10px] text-slate-600">{a.tag}</div>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-slate-500 italic text-center">
      ※ イメージ画像です。実際の AI 面接官アバターは企業ごとに違います。
    </p>

    <div className="grid gap-3">
      {[
        {
          icon: '🎭',
          title: 'アバターは会話してくれる',
          body: '相手の言葉を聞いて、表情を変え、追加の質問もしてくれる。VTuber と話す感覚に近いです。',
        },
        {
          icon: '🌐',
          title: 'メタバース面接も登場',
          body: 'バーチャル空間に集まって、自分のアバターで会社説明会・グループディスカッション・面接が完結。',
        },
        {
          icon: '🎮',
          title: 'eスポーツの世界に近い',
          body: '画面越しに自分を表現する力。これはまさにみんながゲームでやっていること。',
        },
      ].map((row, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-violet-200 p-3 flex gap-3 items-start"
        >
          <span className="text-2xl shrink-0">{row.icon}</span>
          <div>
            <div className="font-bold text-sm text-slate-900">{row.title}</div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{row.body}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 border-2 border-violet-300 p-4">
      <p className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
        ゲームで磨いてきた力は、これからの社会で必ず役に立つ。
      </p>
      <p className="mt-2 text-sm text-slate-700">
        画面越しのコミュニケーション・チームでの動き方・続ける力——
        <br />
        全部、君たちがすでに持っているもの。
      </p>
    </div>
  </>
);
