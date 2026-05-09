// スライドファイル名 → アプリ状態 (stage, gameId) のマッピング
// 「▶ 次へ」がスライドを進めると、この表を見て自動で Stage / Game も切り替える
// クライアント・サーバー両方で利用

import type { GameId } from './protocol';

export type SlideContext = {
  stage?: number;       // このスライド表示中のStage
  gameId?: GameId;      // このスライド表示中のゲーム
  startGame?: boolean;  // このスライドに遷移したらゲームを自動開始
};

// ファイル名のキーワード → context
const PATTERNS: Array<{ pattern: RegExp; context: SlideContext }> = [
  // オープニング（Stage 0 前）
  { pattern: /opening/, context: {} },
  { pattern: /teacher/, context: {} },
  // Stage 0
  { pattern: /mission/, context: { stage: 0 } },
  { pattern: /rules/, context: { stage: 0 } },
  { pattern: /flow/, context: { stage: 0 } },
  // Stage 1 intro
  { pattern: /stage1-intro/, context: { stage: 1 } },
  { pattern: /games-overview/, context: { stage: 1 } },
  // Stage 1 individual games
  { pattern: /balloon/, context: { stage: 1, gameId: 'balloon', startGame: true } },
  { pattern: /game2-digit|digit/, context: { stage: 1, gameId: 'digit_span', startGame: true } },
  { pattern: /game3-money|money|coin/, context: { stage: 1, gameId: 'money_split', startGame: true } },
  { pattern: /game4-emotion|emotion/, context: { stage: 1, gameId: 'emotion_match', startGame: true } },
  { pattern: /game5-waiter|waiter|wasabi/, context: { stage: 1, gameId: 'wasabi_waiter', startGame: true } },
  { pattern: /card-deck|game.*card/, context: { stage: 1, gameId: 'card_decks', startGame: true } },
  { pattern: /signal/, context: { stage: 1, gameId: 'stop_signal', startGame: true } },
  { pattern: /pattern|shape/, context: { stage: 1, gameId: 'pattern_match', startGame: true } },
  { pattern: /tower/, context: { stage: 1, gameId: 'towers', startGame: true } },
  // Stage 2
  { pattern: /stage2/, context: { stage: 2 } },
  { pattern: /types-overview/, context: { stage: 2 } },
  { pattern: /results-howto/, context: { stage: 2 } },
  // Stage 3
  { pattern: /stage3/, context: { stage: 3 } },
  // Stage 4
  { pattern: /stage4/, context: { stage: 4 } },
  { pattern: /strengths-in/, context: { stage: 4 } },
  { pattern: /ai-in-recruit/, context: { stage: 4 } },
  { pattern: /what-companies/, context: { stage: 4 } },
  { pattern: /ai-japan|ai-overview|ai-avatar/, context: { stage: 4 } },
  // Stage 5
  { pattern: /gaming-strength/, context: { stage: 5 } },
  { pattern: /game-skills/, context: { stage: 5 } },
  { pattern: /game-society/, context: { stage: 5 } },
  { pattern: /skills-link/, context: { stage: 5 } },
  // Stage 6
  { pattern: /stage6/, context: { stage: 6 } },
  { pattern: /my-quest|quest-prompt/, context: { stage: 6 } },
  // Closing
  { pattern: /closing/, context: {} },
];

export const slideContextOf = (filename: string): SlideContext => {
  for (const { pattern, context } of PATTERNS) {
    if (pattern.test(filename)) return context;
  }
  return {};
};
