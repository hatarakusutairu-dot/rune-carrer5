import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_LOW_SCORE } from './_common';

export const analyzePatternMatch = (
  p: Extract<AnswerPayload, { kind: 'pattern_match' }>
): PersonalAnalysis => {
  const ratio = p.correct / Math.max(p.total, 1);
  const high = ratio >= 0.75;
  const mid = ratio >= 0.5;

  const headline = high
    ? 'ルールを見抜くのが得意なタイプ'
    : mid
      ? 'コツコツ気付いていけるタイプ'
      : '自由な発想ができるタイプ';

  const summary = high
    ? 'あなたは「規則性を見抜く力（パターン認識）」と「具体例から法則を導く力（帰納的推論）」が高い水準。海外の大手会計・コンサル系企業の採用検査で測定される指標で、未知の問題から法則を見抜き、戦略を立てる場面で力を発揮します。'
    : mid
      ? 'あなたはパターン推論を着実に使えるタイプ。中程度の水準で、時間をかけて理解を深める学習スタイルが向きます。教育や継続的な専門性が求められる仕事に向きます。'
      : 'パターン推論の点数自体は控えめでしたが、これは「型にはまらず自由に発想できる」強みの裏返し。創造性や意外な発想で価値を生む方向性があります。';

  const strengths = high
    ? ['少ない情報からルールを読み取る', '抽象化が得意', '戦略的に考えられる']
    : mid
      ? ['時間をかければ理解できる', '繰り返しで定着する', '具体例から学ぶのが得意']
      : ['既存のパターンに縛られない', '型破りなアイデアが出せる', '感性で動ける'];

  const realLife = high
    ? ['ゲームで攻略法をすぐ見つける', 'ボードゲームに強い', '数列パズルが楽しい']
    : mid
      ? ['例題があると解ける', '何回かやれば慣れる', '友達の解説で納得する']
      : ['答えが決まっている問題は退屈', '創作・アートに惹かれる', '「なぜ？」を問い続ける'];

  const workStyles = high
    ? ['戦略・分析', 'コンサルティング', 'プログラミング']
    : mid
      ? ['業務改善', 'オペレーション', '教育']
      : ['アート・クリエイティブ', 'マーケティング・企画', '研究（仮説生成）'];

  const careers = high
    ? ['コンサルタント', '戦略アナリスト', 'プログラマー', '研究者', 'プロデューサー']
    : mid
      ? ['業務改善担当', 'プロジェクトリーダー', '保健・医療', '教員', '事務管理']
      : ['アーティスト', 'クリエイティブディレクター', '芸人', '映像作家', 'マーケター'];

  const develop = high
    ? ['見つけたルールを他の領域でも試す', '抽象化したものを具体化して説明する練習']
    : mid
      ? ['解いた問題のルールを言葉にする', '解説をすぐ見ずに5分考える']
      : ['「これってどういうルールかな」と意識して見る', '法則を探すゲームを楽しむ', '答え合わせで丁寧に納得する'];

  return {
    gameLabel: 'パターン推論課題',
    origin: '海外の大手会計・コンサル系企業などが採用検査に取り入れている認知能力テストで、応用力を測る代表的な課題です。',
    trait: 'パターン認識（規則性を見つける力）',
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
