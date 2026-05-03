import type { SeedType } from '@shared/protocol';
import { aggregateScores, emptyScores, scoreAnswer, SEED_ORDER, topNTypes } from '@shared/scoring';
import { loadMyAnswers } from '@/lib/myAnswers';

export interface CumulativeResult {
  scores: Record<SeedType, number>;
  topTypes: SeedType[];
  played: number;       // プレイ済みゲーム数
  total: number;        // 全ゲーム数
}

const TOTAL_GAMES = 7;

// 自分のセッション内の全ゲーム回答から累積スコアと上位タイプを計算
export const computeMyCumulative = (): CumulativeResult => {
  const all = loadMyAnswers();
  const scoreList: Array<Record<SeedType, number>> = [];
  for (const payload of Object.values(all)) {
    if (payload) scoreList.push(scoreAnswer(payload));
  }
  if (scoreList.length === 0) {
    return {
      scores: emptyScores(),
      topTypes: [],
      played: 0,
      total: TOTAL_GAMES,
    };
  }
  // ゲームごとのスコアを加算（avgではなく合計、レーダーは観測値で自動スケール）
  const sum = emptyScores();
  for (const s of scoreList) {
    for (const k of SEED_ORDER) sum[k] += s[k];
  }
  const top = topNTypes(sum, 2);
  return {
    scores: sum,
    topTypes: top,
    played: scoreList.length,
    total: TOTAL_GAMES,
  };
};

// （比較用）平均スコアにしたい場合
export const computeMyCumulativeAvg = (): CumulativeResult => {
  const all = loadMyAnswers();
  const scoreList: Array<Record<SeedType, number>> = [];
  for (const payload of Object.values(all)) {
    if (payload) scoreList.push(scoreAnswer(payload));
  }
  const avg = aggregateScores(scoreList);
  const top = topNTypes(avg, 2);
  return {
    scores: avg,
    topTypes: top,
    played: scoreList.length,
    total: TOTAL_GAMES,
  };
};
