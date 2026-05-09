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
  | 'pattern_match'
  | 'towers'
  | 'wasabi_waiter';

export const GAME_ORDER: GameId[] = [
  'balloon',
  'digit_span',
  'card_decks',
  'emotion_match',
  'money_split',
  'stop_signal',
  'pattern_match',
  'towers',
  'wasabi_waiter',
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
  // ステージ内サブステップ（Stage 5 等で使用、Stage切替で0にリセット）
  stageStep: number;
  // スライド進行（全クライアント共有、講師が「次へ」で進める）
  slideIndex: number;
  // スライド後フェーズのステップ（0=スライド表示、>=1=フェーズ進行中）
  postSlideStep: number;
  // 授業開始フラグ（false=入室待機画面、true=スライド進行）
  classStarted: boolean;
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
  | { type: 'T_NEXT_STEP' }
  | { type: 'T_PREV_STEP' }
  | { type: 'T_NEXT_SLIDE' }
  | { type: 'T_PREV_SLIDE' }
  | { type: 'T_GOTO_SLIDE'; index: number }
  | { type: 'T_SET_SLIDE_DECK'; names: string[] }
  | { type: 'T_START_CLASS' }
  | { type: 'T_CLOSE_ROOM' }
  // 生徒
  | { type: 'S_PEEK'; code: string }
  | { type: 'S_JOIN'; code: string; className: string; sid?: string }
  | { type: 'S_QUEST'; growSkill: string; gameAction: string; schoolAction: string }
  | { type: 'S_SKILL_OPINION'; text: string }
  | { type: 'S_GAME_SKILLS'; texts: string[] }
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
  | { kind: 'pattern_match'; correct: number; total: number }
  | { kind: 'towers'; puzzlesSolved: number; totalMoves: number; optimalMoves: number; timeMs: number }
  | { kind: 'wasabi_waiter'; served: number; correctOrders: number; missed: number; avgWaitMs: number };

// ─────────── Server → Client ───────────

export type ServerMsg =
  | { type: 'ROOM_CREATED'; code: string; teacherToken: string; state: PublicRoomState }
  | { type: 'PEEKED'; state: PublicRoomState }
  | { type: 'JOINED'; sid: string; state: PublicRoomState }
  | { type: 'STATE'; state: PublicRoomState }
  | { type: 'PHASE_CHANGE'; state: PublicRoomState }
  | { type: 'STUDENT_COUNT'; total: number; perClass: Record<string, number> }
  | {
      type: 'PROGRESS';
      gameId: GameId;
      count: number;
      total: number;
      perClass: Record<string, number>;
      // 累積スコアから算出した、現時点でのクラス別最多タイプ（任意）
      perClassTopType?: Record<string, SeedType | null>;
    }
  | { type: 'AGGREGATION'; result: AggregationResult }
  | { type: 'STAGE_SUMMARY'; perClass: PerClassAggregation[]; overall: AggregationResult['overall'] }
  | {
      type: 'QUEST_AGG';
      total: number;
      perClass: Record<string, number>;
      growSkillCounts: Record<string, number>;
      gameActionCounts: Record<string, number>;
      schoolActionCounts: Record<string, number>;
      // 匿名サンプル（最大20件）
      samples: Array<{ className: string; growSkill: string; gameAction: string; schoolAction: string }>;
    }
  | {
      type: 'SKILL_OPINIONS_AGG';
      total: number;
      perClass: Record<string, number>;
      // 匿名意見一覧（最大100件）
      opinions: Array<{ className: string; text: string }>;
      // 単語頻度（簡易ワードクラウド用）
      wordCounts: Record<string, number>;
    }
  | { type: 'REACTION_BURST'; emoji: ReactionEmoji; ts: number }
  | { type: 'ERROR'; code: string; message: string }
  | { type: 'PONG' };

export const PROTOCOL_VERSION = 1;

// ─────────── 共通定数 ───────────

export const ROOM_CODE_LENGTH = 6;
export const MAX_STUDENTS_PER_ROOM = 400; // 余裕を持たせる
