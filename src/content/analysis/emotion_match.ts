import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_LOW_SCORE } from './_common';

export const analyzeEmotionMatch = (
  p: Extract<AnswerPayload, { kind: 'emotion_match' }>
): PersonalAnalysis => {
  const ratio = p.correct / Math.max(p.total, 1);
  const high = ratio >= 0.75;
  const mid = ratio >= 0.5;

  const headline = high
    ? '相手の気持ちに気付ける感受性タイプ'
    : mid
      ? '人の気持ちを大事にできるタイプ'
      : '事実ベースで動ける自分軸タイプ';

  const summary = high
    ? 'あなたは「相手の感情に気づく力（感情認識）」が高水準。海外の採用検査でも評価される指標で、リーダー職・対人支援職・営業職で重視されます。チームの空気を読み、相手のサインに早く気付ける強みがあります。'
    : mid
      ? 'あなたは状況や関係性を踏まえて感情を読もうとする中庸タイプ。感情認識は標準的で、感情とロジックの両方を大事にできるバランス感覚があります。'
      : '感情認識の指標としては今回控えめでしたが、これは「感情に流されず事実で判断できる」強みの裏返しでもあります。技術職や研究職など客観性が求められる分野で力を発揮します。';

  const strengths = high
    ? ['空気の変化に早く気付く', '言葉にならない不調をキャッチ', 'チームの安全感をつくれる']
    : mid
      ? ['相手と事実の両方を見られる', '感情に振り回されすぎない', '冷静さを保てる']
      : ['事実とデータで判断できる', '感情に左右されず動ける', 'ロジック構築が得意'];

  const realLife = high
    ? ['友達の表情で何かあったとわかる', '初対面でも雰囲気で人柄を察する', '映画やドラマで人物の機微を読む']
    : mid
      ? ['気付くときと気付かないときがある', '言ってもらえれば理解できる', '近い人の感情はわかる']
      : ['事実を聞くと納得しやすい', '回りくどい言い方は苦手', '正論を大切にする'];

  const workStyles = high
    ? ['対人支援・接客', '人事・キャリアアドバイザー', 'チームリード']
    : mid
      ? ['教育・指導', 'カスタマーサクセス', '営業（関係性重視）']
      : ['エンジニア・研究', '法務・経理', 'セキュリティ・監査'];

  const careers = high
    ? ['カウンセラー', 'コーチ', '看護師', '心理士', 'マネージャー']
    : mid
      ? ['先生', '人事', '広報', 'CSR', '医療従事者']
      : ['エンジニア', '研究者', '会計士', 'システム監査', 'ファクトチェッカー'];

  const develop = high
    ? ['気付いた感情を「事実」に変換して伝える練習', '気を遣いすぎて疲れない自己ケア']
    : mid
      ? ['相手の表情を意識的に観察する時間を作る', '感情語彙を増やす（嬉しい→誇らしい、感謝、安心、など）']
      : [
          '相手の表情に注目する習慣をつける',
          '「事実だけでなく気持ちも聞く」を試す',
          '感情語の語彙集を眺めるだけでも気付きが増える',
        ];

  return {
    gameLabel: '表情から気持ちを読む課題',
    origin: '心理学の「6基本感情」研究をもとに、海外大手の採用検査でも導入されている対人感受性のテストです。',
    trait: '感情認識（相手の気持ちに気づく力）',
    headline,
    summary,
    strengths,
    realLife,
    workStyles,
    careers,
    develop,
    topTraits: topNTypes(scoreAnswer(p), 2),
    encourage: ENCOURAGE_LOW_SCORE,
    metrics: [
      { label: '正答数', value: `${p.correct}/${p.total}` },
      { label: '正答率', value: `${Math.round(ratio * 100)}%` },
    ],
  };
};
