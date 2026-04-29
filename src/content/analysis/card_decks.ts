import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeCardDecks = (
  p: Extract<AnswerPayload, { kind: 'card_decks' }>
): PersonalAnalysis => {
  const score = p.finalScore;
  const high = score > 30;
  const mid = score > 0;

  const headline = high
    ? '試しながら学んで切り替えられるタイプ'
    : mid
      ? '冷静に観察しながら選ぶタイプ'
      : '挑戦と分析を行ったり来たりするタイプ';

  const summary = high
    ? 'あなたは試行錯誤の中で「成功パターン」を見抜き、行動を切り替えていける Decision Learning（意思決定学習）型。Pymetrics の Iowa Gambling Task 系課題で高評価される傾向で、変化の多い環境で力を発揮します。'
    : mid
      ? 'あなたは情報を集めながら慎重に選択する分析型。Decision Learning は「リスクを抑えながら徐々に最適化」する方向で機能しています。安全を確保しつつ着実に成果を出す職務に向きます。'
      : 'あなたは「試しながら学ぶ最中」の状態。Decision Learning 課題は気付きの遅れがそのまま結果に出るため、今日は学習中。ただし、決まった答えに縛られない柔軟さは強みになります。';

  const strengths = high
    ? ['経験から学んで戦略を更新できる', '損切りの判断ができる', 'パターンの違いを見抜ける']
    : mid
      ? ['リスクを取りすぎずに進められる', '記録や記憶を活かせる', '安定運用が得意']
      : ['先入観なく選べる', '試すこと自体を楽しめる', '失敗を経験値に変えていける'];

  const realLife = high
    ? ['ゲームの新キャラを試して最強構成を見つける', 'コスパの良い店を覚えていく', '無駄な投資を避けられる']
    : mid
      ? ['いつも同じ確実な選択をする', 'リスクの大きい賭けはしない', 'メニューは決まったものを選ぶ']
      : ['その日の気分で選ぶ', '結果より過程を楽しむ', '同じ失敗もすぐ気にしない'];

  const workStyles = high
    ? ['データドリブンな意思決定', 'マーケティング・広告運用', '投資・トレーディング']
    : mid
      ? ['品質管理・業務改善', '財務・経理', 'システム運用']
      : ['クリエイティブ・芸術系', '研究・実験', '体験設計（UX）'];

  const careers = high
    ? ['プロダクトマネージャー', 'データアナリスト', 'コンサルタント', '投資家', 'eスポーツコーチ']
    : mid
      ? ['監査', '保守・運用', '会計', '医療従事者', '法務']
      : ['アーティスト', '研究者', '映像クリエイター', '実験的事業', '企画'];

  const develop = high
    ? ['なぜそのデッキ（選択肢）を選んだかを言語化する', '勝ちパターンが他の場面でも通用するか試す']
    : mid
      ? ['たまに「いつもと違う選択」を意識的にしてみる', '選んだ理由を3つ書き出す']
      : [
          '結果を3回ごとに振り返る習慣をつける',
          '「同じ選択を続けたらどうなるか」を予想してみる',
          '当たり外れを記録すると気付きが早くなる',
        ];

  return {
    gameLabel: 'Card Decks（意思決定課題）',
    origin: 'Pymetrics 系の Iowa Gambling Task。神経科学・行動経済学で「意思決定学習」を測る代表的な課題',
    trait: 'Decision Learning（意思決定学習）',
    headline,
    summary,
    strengths,
    realLife,
    workStyles,
    careers,
    develop,
    topTraits: topNTypes(scoreAnswer(p), 2),
    encourage: ENCOURAGE_DEFAULT,
    metrics: [
      { label: '引いた回数', value: `${p.picks.length}回` },
      { label: '最終スコア', value: `${score}` },
    ],
  };
};
