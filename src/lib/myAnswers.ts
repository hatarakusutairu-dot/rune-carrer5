// 自分の回答を localStorage に保存（個人分析表示用）
// 個人情報は含まない

import type { AnswerPayload, GameId } from '@shared/protocol';

const KEY = 'rune-carrer5:my-answers';

export type MyAnswers = Partial<Record<GameId, AnswerPayload>>;

export const loadMyAnswers = (): MyAnswers => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MyAnswers) : {};
  } catch {
    return {};
  }
};

export const saveMyAnswer = (gameId: GameId, payload: AnswerPayload): void => {
  try {
    const all = loadMyAnswers();
    all[gameId] = payload;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
};

export const getMyAnswer = (gameId: GameId): AnswerPayload | null => {
  return loadMyAnswers()[gameId] ?? null;
};

export const clearMyAnswers = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};
