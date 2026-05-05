// 感情データ（EmotionMatch ゲーム + 管理ページ画像差し替えで共用）
export type Emotion = {
  key: string;
  label: string;
  emoji: string;
  // 紛らわしいペア（ダミー候補に優先採用）
  similar: string[];
};

export const EMOTIONS: Emotion[] = [
  // 基本感情
  { key: 'joy', label: '喜び', emoji: '😄', similar: ['relief', 'excitement'] },
  { key: 'sad', label: '悲しみ', emoji: '😢', similar: ['lonely', 'disappointed'] },
  { key: 'anger', label: '怒り', emoji: '😠', similar: ['irritated', 'contempt'] },
  { key: 'surprise', label: '驚き', emoji: '😲', similar: ['confused', 'fear'] },
  { key: 'fear', label: '恐れ', emoji: '😨', similar: ['anxious', 'surprise'] },
  { key: 'disgust', label: '嫌悪', emoji: '🤢', similar: ['contempt', 'irritated'] },
  { key: 'trust', label: '信頼', emoji: '😌', similar: ['relief', 'peaceful'] },
  { key: 'anticipation', label: '期待', emoji: '🤩', similar: ['excitement', 'joy'] },

  // 微差・採用試験で出やすい
  { key: 'relief', label: '安堵', emoji: '😮‍💨', similar: ['joy', 'trust', 'peaceful'] },
  { key: 'lonely', label: '寂しさ', emoji: '🥺', similar: ['sad', 'disappointed'] },
  { key: 'irritated', label: '苛立ち', emoji: '😤', similar: ['anger', 'disgust'] },
  { key: 'confused', label: '戸惑い', emoji: '😕', similar: ['surprise', 'anxious'] },
  { key: 'anxious', label: '不安', emoji: '😟', similar: ['fear', 'sad', 'confused'] },
  { key: 'contempt', label: '軽蔑', emoji: '😏', similar: ['disgust', 'anger'] },
  { key: 'peaceful', label: '安らぎ', emoji: '😊', similar: ['trust', 'relief'] },
  { key: 'excitement', label: '興奮', emoji: '😆', similar: ['joy', 'anticipation'] },
  // ハードモード
  { key: 'disappointed', label: '落胆', emoji: '😔', similar: ['sad', 'lonely'] },
  { key: 'tense', label: '緊張', emoji: '😬', similar: ['anxious', 'fear'] },
];
