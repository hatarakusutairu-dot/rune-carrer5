// 採用ゲーム7種それぞれの「個人向け分析テキスト」
// 全タイプを肯定的に描写し、断定・優劣・採点をしない

import type { AnswerPayload, GameId, SeedType } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';

export interface PersonalAnalysis {
  headline: string;        // 一言で
  detail: string[];        // 補足（複数行）
  topTraits: SeedType[];   // 上位の芽
  encourage: string;       // 締めの励まし
}

const TRAIT_LABEL: Record<SeedType, string> = {
  challenge: 'チャレンジの芽',
  analysis: '分析の芽',
  support: 'サポートの芽',
  leader: 'リーダーの芽',
  continuity: '継続の芽',
  balance: 'バランスの芽',
};

const ENCOURAGE_DEFAULT =
  'これは「今日の選び方の傾向」です。明日は違うかもしれない、それでOK。';

// ─────────── ゲーム別分析 ───────────

const analyzeBalloon = (p: Extract<AnswerPayload, { kind: 'balloon' }>): PersonalAnalysis => {
  const avg = p.pumps.length ? p.pumps.reduce((a, b) => a + b, 0) / p.pumps.length : 0;
  const popped = p.popped.filter(Boolean).length;
  const banked = p.banked.reduce((a, b) => a + b, 0);

  let headline = '';
  const detail: string[] = [];
  if (avg < 4) {
    headline = '見極めて、確実に積み上げるタイプ';
    detail.push('小さく始めて確実に。失敗を避ける感覚があります。');
  } else if (avg < 8) {
    headline = '攻めと守りを切り替えられるタイプ';
    detail.push('場面に合わせて踏み込み加減を変えられる柔軟さがあります。');
  } else {
    headline = '思い切り良く挑戦できるタイプ';
    detail.push('チャンスを大きく取りに行く姿勢が見えました。');
  }
  if (popped > 0) {
    detail.push(`割れた回数：${popped}回。失敗しても次の挑戦に活きます。`);
  } else if (p.pumps.length > 0) {
    detail.push('一度も割らずに止められたのは観察と判断ができている証拠。');
  }
  detail.push(`総獲得：${banked}ポイント`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
};

const analyzeDigitSpan = (p: Extract<AnswerPayload, { kind: 'digit_span' }>): PersonalAnalysis => {
  const ratio = p.correct / Math.max(p.total, 1);
  let headline = '';
  const detail: string[] = [];
  if (p.maxLen >= 6) {
    headline = '長い情報を一気に保持できる集中力';
    detail.push(`${p.maxLen}桁まで覚えられました。情報処理の力が見えます。`);
  } else if (p.maxLen >= 4) {
    headline = '必要な情報を整理しながら覚えるタイプ';
    detail.push(`${p.maxLen}桁まで到達。落ち着いて取り組める強み。`);
  } else {
    headline = 'プレッシャーの中でも自分のペースを守れる';
    detail.push('数字記憶は得意・苦手がはっきり出る課題。気にしすぎないで。');
  }
  detail.push(`正答数：${p.correct}/${p.total}（正答率 ${Math.round(ratio * 100)}%）`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
};

const analyzeCardDecks = (p: Extract<AnswerPayload, { kind: 'card_decks' }>): PersonalAnalysis => {
  let headline = '';
  const detail: string[] = [];
  if (p.finalScore > 30) {
    headline = '試しながら学んで切り替えられるタイプ';
    detail.push('良いデッキを見つけて、選び方を変えていけました。');
  } else if (p.finalScore > 0) {
    headline = '冷静に観察しながら選ぶタイプ';
    detail.push('リスクを見ながら、損失を抑える選択ができました。');
  } else {
    headline = '挑戦と分析を行ったり来たりするタイプ';
    detail.push('今日は学びの最中。何が良かったかを言葉にすると次に活きます。');
  }
  detail.push(`引いた枚数：${p.picks.length}回 / 最終スコア：${p.finalScore}`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
};

const analyzeEmotionMatch = (
  p: Extract<AnswerPayload, { kind: 'emotion_match' }>
): PersonalAnalysis => {
  const ratio = p.correct / Math.max(p.total, 1);
  let headline = '';
  const detail: string[] = [];
  if (ratio >= 0.75) {
    headline = '相手の気持ちに気付ける感受性';
    detail.push('表情から感情を読み取れる力があります。チームで頼られる強み。');
  } else if (ratio >= 0.5) {
    headline = '人の気持ちを大事にできるタイプ';
    detail.push('感情を観察しようとする姿勢があります。');
  } else {
    headline = '自分軸をしっかり持てるタイプ';
    detail.push('感情よりも事実で動ける良さもあります。');
  }
  detail.push(`正答数：${p.correct}/${p.total}`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
};

const analyzeMoneySplit = (
  p: Extract<AnswerPayload, { kind: 'money_split' }>
): PersonalAnalysis => {
  const avg = p.selfShares.length
    ? p.selfShares.reduce((a, b) => a + b, 0) / p.selfShares.length
    : 0;
  let headline = '';
  const detail: string[] = [];
  if (avg < 4) {
    headline = '相手のことを考えて配分できる利他タイプ';
    detail.push('チームの空気をやわらかくする存在になれます。');
  } else if (avg <= 6) {
    headline = '公平さを大事にするバランスタイプ';
    detail.push('「フェアに」が自然にできるタイプ。');
  } else {
    headline = '自分の取り分をしっかり主張できるタイプ';
    detail.push('決断力があり、自分軸を持っています。');
  }
  detail.push(`平均的に自分の取り分：${avg.toFixed(1)} / 10コイン`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
};

const analyzeStopSignal = (
  p: Extract<AnswerPayload, { kind: 'stop_signal' }>
): PersonalAnalysis => {
  let headline = '';
  const detail: string[] = [];
  if (p.commission <= 2) {
    headline = '誘惑を抑えられる自己制御タイプ';
    detail.push('「止めるべき時に止まる」が自然にできています。');
  } else if (p.commission <= 5) {
    headline = '反応の速さと我慢のバランス型';
    detail.push('スピードと正確さの両立ができています。');
  } else {
    headline = '直感で動ける反応の早いタイプ';
    detail.push('スピード感のある場面で活きます。');
  }
  if (p.rtMs > 0) {
    detail.push(`平均反応時間：${Math.round(p.rtMs)}ms`);
  }
  detail.push(`誤反応：${p.commission}回 / 見逃し：${p.omission}回`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
};

const analyzePatternMatch = (
  p: Extract<AnswerPayload, { kind: 'pattern_match' }>
): PersonalAnalysis => {
  const ratio = p.correct / Math.max(p.total, 1);
  let headline = '';
  const detail: string[] = [];
  if (ratio >= 0.75) {
    headline = 'ルールを見抜くのが得意なタイプ';
    detail.push('規則性を見つけて使う力。学習や戦略立案に活きます。');
  } else if (ratio >= 0.5) {
    headline = 'コツコツ気付いていけるタイプ';
    detail.push('時間をかけて理解を深められる強みがあります。');
  } else {
    headline = '自由な発想ができるタイプ';
    detail.push('決まったパターンに縛られない柔軟さがあります。');
  }
  detail.push(`正答数：${p.correct}/${p.total}`);

  const top = topNTypes(scoreAnswer(p), 2);
  return { headline, detail, topTraits: top, encourage: ENCOURAGE_DEFAULT };
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

export const traitLabel = (t: SeedType): string => TRAIT_LABEL[t];

// ゲーム名の表示用ラベル
export const GAME_LABELS: Record<GameId, string> = {
  balloon: 'Balloon Risk（風船）',
  digit_span: 'Digit Span（数字記憶）',
  card_decks: 'Card Decks（カード山）',
  emotion_match: 'Emotion Match（感情）',
  money_split: 'Money Split（コイン分配）',
  stop_signal: 'Stop Signal（信号反応）',
  pattern_match: 'Pattern Match（パターン）',
};

// ゲームの「測るもの」一言説明（プレイ後の理解促進用）
export const GAME_PURPOSE: Record<GameId, string> = {
  balloon: 'リスクをどう取るか・どこで止めるか',
  digit_span: '短い時間でどれだけ覚えていられるか',
  card_decks: '試しながら良い選択を見つける学び方',
  emotion_match: '人の気持ちにどれだけ気づけるか',
  money_split: '自分と他人をどう扱うか',
  stop_signal: 'やめるべき時に止まれるか',
  pattern_match: 'ルールやパターンを見つけられるか',
};
