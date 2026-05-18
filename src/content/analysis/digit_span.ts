import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_LOW_SCORE } from './_common';

export const analyzeDigitSpan = (
  p: Extract<AnswerPayload, { kind: 'digit_span' }>
): PersonalAnalysis => {
  const ratio = p.correct / Math.max(p.total, 1);
  // 桁数と正答率の両方を見る（4桁=スタート時点なので maxLen 単独では区別できないため）
  const high = p.maxLen >= 6 && ratio >= 0.5;
  const mid = p.maxLen >= 5 || (p.maxLen >= 4 && ratio >= 0.5);

  const headline = high
    ? '長い情報を一気に保持できる集中タイプ'
    : mid
      ? '必要な情報を整理しながら覚えるタイプ'
      : 'プレッシャー下でも自分のペースを守れるタイプ';

  const summary = high
    ? 'あなたは「作業記憶（短い時間に情報を保持して扱う力）」を高い水準で発揮できる傾向が見えました。世界大手の通信会社やホテルチェーンの採用検査でも測定されている指標で、複雑な指示を一度で受け取り正確に処理する場面で力を発揮します。'
    : mid
      ? 'あなたは作業記憶を着実に使えるタイプ。情報量が多い場面でも、要点を整理して覚えていける特性が見えました。教育、医療、IT領域でよく評価される指標です。'
      : '数字記憶は、その日のコンディションや得意・不得意がはっきり出る課題です。今回は緊張やリズムが合わなかった可能性も。記憶以外の力（例：人とのつながり、創造性、粘り強さ）に強みがあるタイプかもしれません。';

  const strengths = high
    ? ['複雑な指示を一度で覚えられる', 'マルチタスクでも要点を保てる', '正確性が求められる場面に強い']
    : mid
      ? ['メモを取りながら整理できる', '段取りを組んで動ける', '集中時間を確保すれば確実']
      : ['人と話す中で覚える方が向く', '数字より関係性や物語で記憶する', '自分の得意な覚え方を持っている'];

  const realLife = high
    ? ['電話番号や暗証番号を一度で覚える', '長い説明の要点を後で再現できる', '麻雀や将棋など記憶系ゲームに強い']
    : mid
      ? ['メモを取りながら聞くと覚えやすい', '画像や図解で覚えるのが得意', '繰り返すと定着する']
      : ['人の名前と顔は得意', 'エピソードと一緒に覚える', '自分なりの語呂合わせを使う'];

  const workStyles = high
    ? ['プログラミング・データ分析', '法務・医療・経理など正確性が必要な職種', '通訳・同時翻訳']
    : mid
      ? ['教育・指導', '事務・庶務', 'カスタマーサポート']
      : ['企画・クリエイティブ', '営業・接客', '対人支援・ケア'];

  const careers = high
    ? ['エンジニア', 'データサイエンティスト', '医師・薬剤師', '会計士', '翻訳家']
    : mid
      ? ['公務員', '教員', '事務職', 'プロジェクト調整役', '看護師']
      : ['営業', 'カウンセラー', 'デザイナー', '企画', '保育・福祉'];

  const develop = high
    ? ['覚えた情報を「なぜそうなるか」と紐づけて深く理解する', '記憶を活かして人に教える側に回る']
    : mid
      ? ['チャンクで覚える練習（電話番号を3-4-4で区切るなど）', '寝る前に要点を3つ書き出す習慣']
      : ['視覚化・物語化で覚える方法を試す', '苦手にしないで「自分の得意な覚え方」を選ぶ', '焦らず1回多く繰り返す'];

  return {
    gameLabel: '数字記憶課題',
    origin: '世界の大手通信・ホテルチェーンなどが採用検査に取り入れている認知能力テストの一つで、臨床心理学の標準的な評価でも使われる指標です。',
    trait: '作業記憶（短時間に情報を保持して使う力）',
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
      { label: '到達桁数', value: `${p.maxLen}桁` },
      { label: '正答率', value: `${Math.round(ratio * 100)}%` },
    ],
  };
};
