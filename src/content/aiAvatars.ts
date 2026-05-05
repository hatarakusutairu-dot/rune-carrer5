// AI 面接官アバター（Stage4Reveal + 管理ページ画像差し替えで共用）
export type AiAvatar = {
  key: string;
  name: string;
  color: string;
  face: string;
  tag: string;
};

export const AI_AVATARS: AiAvatar[] = [
  { key: 'a', name: 'AI 面接官 A', color: 'from-rose-200 to-orange-200', face: '🤖', tag: '優しい系' },
  { key: 'b', name: 'AI 面接官 B', color: 'from-sky-200 to-violet-200', face: '👩‍💼', tag: '冷静系' },
  { key: 'c', name: 'AI 面接官 C', color: 'from-emerald-200 to-cyan-200', face: '🧑‍💼', tag: '親しみ系' },
  { key: 'd', name: 'AI 面接官 D', color: 'from-amber-200 to-pink-200', face: '👨‍💻', tag: '現場系' },
];
