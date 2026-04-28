// クライアント・サーバー共有プロトコル
// 個人情報は一切含めない

export type Phase =
  | 'lobby'
  | 'intro'
  | 'active'
  | 'results'
  | 'stage_summary'
  | 'closed';

export type SeedType =
  | 'challenge'
  | 'analysis'
  | 'support'
  | 'leader'
  | 'continuity'
  | 'balance';

export type GameId =
  | 'balloon'
  | 'digit_span'
  | 'card_decks'
  | 'emotion_match'
  | 'money_split'
  | 'stop_signal'
  | 'pattern_match';

export const GAME_ORDER: GameId[] = [
  'balloon',
  'digit_span',
  'card_decks',
  'emotion_match',
  'money_split',
  'stop_signal',
  'pattern_match',
];

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🌱', '🔥', '👏', '🎉'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

// ─────────── 公開ステート（クライアントに送る） ───────────

export interface PublicStudent {
  sid: string;
  className: string;
  joinedAt: number;
}

export interface PublicRoomState {
  code: string;
  classes: string[];
  phase: Phase;
  currentStage: number;
  currentGameId: GameId | null;
  introCountdownAt: number | null;     // この時刻にカウントダウン開始
  activeStartedAt: number | null;
  activeDurationMs: number | null;
  totalStudents: number;
  perClassCount: Record<string, number>;
  serverTime: number;                  // 同期用
}

export interface PerClassAggregation {
  className: string;
  count: number;
  scoresAvg: Record<SeedType, number>; // 平均スコア
  topType: SeedType | null;
}

export interface AggregationResult {
  gameId: GameId;
  totalAnswers: number;
  perClass: PerClassAggregation[];
  overall: {
    scoresAvg: Record<SeedType, number>;
    topType: SeedType | null;
  };
  // ゲームごとの追加メトリクス（任意）
  meta?: Record<string, unknown>;
}

// ─────────── Client → Server ───────────

export type ClientMsg =
  // 講師
  | { type: 'T_CREATE_ROOM'; classes: string[] }
  | { type: 'T_RESUME'; teacherToken: string }
  | { type: 'T_START_GAME'; gameId: GameId; durationMs: number }
  | { type: 'T_END_GAME' }
  | { type: 'T_NEXT_GAME' }
  | { type: 'T_SKIP_GAME'; gameId: GameId }
  | { type: 'T_END_STAGE' }
  | { type: 'T_NEXT_STAGE' }
  | { type: 'T_CLOSE_ROOM' }
  // 生徒
  | { type: 'S_JOIN'; code: string; className: string; sid?: string }
  | { type: 'S_ANSWER'; gameId: GameId; payload: AnswerPayload }
  | { type: 'S_RETRY'; gameId: GameId }
  // 共通
  | { type: 'REACTION'; emoji: ReactionEmoji }
  | { type: 'PING' };

// 各ゲームの回答ペイロード
export type AnswerPayload =
  | { kind: 'balloon'; pumps: number[]; popped: boolean[]; banked: number[] }
  | { kind: 'digit_span'; correct: number; total: number; maxLen: number }
  | { kind: 'card_decks'; picks: number[]; finalScore: number }
  | { kind: 'emotion_match'; correct: number; total: number }
  | { kind: 'money_split'; selfShares: number[] }
  | { kind: 'stop_signal'; commission: number; omission: number; rtMs: number }
  | { kind: 'pattern_match'; correct: number; total: number };

// ─────────── Server → Client ───────────

export type ServerMsg =
  | { type: 'ROOM_CREATED'; code: string; teacherToken: string; state: PublicRoomState }
  | { type: 'JOINED'; sid: string; state: PublicRoomState }
  | { type: 'STATE'; state: PublicRoomState }
  | { type: 'PHASE_CHANGE'; state: PublicRoomState }
  | { type: 'STUDENT_COUNT'; total: number; perClass: Record<string, number> }
  | { type: 'PROGRESS'; gameId: GameId; count: number; total: number; perClass: Record<string, number> }
  | { type: 'AGGREGATION'; result: AggregationResult }
  | { type: 'STAGE_SUMMARY'; perClass: PerClassAggregation[]; overall: AggregationResult['overall'] }
  | { type: 'REACTION_BURST'; emoji: ReactionEmoji; ts: number }
  | { type: 'ERROR'; code: string; message: string }
  | { type: 'PONG' };

export const PROTOCOL_VERSION = 1;

// ─────────── 共通定数 ───────────

export const ROOM_CODE_LENGTH = 6;
export const MAX_STUDENTS_PER_ROOM = 400; // 余裕を持たせる
