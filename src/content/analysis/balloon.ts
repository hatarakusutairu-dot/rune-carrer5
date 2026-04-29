import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeBalloon = (
  p: Extract<AnswerPayload, { kind: 'balloon' }>
): PersonalAnalysis => {
  const avg = p.pumps.length ? p.pumps.reduce((a, b) => a + b, 0) / p.pumps.length : 0;
  const popped = p.popped.filter(Boolean).length;
  const banked = p.banked.reduce((a, b) => a + b, 0);
  const trials = p.pumps.length;

  let band: 'low' | 'mid' | 'high';
  if (avg < 4) band = 'low';
  else if (avg < 8) band = 'mid';
  else band = 'high';

  const headline =
    band === 'low'
      ? '見極めて、確実に積み上げるタイプ'
      : band === 'mid'
        ? '攻めと守りを切り替えられるタイプ'
        : '思い切り良く挑戦できるタイプ';

  const summary =
    band === 'low'
      ? 'あなたは不確実な状況で「失敗を避けて確実に成果を出す」傾向が見えました。Pymetrics社の指標でいう Risk Tolerance（リスク許容度）はやや控えめ。リスク管理が必要な場面で価値を発揮します。'
      : band === 'mid'
        ? 'あなたは状況に応じて踏み込み方を変えられる柔軟性があります。Risk Tolerance は中程度で、「攻めるべき時は攻め、引くべき時は引ける」バランス型。多くのチームで安定して機能する特性です。'
        : 'あなたは「不確実な状況でも一歩踏み出せる」傾向が強く出ました。Risk Tolerance は高めで、計算された挑戦ができるタイプ。新しいことを切り拓く役割で力を発揮します。';

  const strengths: string[] =
    band === 'low'
      ? [
          '小さく始めて確実に積み上げる',
          '失敗の可能性を事前に見抜ける',
          '焦らず判断できる',
        ]
      : band === 'mid'
        ? [
          '場面に応じて行動を切り替えられる',
          '極端に走らないバランス感覚',
          'チームの安定役になれる',
        ]
        : [
          '新しい状況に飛び込める',
          'チャンスを大きく掴みに行ける',
          '周りが躊躇する局面で動ける',
        ];

  const realLife: string[] =
    band === 'low'
      ? ['テスト勉強は早めに準備する', '初めての店より行きつけを選びがち', '友達には少しずつ慣れていく']
      : band === 'mid'
        ? ['新しいことも気になれば試す', 'ノリで動くこともあれば慎重なときもある', '行動量は相手や状況で変わる']
        : ['気になったらまず試す', '新作・新メニューを真っ先に選ぶ', '初対面でも自分から話しかけられる'];

  const workStyles: string[] =
    band === 'low'
      ? ['ミスが許されない正確性重視の業務', '長期的に積み上げる仕事', 'リスク管理・品質保証']
      : band === 'mid'
        ? ['複数案件のバランス調整', 'リーダー補佐・コーディネーター', '安定運用＋改善の両立']
        : ['新規事業・スタートアップ', '営業・企画・マーケティング', '変化の早い業界（IT・エンタメ）'];

  const careers: string[] =
    band === 'low'
      ? ['経理・会計', '医療・介護', '品質管理', 'インフラ運用', '研究・開発']
      : band === 'mid'
        ? ['プロジェクトマネージャー', '人事・総務', '教育', 'サービス業', 'コンサルタント']
        : ['営業・事業開発', 'プロデューサー', '起業', 'クリエイター', 'スポーツ選手・eスポーツ'];

  const develop: string[] =
    band === 'low'
      ? [
          '小さなチャレンジを意識的に1つ増やしてみる',
          '「失敗してもいい場面」と「絶対外せない場面」を分けて考える',
          '挑戦した日を記録して、振り返ると自信になる',
        ]
      : band === 'mid'
        ? [
          'なぜその時に攻めたか／引いたかを言語化する',
          'チームに「攻める人」「引く人」がいる時、自分はどちら寄りで動くか決める',
          '小さな決断を素早く下す練習',
        ]
        : [
          '挑戦の前に「失敗時のリカバリー」も決めておく',
          '止め時を決めるチェックポイント（時間・回数）を作る',
          '振り返りで「何が良かった／悪かった」を分ける',
        ];

  const metrics = [
    { label: '挑戦回数', value: `${trials}回` },
    { label: '平均ふくらまし', value: `${avg.toFixed(1)}回` },
    { label: '割れた回数', value: `${popped}回` },
    { label: '総獲得', value: `${banked}pt` },
  ];

  return {
    gameLabel: 'Balloon Risk（風船リスク課題）',
    origin: 'Pymetrics「Balloon Analogue Risk Task（BART）」を元にした、JPMorgan・LinkedIn・Unileverなどの採用に使われる認知科学アセスメント',
    trait: 'Risk Tolerance（リスク許容度）',
    headline,
    summary,
    strengths,
    realLife,
    workStyles,
    careers,
    develop,
    topTraits: topNTypes(scoreAnswer(p), 2),
    encourage: ENCOURAGE_DEFAULT,
    metrics,
  };
};
