import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeStopSignal = (
  p: Extract<AnswerPayload, { kind: 'stop_signal' }>
): PersonalAnalysis => {
  const high = p.commission <= 2;
  const mid = p.commission <= 5;

  const headline = high
    ? '誘惑を抑えられる自己制御タイプ'
    : mid
      ? '反応の速さと我慢のバランス型'
      : '直感で動ける反応の早いタイプ';

  const summary = high
    ? 'あなたは Inhibitory Control（反応抑制）が高い水準。HireVue Games と Pymetrics の Stop Signal 課題で測定される認知制御の指標で、「やめるべき時に止まれる」自己制御の強さを示します。安全管理や精密作業で力を発揮します。'
    : mid
      ? 'あなたは反応抑制と反応速度のバランスが取れているタイプ。Inhibitory Control は標準的で、スピードと正確性を場面に応じて調整できます。'
      : 'あなたは Reaction Speed（反応速度）が前面に出るタイプ。Inhibitory Control は控えめでも、瞬発的な判断が求められる場面では強みになります。eスポーツ・スポーツ・接客などで力を発揮します。';

  const strengths = high
    ? ['誘惑に流されない', '長時間の集中を保てる', '危険を避ける感度が高い']
    : mid
      ? ['状況に応じてスピードを変えられる', '焦らず正確に動ける', '反応も判断もどちらもいける']
      : ['瞬発力がある', '考え込まずに動ける', '機敏な対応ができる'];

  const realLife = high
    ? ['ダイエット中の間食を我慢できる', '不要な買い物をしない', 'スマホ依存になりにくい']
    : mid
      ? ['気分次第で集中力が変わる', '締め切りには間に合わせる', '時々ハマって時間を忘れる']
      : ['ノリで動くことが多い', '気になったらすぐ手が出る', 'スポーツ・ゲームの反応が速い'];

  const workStyles = high
    ? ['品質管理・安全管理', '医療・看護', '長距離運転・パイロット']
    : mid
      ? ['プロジェクト管理', '開発・設計', 'マネジメント']
      : ['eスポーツ・スポーツ', '接客・ホール', 'クリエイティブ・即興'];

  const careers = high
    ? ['看護師', 'パイロット', '品質管理', '研究員', '校正・編集']
    : mid
      ? ['プロジェクトマネージャー', 'エンジニア', '医療従事者', 'コンサルタント', '会計士']
      : ['eスポーツ選手', 'スポーツ選手', '俳優・芸人', 'バーテンダー', 'カメラマン'];

  const develop = high
    ? ['行動量を増やすために「考える前に動く時間」を意識的に作る', 'リスクを取る場面を1日1回作る']
    : mid
      ? ['「ここは速さ」「ここは正確さ」と切り替えのスイッチを言語化', '集中の出し入れの記録']
      : [
          'やる前に5秒考える習慣',
          '「やらない」を選ぶ練習',
          '感情で動かない仕組み（メモ・タイマー）を使う',
        ];

  return {
    gameLabel: 'Stop Signal（反応抑制課題）',
    origin: 'HireVue Games の Reaction & Inhibition 課題、Pymetrics の Stop Signal Task。神経心理学で標準的な認知制御テスト',
    trait: 'Inhibitory Control（反応抑制）',
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
      { label: '誤反応', value: `${p.commission}回` },
      { label: '見逃し', value: `${p.omission}回` },
      ...(p.rtMs > 0 ? [{ label: '平均反応時間', value: `${Math.round(p.rtMs)}ms` }] : []),
    ],
  };
};
