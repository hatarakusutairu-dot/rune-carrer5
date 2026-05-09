// スライドビューワー (/slides) と管理ページ (/admin) のタブ間通信
// BroadcastChannel: 同じオリジン内の別タブ・別ウィンドウ間でメッセージ共有
// サーバー不要、認証不要、即時

import type { GameId } from '@shared/protocol';

const CHANNEL_NAME = 'rune-slide-control';

export type SlideControlMessage =
  | { type: 'goto'; index: number }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'first' }
  | { type: 'last' }
  | { type: 'state-request' }
  | { type: 'state-update'; index: number; total: number; name: string }
  // /teacher が Stage / Game を変えた時に発火（自動同期トリガー）
  | { type: 'teacher-state'; stage: number; gameId: GameId | null; phase: string };

let _channel: BroadcastChannel | null = null;

const getChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!_channel) {
    try {
      _channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return _channel;
};

export const sendSlideMessage = (msg: SlideControlMessage): void => {
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage(msg);
  } catch {
    // ignore
  }
};

export const onSlideMessage = (
  handler: (msg: SlideControlMessage) => void,
): (() => void) => {
  const ch = getChannel();
  if (!ch) return () => {};
  const listener = (ev: MessageEvent<SlideControlMessage>) => handler(ev.data);
  ch.addEventListener('message', listener);
  return () => ch.removeEventListener('message', listener);
};

// ファイル名からアプリStage帯を推定
export type SlideStageGroup = {
  key: string;
  label: string;
  patterns: RegExp[];
};

export const STAGE_GROUPS: SlideStageGroup[] = [
  { key: 'open', label: 'オープニング', patterns: [/opening/, /teacher/] },
  { key: 'stage0', label: 'Stage 0 ミッション', patterns: [/mission/, /rules/, /flow/] },
  {
    key: 'stage1',
    label: 'Stage 1 ミニゲーム',
    patterns: [/stage1/, /games-overview/, /^\d+-game\d/],
  },
  {
    key: 'stage2',
    label: 'Stage 2 強み診断',
    patterns: [/stage2/, /types-overview/, /results-howto/],
  },
  {
    key: 'stage4',
    label: 'Stage 4 採用とつなげる',
    patterns: [/stage4/, /strengths-in/, /ai-in-recruit/, /what-companies/],
  },
  {
    key: 'stage5',
    label: 'Stage 5 社会で活きる力',
    patterns: [/gaming-strength/, /game-skills/, /game-society/],
  },
  {
    key: 'stage6',
    label: 'Stage 6 My Quest',
    patterns: [/stage6/, /my-quest/],
  },
  { key: 'closing', label: 'まとめ', patterns: [/closing/] },
];

export const detectStage = (filename: string): string => {
  for (const g of STAGE_GROUPS) {
    if (g.patterns.some((p) => p.test(filename))) return g.key;
  }
  return 'other';
};
