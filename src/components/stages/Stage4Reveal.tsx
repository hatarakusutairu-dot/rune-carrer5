import { ImageWithFallback } from '../common/ImageWithFallback';
import { AI_AVATARS } from '@/content/aiAvatars';
import { useSync } from '@/contexts/SyncContext';

interface Props {
  variant: 'teacher' | 'student';
}

type SubStage = 'reveal' | 'jp_examples' | 'ai_overview' | 'ai_trend' | 'ai_avatar';

const SUB_TABS: ReadonlyArray<readonly [SubStage, string]> = [
  ['reveal', '① 種明かし'],
  ['jp_examples', '② 日本での例'],
  ['ai_overview', '③ AI採用の全体像'],
  ['ai_trend', '④ AI面接の今'],
  ['ai_avatar', '⑤ AIアバター面接'],
] as const;

const REVEAL_HEADLINE = '実は…';

export const Stage4Reveal = ({ variant }: Props) => {
  const { state, send } = useSync();
  const stageStep = state?.stageStep ?? 0;
  const sub = SUB_TABS[Math.max(0, Math.min(SUB_TABS.length - 1, stageStep))][0];
  const isTeacher = variant === 'teacher';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-rose-50 border border-violet-200 p-6 sm:p-8 space-y-5">
      <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
        Stage 4
      </div>

      {/* 上部：サブセクションタブ — 講師のみ操作可、生徒は表示のみ */}
      {isTeacher ? (
        <div className="flex flex-wrap gap-1">
          {SUB_TABS.map(([id, label], i) => (
            <button
              key={id}
              onClick={() => send({ type: 'T_GOTO_STEP', step: i })}
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
      ) : (
        <div className="text-xs font-semibold text-violet-800 px-3 py-1.5 rounded-full bg-violet-100 inline-block">
          {SUB_TABS.find(([id]) => id === sub)?.[1]}
        </div>
      )}

      {sub === 'reveal' && <RevealSection variant={variant} />}
      {sub === 'jp_examples' && <JpExamplesSection />}
      {sub === 'ai_overview' && <AiOverviewSection />}
      {sub === 'ai_trend' && <AiTrendSection />}
      {sub === 'ai_avatar' && <AiAvatarSection />}
    </div>
  );
};

const AiOverviewSection = () => (
  <>
    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
      AIが入っているのは「面接」だけじゃない
    </h2>
    <p className="text-sm text-slate-700">
      採用のほぼ全工程に AI が関わってきています。代表的な使われ方をまとめると——
    </p>

    <div className="grid gap-2">
      {[
        {
          icon: '📑',
          title: '書類選考（エントリーシート・履歴書）',
          body: '何千枚のESを AI が短時間で読み、要点・矛盾・キーワードを抽出。一次選考の負担を減らすために多くの大手で導入されています。',
          examples: '例：HRBrain・i-plug・en-soku など',
        },
        {
          icon: '🎯',
          title: '適性検査・性格診断',
          body: 'SPI・玉手箱に加え、ゲーム型・行動データ型のテストも増加。AIが回答パターンと過去の社員データを照合して相性を予測。',
          examples: '例：SPI3・玉手箱・GPS・mitsucari・ミキワメ',
        },
        {
          icon: '🎤',
          title: '一次面接（録画・チャット）',
          body: '学生がスマホで質問動画に答え、AI が話の構成・声・表情・間合いを評価。24時間どこからでも受験できる。',
          examples: '例：SHaiN・HARUTAKA・apter・interviewmaker',
        },
        {
          icon: '🤝',
          title: 'スカウト・人材マッチング',
          body: 'AI が職務経歴・志向性から候補者を自動マッチング。「こういう人材に向く求人」をAIがプッシュ。',
          examples: '例：BizReach・Wantedly・LAPRAS',
        },
        {
          icon: '🔎',
          title: 'リファレンスチェック・経歴確認',
          body: '前職の同僚や上司への聞き取りを AI が自動化。回答からポジティブ/ネガティブを分類しレポート化。',
          examples: '例：back check・ASHIATO',
        },
        {
          icon: '✉️',
          title: '応募者対応（チャットボット）',
          body: 'よくある質問への自動応答、面接日程調整、書類提出案内まで AI が対応。応募者の体験を改善。',
          examples: '例：HRMOS・Recruit MASTER・各社独自Bot',
        },
        {
          icon: '🌐',
          title: 'オンボーディング・配属支援',
          body: '入社後の最初の数か月、AI が新人の活躍可能性や離職リスクを予測し、上司に支援タイミングを提案。',
          examples: '例：HRBrain・カオナビ・ミキワメ',
        },
        {
          icon: '📊',
          title: '社員評価・人事',
          body: '評価のばらつき・偏りを AI が検知。透明性のある人事を支える方向で広がっています。',
          examples: '例：HRMOS・SmartHR・タレントパレット',
        },
      ].map((row, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-violet-200 p-3 flex gap-3 items-start"
        >
          <span className="text-2xl shrink-0">{row.icon}</span>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900">{row.title}</div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{row.body}</p>
            <p className="text-[11px] text-violet-700 mt-1">{row.examples}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-white border-2 border-violet-300 p-4">
      <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
        つまり、これからの就活・転職は——
        <br />
        <span className="text-violet-700">
          人と話す前に、AI と対話する場面が当たり前になっていきます。
        </span>
      </p>
    </div>
    <p className="text-[11px] text-slate-500 italic">
      ※ サービス名は代表例です。導入状況は変動します。
    </p>
  </>
);

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

    {/* アバター枠：public/img/avatar-{key}.png があれば差し替え、無ければCSS+絵文字 */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {AI_AVATARS.map((a) => (
        <div
          key={a.name}
          className={`rounded-xl bg-gradient-to-br ${a.color} border border-white p-3 text-center shadow-sm`}
        >
          <ImageWithFallback
            src={`/img/avatar-${a.key}.png`}
            fallback={a.face}
            alt={a.name}
            imgClassName="mx-auto w-20 h-20 rounded-full object-cover"
            fallbackClassName="block text-5xl leading-none"
          />
          <div className="mt-2 text-xs font-bold text-slate-800">{a.name}</div>
          <div className="text-[10px] text-slate-600">{a.tag}</div>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-slate-500 italic text-center">
      ※ イメージ画像です。実際の AI 面接官アバターは企業ごとに違います。
    </p>

    {/* 動画埋め込み枠（環境変数 VITE_AI_AVATAR_VIDEO_URL があれば表示） */}
    <AvatarVideoEmbed />

    {/* 実サービスへの外部リンク（別タブで紹介） */}
    <div>
      <div className="text-xs font-semibold text-slate-700 mb-2">
        ↓ 実際のサービスを覗いてみよう（別タブで開きます）
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          {
            name: 'SHaiN（シャイン）',
            url: 'https://shain-ai.jp/',
            desc: 'AIが面接官の対話型AI面接サービス（日本）',
          },
          {
            name: 'HARUTAKA（ハルタカ）',
            url: 'https://harutaka.jp/',
            desc: '動画選考プラットフォーム（日本）',
          },
          {
            name: 'インタビューメーカー',
            url: 'https://interview-maker.jp/',
            desc: 'オンライン面接ツール（日本）',
          },
          {
            name: 'HeyGen（AI アバター生成）',
            url: 'https://www.heygen.com/',
            desc: '世界中で使われるAIアバター動画ツール',
          },
        ].map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white border border-violet-200 p-3 hover:border-violet-400 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900">{s.name}</div>
              <span className="text-xs text-violet-600 group-hover:translate-x-0.5 transition">↗</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{s.desc}</p>
          </a>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500 italic">
        ※ リンク先は各社の公式サイトです。授業中に深追いはせず、雰囲気を見せる用途で。
      </p>
    </div>

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

// AIアバター動画埋め込み枠
// .env で VITE_AI_AVATAR_VIDEO_URL に YouTube 等の埋め込みURLをセットすると表示される
// 例: https://www.youtube.com/embed/XXXXX
const AvatarVideoEmbed = () => {
  const url = import.meta.env.VITE_AI_AVATAR_VIDEO_URL as string | undefined;
  if (!url) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-violet-50 to-rose-50 border-2 border-dashed border-violet-300 p-5 text-center">
        <div className="text-3xl">🎥</div>
        <div className="mt-2 text-sm font-bold text-slate-800">
          実際のAIアバター面接、見てみる？
        </div>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          下のリンクから本物のサービスを別タブで覗けます。<br />
          AIが質問してくる体験デモがあるサービスもあります。
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden border-2 border-violet-300 bg-black">
      <div className="aspect-video">
        <iframe
          src={url}
          className="w-full h-full"
          title="AI avatar"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
};
