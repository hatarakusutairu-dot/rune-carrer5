// 全画像スロットの一元レジストリ
// 用途: AdminDiagnostics で配信状況を一覧監視 / AdminImages のスロット定義
// （実際の表示は各コンポーネントが直接 src を指定。このレジストリは管理用）

import { EMOTIONS } from './emotions';
import { AI_AVATARS } from './aiAvatars';

export type ImageSlot = {
  category: string;
  src: string;
  label: string;
  fallback: string;
};

const BALLOON_COLORS = ['red', 'yellow', 'blue', 'green', 'purple', 'pink'] as const;
const BALLOON_SIZES = ['small', 'mid', 'large'] as const;
const SHAPE_TYPES = ['circle', 'triangle', 'square', 'star', 'diamond', 'hex'] as const;
const SHAPE_COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'] as const;
const COIN_SIZES = [1, 3, 5, 7, 10] as const;
const TOWER_DISKS = [1, 2, 3, 4, 5] as const;
const RACERS = ['red', 'blue', 'green', 'purple'] as const;
const FOODS = ['sushi', 'ramen', 'tempura', 'curry', 'salad', 'tea'] as const;
const CUSTOMERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const REACTIONS = [
  ['thumbs', '👍'],
  ['heart', '❤️'],
  ['laugh', '😂'],
  ['surprise', '😮'],
  ['sprout', '🌱'],
  ['fire', '🔥'],
  ['clap', '👏'],
  ['party', '🎉'],
] as const;
const CARDS = ['a', 'b', 'c', 'd'] as const;

export const IMAGE_REGISTRY: ImageSlot[] = [
  // 1. ロゴ
  { category: 'ロゴ', src: '/img/logo.png', label: 'アプリロゴ', fallback: '🌱' },

  // 2. 表情
  ...EMOTIONS.map((e) => ({
    category: '表情',
    src: `/img/emotion-${e.key}.png`,
    label: e.label,
    fallback: e.emoji,
  })),

  // 3. AIアバター
  ...AI_AVATARS.map((a) => ({
    category: 'AIアバター',
    src: `/img/avatar-${a.key}.png`,
    label: a.name,
    fallback: a.face,
  })),

  // 4. 風船
  ...BALLOON_COLORS.flatMap((c) =>
    BALLOON_SIZES.map((s) => ({
      category: '風船',
      src: `/img/balloon-${c}-${s}.png`,
      label: `風船 ${c} ${s}`,
      fallback: '🎈',
    })),
  ),
  { category: '風船', src: '/img/balloon-pop.png', label: '割れた風船', fallback: '💥' },

  // 5. カード
  ...CARDS.map((k) => ({
    category: 'カード',
    src: `/img/card-deck-${k}.png`,
    label: `カード ${k.toUpperCase()}`,
    fallback: '🎴',
  })),
  { category: 'カード', src: '/img/card-back-flipped.png', label: 'めくった裏面', fallback: '🎴' },

  // 6. コイン
  ...COIN_SIZES.map((n) => ({
    category: 'コイン',
    src: `/img/coin-${n}.png`,
    label: `コイン ${n}枚`,
    fallback: '🪙',
  })),

  // 7. 信号
  { category: '信号', src: '/img/signal-go.png', label: 'GO', fallback: '▶' },
  { category: '信号', src: '/img/signal-stop.png', label: 'STOP', fallback: '✋' },

  // 8. 図形
  ...SHAPE_TYPES.flatMap((shape) =>
    SHAPE_COLORS.map((color) => ({
      category: '図形',
      src: `/img/shape-${shape}-${color}.png`,
      label: `${shape}-${color}`,
      fallback: '◆',
    })),
  ),

  // 9. ランナーキャラ
  ...RACERS.flatMap((c) =>
    [1, 2].map((f) => ({
      category: 'ランナー',
      src: `/img/racer-${c}-frame${f}.png`,
      label: `${c} frame${f}`,
      fallback: '🏃',
    })),
  ),

  // 10. 待機シーン（gif優先、png でも可）
  { category: '待機', src: '/img/waiting-scene.gif', label: '待機シーン (GIF)', fallback: '🌿' },
  { category: '待機', src: '/img/waiting-scene.png', label: '待機シーン (PNG・GIF無い時)', fallback: '🌿' },

  // 11. Towers
  { category: '塔', src: '/img/tower-peg.png', label: '杭', fallback: '🪧' },
  ...TOWER_DISKS.map((n) => ({
    category: '塔',
    src: `/img/tower-disk-${n}.png`,
    label: `円盤 ${n}`,
    fallback: '🔵',
  })),

  // 12. 食堂
  ...FOODS.map((f) => ({
    category: '食堂',
    src: `/img/food-${f}.png`,
    label: `料理 ${f}`,
    fallback: '🍽',
  })),
  ...CUSTOMERS.map((n) => ({
    category: '食堂',
    src: `/img/customer-${n}.png`,
    label: `客 ${n}`,
    fallback: '🙂',
  })),

  // 13. リアクション
  ...REACTIONS.map(([key, emoji]) => ({
    category: 'リアクション',
    src: `/img/reaction-${key}.png`,
    label: `リアクション ${key}`,
    fallback: emoji,
  })),
];

export const IMAGE_CATEGORIES = Array.from(new Set(IMAGE_REGISTRY.map((s) => s.category)));
