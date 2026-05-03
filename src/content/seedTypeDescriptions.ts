// 6タイプの肯定的な説明文（断定回避・全タイプ等価）
import type { SeedType } from '@shared/protocol';

export interface SeedTypeDescription {
  label: string;
  emoji: string;
  short: string;          // 1行キーワード
  description: string;    // 2〜3行の肯定的説明
  futureLink: string;     // 将来の活きる場面
  rareNote: string;       // 少数派時の追加メッセージ
  color: string;          // tailwindクラス
}

export const SEED_TYPE_INFO: Record<SeedType, SeedTypeDescription> = {
  challenge: {
    label: 'チャレンジの芽',
    emoji: '🔥',
    short: '新しさ・挑戦・行動力',
    description: '新しい場面で動き出す力。試してみる勇気がある人で、停滞しているチームに動きをつくれます。',
    futureLink: '新規事業・営業・スポーツ・eスポーツ・起業など、変化の早い場面',
    rareNote: 'チームに1人いると場が動きます。動き出す側に回れる貴重な存在です。',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  analysis: {
    label: '分析の芽',
    emoji: '🧠',
    short: '観察・戦略・冷静さ',
    description: '状況を見て、考えて、選び取る力。落ち着いた判断はチームの方向を決める時に頼られます。',
    futureLink: 'データ・戦略・プログラミング・研究・ものづくりの設計',
    rareNote: '冷静に整理してくれる人がいるとチームは強くなります。視点が違うことは強みです。',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  support: {
    label: 'サポートの芽',
    emoji: '🤝',
    short: '思いやり・協力・気配り',
    description: '誰かを支える視点を持っている力。チームに安心感をつくる役割につながります。',
    futureLink: '教育・医療・カウンセリング・接客・チームの潤滑油',
    rareNote: 'チームの空気を整えられる人は希少。みんなが力を出しやすい場をつくれます。',
    color: 'bg-green-100 text-green-900 border-green-300',
  },
  leader: {
    label: 'リーダーの芽',
    emoji: '⭐',
    short: '引っ張る力・決断・責任感',
    description: '迷う場面で一歩前に出る力。決めて動くことで、周りも動きやすくなります。',
    futureLink: 'プロジェクト推進・経営・部活運営・現場のまとめ役',
    rareNote: '前に出られる人がいるとチームは前進します。引っ張る側に立てる存在です。',
    color: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  continuity: {
    label: '継続の芽',
    emoji: '🌱',
    short: '粘り強さ・地道・積み上げ',
    description: '少しずつでも続けられる力。続けた時間は、後から大きな差になります。',
    futureLink: '資格取得・スキル習得・専門職・職人',
    rareNote: '続けられる人は本当に希少。長い目で結果を出すタイプです。',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  balance: {
    label: 'バランスの芽',
    emoji: '⚖️',
    short: '調整・全体感・落ち着き',
    description: '全体を見て、調整できる力。チームが偏った時に、整える役割になれます。',
    futureLink: '調整役・コーディネーター・運営・マネジメント',
    rareNote: '整えてくれる人がいるとチームは安定します。視野の広さは武器になります。',
    color: 'bg-teal-100 text-teal-900 border-teal-300',
  },
};
