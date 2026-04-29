import type { AnswerPayload, GameId } from '@shared/protocol';

export interface GameProps<P extends AnswerPayload = AnswerPayload> {
  // 開始時刻（Unix ms）。3-2-1カウントダウン後にactiveフェーズ突入のタイミング
  startedAtMs: number;
  // ゲームの制限時間（ms）。0なら無制限
  durationMs: number;
  // 完了時に呼ぶ。payload はそのままサーバー送信されローカル保存される
  onComplete: (payload: P) => void;
  // すでに回答済かどうか（再挑戦表示用）。Pass 3 では未使用、Pass 4以降の演出用
  alreadyAnswered?: boolean;
}

// 7ゲームのcomponent辞書ルックアップ用
export type GameComponentMap = Record<GameId, React.ComponentType<GameProps>>;
