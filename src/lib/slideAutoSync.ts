// アプリStage遷移とスライド表示の自動同期
// /teacher で Stage / Game が変わると、/slides が自動的に対応スライドへジャンプ
// マッピングは filename 自動判定 + ユーザー上書き（localStorage）

import type { GameId } from '@shared/protocol';

export type SyncTrigger =
  | { kind: 'stage'; stage: number }
  | { kind: 'game'; gameId: GameId };

const STAGE_PATTERNS: Array<{ stage: number; patterns: RegExp[] }> = [
  { stage: 0, patterns: [/mission/, /rules/, /flow/] },
  { stage: 1, patterns: [/stage1-intro/, /games-overview/] },
  { stage: 2, patterns: [/stage2/, /types-overview/, /results-howto/] },
  { stage: 3, patterns: [/stage3/, /share/] },
  { stage: 4, patterns: [/stage4/, /strengths-in/, /ai-in-recruit/, /what-companies/] },
  { stage: 5, patterns: [/gaming-strength/, /game-skills/, /game-society/] },
  { stage: 6, patterns: [/stage6/, /my-quest/] },
];

const GAME_PATTERNS: Record<GameId, RegExp[]> = {
  balloon: [/balloon/],
  digit_span: [/digit/, /game2/],
  card_decks: [/card-deck/],
  emotion_match: [/emotion/, /game4/],
  money_split: [/money/, /coin/, /game3/],
  stop_signal: [/signal/, /stop/],
  pattern_match: [/pattern/, /shape/],
  towers: [/tower/],
  wasabi_waiter: [/waiter/, /wasabi/, /shokudo/, /game5/],
};

export const triggerKey = (t: SyncTrigger): string =>
  t.kind === 'stage' ? `stage-${t.stage}` : `game-${t.gameId}`;

export const findFirstSlideForTrigger = (
  trigger: SyncTrigger,
  filenames: string[],
): number | null => {
  const patterns =
    trigger.kind === 'stage'
      ? STAGE_PATTERNS.find((s) => s.stage === trigger.stage)?.patterns ?? []
      : GAME_PATTERNS[trigger.gameId] ?? [];
  if (patterns.length === 0) return null;
  for (let i = 0; i < filenames.length; i++) {
    const name = filenames[i];
    if (patterns.some((p) => p.test(name))) return i;
  }
  return null;
};

// localStorage 上書き
const OVERRIDE_KEY_PREFIX = 'slide-sync-override:';
const ENABLED_KEY = 'slide-sync-enabled';

export const getOverride = (trigger: SyncTrigger): number | null => {
  try {
    const v = localStorage.getItem(OVERRIDE_KEY_PREFIX + triggerKey(trigger));
    if (v === null) return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
};

export const setOverride = (trigger: SyncTrigger, slideIndex: number | null): void => {
  try {
    const k = OVERRIDE_KEY_PREFIX + triggerKey(trigger);
    if (slideIndex === null) localStorage.removeItem(k);
    else localStorage.setItem(k, String(slideIndex));
    window.dispatchEvent(new CustomEvent('slide-sync-mapping-changed'));
  } catch {
    // ignore
  }
};

export const isSyncEnabled = (): boolean => {
  try {
    const v = localStorage.getItem(ENABLED_KEY);
    return v === null ? true : v === '1'; // デフォルトON
  } catch {
    return true;
  }
};

export const setSyncEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
    window.dispatchEvent(new CustomEvent('slide-sync-enabled-changed'));
  } catch {
    // ignore
  }
};

// 与えられた trigger に対する slide index（override 優先 → filename 自動判定）
export const resolveTrigger = (
  trigger: SyncTrigger,
  filenames: string[],
): number | null => {
  const ov = getOverride(trigger);
  if (ov !== null && ov >= 0 && ov < filenames.length) return ov;
  return findFirstSlideForTrigger(trigger, filenames);
};
