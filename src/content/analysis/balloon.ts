import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

// BART（Balloon Analogue Risk Task）の標準指標：
// - adjusted avg pumps: 「割れなかった」風船での平均ふくらまし数 = 本人が狙った止め時
// - pop rate: 割れた割合 = リスクの読みの精度
// - total banked: 結果獲得量
export const analyzeBalloon = (
  p: Extract<AnswerPayload, { kind: 'balloon' }>
): PersonalAnalysis => {
  const trials = p.pumps.length;
  const popped = p.popped.filter(Boolean).length;
  const banked = p.banked.reduce((a, b) => a + b, 0);
  const popRate = trials > 0 ? popped / trials : 0;
  // BART標準：割れていない試行のみで平均（割れた風船は強制終了なので意図を反映しない）
  const nonPoppedPumps = p.pumps.filter((_, i) => !p.popped[i]);
  const adjAvg = nonPoppedPumps.length
    ? nonPoppedPumps.reduce((a, b) => a + b, 0) / nonPoppedPumps.length
    : 0;
  const rawAvg = trials > 0 ? p.pumps.reduce((a, b) => a + b, 0) / trials : 0;

  type Band = 'insufficient' | 'cautious' | 'balanced' | 'bold' | 'reckless';
  let band: Band;
  if (trials < 5) {
    band = 'insufficient';
  } else if (popRate >= 0.55 && adjAvg >= 7) {
    // 多めに膨らましがちで割れも多い → 計算より勢い
    band = 'reckless';
  } else if (adjAvg < 4) {
    band = 'cautious';
  } else if (adjAvg < 9) {
    band = 'balanced';
  } else {
    band = 'bold';
  }

  const headline =
    band === 'insufficient'
      ? '今回はサンプル少なめ：判断スタイルを見るには試行が足りません'
      : band === 'cautious'
        ? '見極めて、確実に積み上げるタイプ'
        : band === 'balanced'
          ? '攻めと守りを切り替えられるタイプ'
          : band === 'bold'
            ? '思い切り良く挑戦できるタイプ'
            : '勢いで踏み込める、経験から学べるタイプ';

  const summary =
    band === 'insufficient'
      ? `今回プレイした風船は${trials}個。判断の傾向を見るには5個以上は試したいところ。次回は思い切ってもっと試してみよう。`
      : band === 'cautious'
        ? 'あなたは不確実な状況で「失敗を避けて確実に成果を出す」傾向が見えました。リスク許容度はやや控えめで、リスク管理が必要な場面で価値を発揮します。海外大手企業の採用検査でも、この傾向は「慎重さ」「品質志向」のサインとして評価されています。'
        : band === 'balanced'
          ? `あなたは状況に応じて踏み込み方を変えられる柔軟性があります。リスク許容度は中程度（平均${adjAvg.toFixed(1)}回まで膨らます判断）で、「攻めるべき時は攻め、引くべき時は引ける」バランス型。多くのチームで安定して機能する特性です。`
          : band === 'bold'
            ? `あなたは「不確実な状況でも一歩踏み出せる」傾向が強く出ました（平均${adjAvg.toFixed(1)}回まで挑戦）。割れ率も${Math.round(popRate * 100)}%と相応に抑えられており、計算された挑戦ができるタイプ。新しいことを切り拓く役割で力を発揮します。`
            : `あなたは思い切り良くポンプを押し込めるタイプ。ただし${trials}個中${popped}個が割れている（${Math.round(popRate * 100)}%）ので、今回は勢い先行で「いつ止めるか」の見極めが課題として見えました。挑戦する力は十分。あとは引き際を覚えると一気に成果が出ます。`;

  const strengths: string[] =
    band === 'insufficient'
      ? ['—']
      : band === 'cautious'
        ? ['小さく始めて確実に積み上げる', '失敗の可能性を事前に見抜ける', '焦らず判断できる']
        : band === 'balanced'
          ? ['場面に応じて行動を切り替えられる', '極端に走らないバランス感覚', 'チームの安定役になれる']
          : band === 'bold'
            ? ['新しい状況に飛び込める', 'チャンスを大きく掴みに行ける', '周りが躊躇する局面で動ける']
            : ['行動量が多い', '失敗を恐れない', '勢いで突破できる場面がある'];

  const realLife: string[] =
    band === 'insufficient'
      ? ['—']
      : band === 'cautious'
        ? ['テスト勉強は早めに準備する', '初めての店より行きつけを選びがち', '友達には少しずつ慣れていく']
        : band === 'balanced'
          ? ['新しいことも気になれば試す', 'ノリで動くこともあれば慎重なときもある', '行動量は相手や状況で変わる']
          : band === 'bold'
            ? ['気になったらまず試す', '新作・新メニューを真っ先に選ぶ', '初対面でも自分から話しかけられる']
            : ['後先考えず突撃しがち', '何回か失敗しても次に行ける', '同じ失敗を繰り返すこともある'];

  const workStyles: string[] =
    band === 'insufficient'
      ? ['—']
      : band === 'cautious'
        ? ['ミスが許されない正確性重視の業務', '長期的に積み上げる仕事', 'リスク管理・品質保証']
        : band === 'balanced'
          ? ['複数案件のバランス調整', 'リーダー補佐・コーディネーター', '安定運用＋改善の両立']
          : band === 'bold'
            ? ['新規事業・スタートアップ', '営業・企画・マーケティング', '変化の早い業界（IT・エンタメ）']
            : ['挑戦量が成果に直結する営業', 'eスポーツ・スポーツ選手', 'クリエイター（量を打つ）'];

  const careers: string[] =
    band === 'insufficient'
      ? ['—']
      : band === 'cautious'
        ? ['経理・会計', '医療・介護', '品質管理', 'インフラ運用', '研究・開発']
        : band === 'balanced'
          ? ['プロジェクトマネージャー', '人事・総務', '教育', 'サービス業', 'コンサルタント']
          : band === 'bold'
            ? ['営業・事業開発', 'プロデューサー', '起業', 'クリエイター', 'スポーツ選手・eスポーツ']
            : ['営業（量で勝負）', 'プロゲーマー', '起業家', '配信者・YouTuber', 'アスリート'];

  const develop: string[] =
    band === 'insufficient'
      ? ['次回は時間いっぱい挑戦してみる', '判断を試す回数を増やすと自分の傾向が見えてくる']
      : band === 'cautious'
        ? [
            '小さなチャレンジを意識的に1つ増やしてみる',
            '「失敗してもいい場面」と「絶対外せない場面」を分けて考える',
            '挑戦した日を記録して、振り返ると自信になる',
          ]
        : band === 'balanced'
          ? [
              'なぜその時に攻めたか／引いたかを言語化する',
              'チームに「攻める人」「引く人」がいる時、自分はどちら寄りで動くか決める',
              '小さな決断を素早く下す練習',
            ]
          : band === 'bold'
            ? [
                '挑戦の前に「失敗時のリカバリー」も決めておく',
                '止め時を決めるチェックポイント（時間・回数）を作る',
                '振り返りで「何が良かった／悪かった」を分ける',
              ]
            : [
                '「あと1回」を我慢して止める練習',
                '前の風船が割れたら次は2回少なめにしてみる',
                '挑戦と無謀の差を意識する：根拠ある一歩か、勢いだけか',
              ];

  const metrics = [
    { label: '挑戦回数', value: `${trials}回` },
    { label: '止めた時の平均', value: trials > 0 ? `${adjAvg.toFixed(1)}回` : '—' },
    { label: '全試行の平均', value: trials > 0 ? `${rawAvg.toFixed(1)}回` : '—' },
    { label: '割れ率', value: trials > 0 ? `${Math.round(popRate * 100)}%` : '—' },
    { label: '総獲得', value: `${banked}pt` },
  ];

  return {
    gameLabel: '風船リスク課題',
    origin: '世界の大手金融・人材プラットフォーム・日用品メーカーなどの採用で実際に用いられている、行動経済学の Balloon Analogue Risk Task (BART) をもとにしています。',
    trait: 'リスク許容度（リスクをどこまで取れるか）',
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
