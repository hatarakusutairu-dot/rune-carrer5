// 自分のゲーム回答を保存（個人分析表示用）
// sessionStorage を使う理由：
//   - タブごとに独立（同一ブラウザの複数タブで違う生徒を試す検証用途に対応）
//   - リロードでは保持される（同一タブ内）
//   - 個人情報は含まない、授業終了で消える

import type { AnswerPayload, GameId } from '@shared/protocol';

const KEY = 'rune-carrer5:my-answers';

export type MyAnswers = Partial<Record<GameId, AnswerPayload>>;

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const loadMyAnswers = (): MyAnswers => {
  const s = storage();
  if (!s) return {};
  try {
    const raw = s.getItem(KEY);
    return raw ? (JSON.parse(raw) as MyAnswers) : {};
  } catch {
    return {};
  }
};

export const saveMyAnswer = (gameId: GameId, payload: AnswerPayload): void => {
  const s = storage();
  if (!s) return;
  try {
    const all = loadMyAnswers();
    all[gameId] = payload;
    s.setItem(KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
};

export const getMyAnswer = (gameId: GameId): AnswerPayload | null => {
  return loadMyAnswers()[gameId] ?? null;
};

export const clearMyAnswers = (): void => {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    // ignore
  }
};
