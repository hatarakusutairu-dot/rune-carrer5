import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeWasabiWaiter = (
  p: Extract<AnswerPayload, { kind: 'wasabi_waiter' }>
): PersonalAnalysis => {
  const accuracy = p.served > 0 ? p.correctOrders / p.served : 0;
  // 対応率：席に座った客のうち何割を捌けたか
  const totalDemand = p.served + p.missed;
  const handleRate = totalDemand > 0 ? p.served / totalDemand : 0;

  type Band = 'insufficient' | 'low' | 'mid' | 'high';
  let band: Band;
  if (totalDemand < 5) {
    band = 'insufficient';
  } else if (p.served >= 12 && accuracy >= 0.8 && handleRate >= 0.5) {
    band = 'high';
  } else if (
    (p.served >= 6 && accuracy >= 0.6 && handleRate >= 0.3) ||
    (p.served >= 4 && accuracy >= 0.8 && handleRate >= 0.4)
  ) {
    band = 'mid';
  } else {
    band = 'low';
  }

  const headline =
    band === 'insufficient'
      ? '今回はサンプル少なめ：来店もほとんどなく傾向が読めません'
      : band === 'high'
        ? '複数のことを同時に捌ける接客タイプ'
        : band === 'mid'
          ? '丁寧に1つずつ対応するタイプ'
          : '対応に絞る・自分のペース重視タイプ';

  const summary =
    band === 'insufficient'
      ? `今回は来店${totalDemand}件のみで傾向の判定が難しい状況。次回はもう少しテンポよく挑戦してみよう。`
      : band === 'high'
        ? `あなたは複数のお客さんを同時にさばきながら正確に注文を出せる、対人マルチタスクが強いタイプ（提供${p.served}・正答率${Math.round(accuracy * 100)}%・対応率${Math.round(handleRate * 100)}%）。海外の採用検査でも測定される指標で、接客・サービス・チームリーダーなど人と関わる仕事で力を発揮します。`
        : band === 'mid'
          ? `あなたは「焦らず、確実に1人ずつ対応する」タイプ（提供${p.served}・正答率${Math.round(accuracy * 100)}%・対応率${Math.round(handleRate * 100)}%）。マルチタスクは控えめでも、丁寧さで信頼を積み重ねる強みがあります。`
          : `今回は対応した${p.served}件に対して取りこぼし${p.missed}件（対応率${Math.round(handleRate * 100)}%）。「一度に多くを抱えるより目の前の対応に集中する」タイプの動きが出ました。じっくり関わる場面や、一対一の対話が活きる場面では強みになります。`;

  const strengths =
    band === 'insufficient'
      ? ['—']
      : band === 'high'
        ? ['複数の状況を同時に把握できる', '優先順位を素早くつけられる', '正確さとスピードを両立できる']
        : band === 'mid'
          ? ['ひとつひとつ丁寧に対応できる', '正確さで信頼を得られる', '焦らず動ける']
          : ['相手のペースに合わせられる', 'プレッシャー下でも自分軸を保てる', 'じっくり関わるタイプ'];

  const realLife =
    band === 'insufficient'
      ? ['—']
      : band === 'high'
        ? ['部活でリーダー役を任されがち', '友達からの相談を同時に複数こなせる', 'イベント運営で重宝される']
        : band === 'mid'
          ? ['頼まれごとは一個ずつ確実にこなす', '友達からの相談はじっくり聞く派', '混乱を避けたい']
          : ['人混みは苦手', '少人数のほうが力を発揮できる', '一対一の対話が得意'];

  const workStyles =
    band === 'insufficient'
      ? ['—']
      : band === 'high'
        ? ['接客・サービス業', '営業', 'プロジェクトマネジメント']
        : band === 'mid'
          ? ['事務・庶務', '医療・介護', 'カスタマーサポート']
          : ['カウンセリング', '研究', 'クリエイティブ'];

  const careers =
    band === 'insufficient'
      ? ['—']
      : band === 'high'
        ? ['店長・マネージャー', '看護師リーダー', 'CA', '営業職', 'イベント運営']
        : band === 'mid'
          ? ['事務職', '保育士', '銀行', '介護士', '受付']
          : ['カウンセラー', 'デザイナー', '研究員', 'エンジニア', '作家'];

  const develop =
    band === 'insufficient'
      ? ['次回は時間いっぱい動いてみる', '来店数が少ないとマルチタスク傾向は見えにくい']
      : band === 'high'
        ? ['オーバーワークにならないよう自分の限界を意識', 'チームで分担する練習']
        : band === 'mid'
          ? ['同時2件は意識的にやってみる', '優先順位の言語化']
          : ['対応中の作業を分割して見える化', '自分のテンポを大事にしながら少しずつ広げる'];

  return {
    gameLabel: '食堂タイム（マルチタスク）課題',
    origin: '海外採用検査で「対人サービス×マルチタスク」を測る代表課題（接客シミュレーション）。',
    trait: 'マルチタスク・対人サービス',
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
      { label: '提供数', value: `${p.served}` },
      { label: '注文一致', value: `${p.correctOrders}` },
      { label: '取りこぼし', value: `${p.missed}` },
      { label: '正答率', value: p.served > 0 ? `${Math.round(accuracy * 100)}%` : '—' },
      { label: '対応率', value: totalDemand > 0 ? `${Math.round(handleRate * 100)}%` : '—' },
    ],
  };
};
