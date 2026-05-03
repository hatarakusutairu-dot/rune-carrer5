// My Quest Card の保存（sessionStorage）

const KEY = 'rune-carrer5:my-quest';

export interface QuestCard {
  growSkill: string;
  gameAction: string;
  schoolAction: string;
  savedAt: string;
}

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const loadQuestCard = (): QuestCard | null => {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuestCard) : null;
  } catch {
    return null;
  }
};

export const saveQuestCard = (card: Omit<QuestCard, 'savedAt'>): void => {
  const s = storage();
  if (!s) return;
  try {
    const data: QuestCard = { ...card, savedAt: new Date().toISOString() };
    s.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export const clearQuestCard = (): void => {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    // ignore
  }
};
