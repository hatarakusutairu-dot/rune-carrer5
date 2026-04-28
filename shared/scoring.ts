// ゲーム回答 → 6タイプスコア変換
// クライアント・サーバー両方で利用

import type { AnswerPayload, GameId, SeedType } from './protocol';

export const SEED_ORDER: SeedType[] = [
  'challenge',
  'analysis',
  'support',
  'leader',
  'continuity',
  'balance',
];

export const emptyScores = (): Record<SeedType, number> => ({
  challenge: 0,
  analysis: 0,
  support: 0,
  leader: 0,
  continuity: 0,
  balance: 0,
});

// 各ゲームのスコアリング（0〜10程度に正規化、6タイプの組み合わせに分配）
export const scoreAnswer = (payload: AnswerPayload): Record<SeedType, number> => {
  const s = emptyScores();
  switch (payload.kind) {
    case 'balloon': {
      const avgPumps = payload.pumps.length
        ? payload.pumps.reduce((a, b) => a + b, 0) / payload.pumps.length
        : 0;
      const totalBanked = payload.banked.reduce((a, b) => a + b, 0);
      const popRate =
        payload.popped.filter(Boolean).length / Math.max(payload.popped.length, 1);
      // 多く膨らます=チャレンジ、確実に止める=バランス、安定獲得=継続
      s.challenge += Math.min(avgPumps / 2, 6);
      s.balance += Math.max(0, 5 - popRate * 5);
      s.continuity += Math.min(totalBanked / 10, 4);
      break;
    }
    case 'digit_span': {
      const ratio = payload.correct / Math.max(payload.total, 1);
      s.analysis += ratio * 6 + (payload.maxLen - 3);
      s.continuity += ratio * 3;
      break;
    }
    case 'card_decks': {
      // finalScore が高い = 学習成功（分析・継続）
      // 後半で良いデッキに偏れているか（学習）はクライアント側で算出済の前提
      s.analysis += Math.max(0, Math.min(payload.finalScore / 50, 6));
      s.continuity += Math.max(0, Math.min(payload.finalScore / 50, 4));
      s.challenge += Math.max(0, 3 - Math.abs(payload.finalScore) / 100);
      break;
    }
    case 'emotion_match': {
      const ratio = payload.correct / Math.max(payload.total, 1);
      s.support += ratio * 6;
      s.balance += ratio * 3;
      break;
    }
    case 'money_split': {
      // 自分取り分が小さい = 利他（サポート）、半々 = バランス
      const avgSelf =
        payload.selfShares.reduce((a, b) => a + b, 0) /
        Math.max(payload.selfShares.length, 1);
      const fairness = 1 - Math.abs(5 - avgSelf) / 5; // 5に近いほど公平
      const altruism = Math.max(0, (5 - avgSelf) / 5); // 5未満で利他
      s.support += altruism * 6 + fairness * 2;
      s.balance += fairness * 4;
      s.leader += avgSelf > 6 ? (avgSelf - 6) * 2 : 0; // 強気は決断
      break;
    }
    case 'stop_signal': {
      // commission少ない=自己制御、omission少ない=注意維持、rt速い=反応
      const selfControl = Math.max(0, 6 - payload.commission);
      const attention = Math.max(0, 4 - payload.omission);
      s.balance += selfControl;
      s.analysis += attention;
      s.continuity += attention / 2;
      break;
    }
    case 'pattern_match': {
      const ratio = payload.correct / Math.max(payload.total, 1);
      s.analysis += ratio * 4;
      s.continuity += ratio * 5;
      s.challenge += ratio > 0.5 ? 2 : 0;
      break;
    }
  }
  return s;
};

export const aggregateScores = (
  list: Array<Record<SeedType, number>>
): Record<SeedType, number> => {
  const sum = emptyScores();
  for (const s of list) {
    for (const k of SEED_ORDER) sum[k] += s[k];
  }
  if (list.length > 0) {
    for (const k of SEED_ORDER) sum[k] = sum[k] / list.length;
  }
  return sum;
};

export const topType = (scores: Record<SeedType, number>): SeedType | null => {
  let best: SeedType | null = null;
  let bestVal = -Infinity;
  for (const k of SEED_ORDER) {
    if (scores[k] > bestVal) {
      bestVal = scores[k];
      best = k;
    }
  }
  return best;
};

export const topNTypes = (
  scores: Record<SeedType, number>,
  n = 2
): SeedType[] => {
  const arr = SEED_ORDER.map((k) => [k, scores[k]] as const);
  arr.sort((a, b) => b[1] - a[1]);
  return arr.slice(0, n).map(([k]) => k);
};

// ゲームIDごとの推奨制限時間（ミリ秒）
export const DEFAULT_GAME_DURATION: Record<GameId, number> = {
  balloon: 90_000,
  digit_span: 80_000,
  card_decks: 90_000,
  emotion_match: 70_000,
  money_split: 60_000,
  stop_signal: 90_000,
  pattern_match: 70_000,
};
