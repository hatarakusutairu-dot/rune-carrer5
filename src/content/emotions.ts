// 感情データ（EmotionMatch ゲーム + 管理ページ画像差し替えで共用）
// 教育用途・基本感情ベースの10種に絞り込み
export type Emotion = {
  key: string;
  label: string;
  emoji: string;
  // 紛らわしいペア（ダミー候補に優先採用）
  similar: string[];
};

export const EMOTIONS: Emotion[] = [
  { key: 'joy', label: '喜び', emoji: '😄', similar: ['excitement'] },
  { key: 'sad', label: '悲しみ', emoji: '😢', similar: ['lonely'] },
  { key: 'anger', label: '怒り', emoji: '😠', similar: ['disgust'] },
  { key: 'surprise', label: '驚き', emoji: '😲', similar: ['fear'] },
  { key: 'fear', label: '恐れ', emoji: '😨', similar: ['surprise'] },
  { key: 'disgust', label: '嫌悪', emoji: '🤢', similar: ['anger'] },
  { key: 'trust', label: '信頼', emoji: '😌', similar: ['peaceful'] },
  { key: 'lonely', label: '寂しさ', emoji: '🥺', similar: ['sad'] },
  { key: 'peaceful', label: '安らぎ', emoji: '😊', similar: ['trust', 'joy'] },
  { key: 'excitement', label: '興奮', emoji: '😆', similar: ['joy'] },
];
