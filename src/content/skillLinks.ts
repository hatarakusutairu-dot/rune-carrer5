export interface SkillLink {
  gameAction: string;
  growSkill: string;
  realLife: string;
}

export const SKILL_LINKS: SkillLink[] = [
  { gameAction: '味方に声をかける',     growSkill: 'コミュニケーション力',  realLife: 'チーム作業・面接・接客' },
  { gameAction: '負けた理由を考える',   growSkill: '分析力・改善力',        realLife: '勉強の振り返り・仕事の改善' },
  { gameAction: 'アップデートに対応する', growSkill: '適応力',              realLife: 'AI時代・デジタル社会への対応' },
  { gameAction: 'ボイチャで指示を出す',  growSkill: 'リーダーシップ',        realLife: 'プロジェクト推進・部活運営' },
  { gameAction: '毎日ログインして練習',  growSkill: '継続力',                realLife: '資格取得・スキル習得' },
  { gameAction: '役割を決めて連携する',  growSkill: '役割分担・協働力',      realLife: 'グループワーク・職場' },
];

export const GROW_SKILLS_OPTIONS = [
  'コミュニケーション力',
  '分析力',
  '適応力',
  'リーダーシップ',
  '継続力',
  '協働力',
];
