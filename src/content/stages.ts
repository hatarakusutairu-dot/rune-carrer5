import type { StageMeta } from '@/types';

export const STAGES: StageMeta[] = [
  { id: 0, key: 'start',     title: 'Start / 今日のミッション',           startMin: 0,  endMin: 5,  durationMin: 5  },
  { id: 1, key: 'minigame',  title: 'Mini Game / 採用系ミニアプリ体験',     startMin: 5,  endMin: 20, durationMin: 15 },
  { id: 2, key: 'result',    title: 'Result / 強みの芽診断',                startMin: 20, endMin: 27, durationMin: 7  },
  { id: 3, key: 'share',     title: 'Share / ペア・グループ共有',           startMin: 27, endMin: 34, durationMin: 7  },
  { id: 4, key: 'reveal',    title: 'Reveal / 今の採用とつなげる',          startMin: 34, endMin: 42, durationMin: 8  },
  { id: 5, key: 'skilllink', title: 'Skill Link / 社会で活きる力',          startMin: 42, endMin: 52, durationMin: 10 },
  { id: 6, key: 'myquest',   title: 'My Quest / この1年で育てたい力',       startMin: 52, endMin: 60, durationMin: 8  },
];

export const TOTAL_MINUTES = 60;
