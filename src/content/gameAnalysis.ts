// 採用ゲーム7種それぞれの「個人向け分析テキスト」
// 海外の認知科学系の採用アセスメント（風船リスク／作業記憶／意思決定／感情認識／
// 社会的選好／反応抑制／パターン推論）を元ネタに、後から見ても納得できる
// 適性検査風の説明にする。全タイプ肯定、断定・優劣・採点なし。

import type { AnswerPayload, GameId, SeedType } from '@shared/protocol';
import { analyzeBalloon } from './analysis/balloon';
import { analyzeDigitSpan } from './analysis/digit_span';
import { analyzeCardDecks } from './analysis/card_decks';
import { analyzeEmotionMatch } from './analysis/emotion_match';
import { analyzeMoneySplit } from './analysis/money_split';
import { analyzeStopSignal } from './analysis/stop_signal';
import { analyzePatternMatch } from './analysis/pattern_match';

export interface PersonalAnalysis {
  // メタ
  gameLabel: string;
  origin: string;            // 元ネタとなる採用アセスメント
  trait: string;             // 測定軸の名称（日本語）
  // タイトル
  headline: string;
  // 解析
  summary: string;           // 1段落の総括
  strengths: string[];       // 強み（箇条書き）
  realLife: string[];        // 日常で現れる場面
  workStyles: string[];      // 向いている働き方・場面
  careers: string[];         // 関連する仕事・役割
  develop: string[];         // この力を伸ばすヒント
  topTraits: SeedType[];     // 上位の芽
  encourage: string;         // 締め
  metrics: Array<{ label: string; value: string }>; // 数値ハイライト
}

const TRAIT_LABEL: Record<SeedType, string> = {
  challenge: 'チャレンジの芽',
  analysis: '分析の芽',
  support: 'サポートの芽',
  leader: 'リーダーの芽',
  continuity: '継続の芽',
  balance: 'バランスの芽',
};

export const traitLabel = (t: SeedType): string => TRAIT_LABEL[t];

export const GAME_LABELS: Record<GameId, string> = {
  balloon: '風船リスク課題',
  digit_span: '数字記憶課題',
  card_decks: '意思決定の山引き課題',
  emotion_match: '表情から気持ちを読む課題',
  money_split: 'コイン分配の選好課題',
  stop_signal: '反応抑制（信号）課題',
  pattern_match: 'パターン推論課題',
};

export const GAME_PURPOSE: Record<GameId, string> = {
  balloon: 'リスクをどう取り、どこで止めるかの判断スタイル',
  digit_span: '一時的な情報をどれだけ正確に保持できるか',
  card_decks: '試行錯誤しながら最適解に近づく学習スタイル',
  emotion_match: '相手の表情からどれだけ感情を汲み取れるか',
  money_split: '自分と他者にどう資源を配分するかの社会的選好',
  stop_signal: '衝動的な反応をどれだけ抑えられるか',
  pattern_match: '規則性を見つけて未知の問題に応用できるか',
};

// ─────────── ディスパッチ ───────────
export const analyzeMyAnswer = (payload: AnswerPayload): PersonalAnalysis => {
  switch (payload.kind) {
    case 'balloon':
      return analyzeBalloon(payload);
    case 'digit_span':
      return analyzeDigitSpan(payload);
    case 'card_decks':
      return analyzeCardDecks(payload);
    case 'emotion_match':
      return analyzeEmotionMatch(payload);
    case 'money_split':
      return analyzeMoneySplit(payload);
    case 'stop_signal':
      return analyzeStopSignal(payload);
    case 'pattern_match':
      return analyzePatternMatch(payload);
  }
};
