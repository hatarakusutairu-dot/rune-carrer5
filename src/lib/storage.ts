import type { Choice, QuestCard, Scores, SeedType, StoredState } from '@/types';
import { SEED_ORDER } from '@/content/seedTypes';

const STORAGE_KEY = 'rune-carrer5:student';
const VERSION = '1.0';

const emptyScores = (): Scores =>
  SEED_ORDER.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as Scores);

export const initialState = (): StoredState => ({
  version: VERSION,
  timestamp: new Date().toISOString(),
  answers: {},
  scores: emptyScores(),
  topTypes: [],
  questCard: null,
});

const isBrowser = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

export const loadState = (): StoredState => {
  if (!isBrowser()) return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed.version !== VERSION) return initialState();
    return parsed;
  } catch {
    return initialState();
  }
};

export const saveState = (state: StoredState): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, timestamp: new Date().toISOString() })
    );
  } catch {
    // localStorage が使えない環境（プライベートモード等）でも進行は可能
  }
};

export const resetState = (): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const setAnswer = (state: StoredState, questionId: string, choice: Choice): StoredState => ({
  ...state,
  answers: { ...state.answers, [questionId]: choice },
});

export const setScoresAndTopTypes = (
  state: StoredState,
  scores: Scores,
  topTypes: SeedType[]
): StoredState => ({
  ...state,
  scores,
  topTypes,
});

export const setQuestCard = (state: StoredState, card: QuestCard): StoredState => ({
  ...state,
  questCard: card,
});
