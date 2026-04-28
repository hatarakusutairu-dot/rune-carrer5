import type { Choice, Scores, SeedType } from '@/types';
import { SEED_ORDER } from '@/content/seedTypes';
import { MINI_GAMES } from '@/content/miniGames';

export const calcScores = (answers: Record<string, Choice>): Scores => {
  const scores = SEED_ORDER.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as Scores);

  for (const q of MINI_GAMES) {
    const a = answers[q.id];
    if (!a) continue;
    const opt = q.options.find((o) => o.key === a);
    if (!opt) continue;
    scores[opt.main] += 2;
    if (opt.sub) scores[opt.sub] += 1;
  }

  return scores;
};

export const topTypes = (scores: Scores, n = 2): SeedType[] => {
  const entries = SEED_ORDER.map((k) => [k, scores[k]] as const);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, n).map(([k]) => k);
};
