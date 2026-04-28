export type SeedType =
  | 'challenge'
  | 'analysis'
  | 'support'
  | 'leader'
  | 'continuity'
  | 'balance';

export type Choice = 'A' | 'B' | 'C' | 'D';

export interface MiniGameQuestion {
  id: string;
  prompt: string;
  options: Array<{
    key: Choice;
    label: string;
    main: SeedType;
    sub?: SeedType;
  }>;
}

export type Scores = Record<SeedType, number>;

export interface QuestCard {
  growSkill: string;
  gameAction: string;
  schoolAction: string;
}

export interface StoredState {
  version: string;
  timestamp: string;
  answers: Record<string, Choice>;
  scores: Scores;
  topTypes: SeedType[];
  questCard: QuestCard | null;
}

export interface StageMeta {
  id: number;
  key: string;
  title: string;
  startMin: number;
  endMin: number;
  durationMin: number;
}
