import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeTowers = (
  p: Extract<AnswerPayload, { kind: 'towers' }>
): PersonalAnalysis => {
  const efficiency = p.totalMoves > 0 ? p.optimalMoves / p.totalMoves : 0;
  const high = p.puzzlesSolved >= 3 && efficiency >= 0.7;
  const mid = p.puzzlesSolved >= 2;

  const headline = high
    ? '段取りよく先を読めるタイプ'
    : mid
      ? '試しながら最短経路に近づけるタイプ'
      : '手探りで挑戦できるタイプ';

  const summary = high
    ? 'あなたは「動く前に手順を組み立てる」計画力が高い水準。海外大手の採用検査でも測定される指標で、複雑な業務を段取りよくこなす場面で力を発揮します。'
    : mid
      ? 'あなたは「やってみて修正する」適応型の計画スタイル。経験から学んで効率的に進められるタイプです。'
      : 'パズル課題は得意・不得意がはっきり出る課題です。手探りで動ける積極性は、別の場面で強みになります。';

  const strengths = high
    ? ['先回りして手順を考えられる', 'ムダのない動き方ができる', '複雑なものを整理して進められる']
    : mid
      ? ['やりながら学習できる', '行き詰まっても切り替えられる', '少しずつ最適化していける']
      : ['迷っても止まらない', '失敗を経験値にできる', 'シンプルな解法を選べる'];

  const realLife = high
    ? ['旅行の予定を緻密に組む', 'ゲームのルートを最短で考える', '宿題を効率順で片付ける']
    : mid
      ? ['とりあえず始めてから改善する', 'やってみないと分からないと考える', '臨機応変に動ける']
      : ['難しい問題は飛ばす派', '人に聞いてから動く', '直感で選ぶことが多い'];

  const workStyles = high
    ? ['プロジェクトマネジメント', 'システム設計', '製造現場の改善']
    : mid
      ? ['営業・接客', '改善活動', 'チームのサブリーダー']
      : ['クリエイティブ・実験的業務', 'スピード重視の現場', '個人作業'];

  const careers = high
    ? ['プロジェクトマネージャー', 'エンジニア', 'コンサルタント', '建築設計', '研究者']
    : mid
      ? ['営業', '事務', 'サービス業', '看護師', '生産管理']
      : ['アーティスト', 'クリエイター', 'ライター', '芸人', 'スポーツ選手'];

  const develop = high
    ? ['人にも自分の手順を伝える練習', '複数案のメリット比較を習慣化']
    : mid
      ? ['動く前に「3手先」を考えてみる', '解いた後に「最短は何手？」を振り返る']
      : ['難しいときは紙に書き出してみる', '小さく分解する練習', '「途中で違う」と気付いたら戻る勇気'];

  return {
    gameLabel: '塔の移動（計画力）課題',
    origin: '海外の認知科学アセスメントで「計画力（プランニング）」を測る代表課題で、ハノイの塔の派生形です。',
    trait: 'プランニング（先を読んで段取りする力）',
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
      { label: '解いた数', value: `${p.puzzlesSolved}/5` },
      { label: '手数', value: `${p.totalMoves}` },
      { label: '効率', value: p.totalMoves > 0 ? `${Math.round(efficiency * 100)}%` : '—' },
    ],
  };
};
