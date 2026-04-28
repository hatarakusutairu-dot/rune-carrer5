import type { SeedType } from '@/types';

export interface SeedTypeMeta {
  key: SeedType;
  name: string;
  keyword: string;
  description: string;
  futureLink: string;
  colorClass: string;
}

export const SEED_TYPES: Record<SeedType, SeedTypeMeta> = {
  challenge: {
    key: 'challenge',
    name: 'チャレンジの芽',
    keyword: '新しさ・挑戦・行動力',
    description: '新しい場面で動き出す力。試してみる勇気が、自分にもチームにも前進をもたらします。',
    futureLink: '新規プロジェクト・起業・変化の大きい仕事',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  analysis: {
    key: 'analysis',
    name: '分析の芽',
    keyword: '観察・戦略・冷静さ',
    description: '状況を見て、考えて、選び取る力。落ち着いた判断は、チームの方向を決める力になります。',
    futureLink: 'データ活用・戦略立案・ものづくりの設計',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  support: {
    key: 'support',
    name: 'サポートの芽',
    keyword: '思いやり・協力・気配り',
    description: '誰かを支える視点を持っている力。チームに安心感をつくる役割につながります。',
    futureLink: 'チーム作業・接客・ケアの仕事',
    colorClass: 'bg-green-100 text-green-800 border-green-300',
  },
  leader: {
    key: 'leader',
    name: 'リーダーの芽',
    keyword: '引っ張る力・決断・責任感',
    description: '迷う場面で一歩前に出る力。決めて動くことで、周りも動きやすくなります。',
    futureLink: 'プロジェクト推進・部活運営・現場のまとめ役',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  continuity: {
    key: 'continuity',
    name: '継続の芽',
    keyword: '粘り強さ・地道・積み上げ',
    description: '少しずつでも続けられる力。続けた時間は、後から大きな差になります。',
    futureLink: '資格取得・スキル習得・専門職',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  balance: {
    key: 'balance',
    name: 'バランスの芽',
    keyword: '調整・全体感・落ち着き',
    description: '全体を見て、調整できる力。チームが偏った時に、整える役割になれます。',
    futureLink: '調整役・コーディネーター・運営',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-300',
  },
};

export const SEED_ORDER: SeedType[] = [
  'challenge',
  'analysis',
  'support',
  'leader',
  'continuity',
  'balance',
];
