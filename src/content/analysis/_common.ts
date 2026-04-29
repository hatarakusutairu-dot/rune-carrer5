export const ENCOURAGE_DEFAULT =
  'これは「今日の1回の選択の傾向」です。1回で決まる性格はありません。\nここで見えた特性は、これからの体験で広げていけます。';

export const ENCOURAGE_LOW_SCORE =
  '正答数の多さは、実際の採用でも合否を決めません。\n見ているのは「あなたの取り組み方」です。出てきた特徴は、これから伸ばせる素材。';

export type Band = 'low' | 'mid' | 'high';

export const band = (value: number, lowMax: number, midMax: number): Band =>
  value < lowMax ? 'low' : value < midMax ? 'mid' : 'high';
