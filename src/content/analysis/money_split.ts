import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeMoneySplit = (
  p: Extract<AnswerPayload, { kind: 'money_split' }>
): PersonalAnalysis => {
  const n = p.selfShares.length;
  const avg = n > 0 ? p.selfShares.reduce((a, b) => a + b, 0) / n : 0;
  // 標準偏差：相手の属性によって配分を大きく変えるか
  const variance =
    n > 0
      ? p.selfShares.reduce((acc, v) => acc + (v - avg) ** 2, 0) / n
      : 0;
  const stdev = Math.sqrt(variance);

  type Band = 'insufficient' | 'situational' | 'altruistic' | 'fair' | 'pragmatic';
  let band: Band;
  if (n < 5) {
    band = 'insufficient';
  } else if (stdev >= 2.2) {
    // 相手によって2以上の差をつけている → 関係性によって判断を変えるタイプ
    band = 'situational';
  } else if (avg < 4) {
    band = 'altruistic';
  } else if (avg <= 6) {
    band = 'fair';
  } else {
    band = 'pragmatic';
  }

  const headline =
    band === 'insufficient'
      ? '今回はサンプル少なめ：もう少し配分回数が欲しいところ'
      : band === 'altruistic'
        ? '相手のことを考えられる利他タイプ'
        : band === 'fair'
          ? '公平を大事にするバランスタイプ'
          : band === 'pragmatic'
            ? '自分の取り分も主張できる決断タイプ'
            : '相手によって柔軟に判断する関係性重視タイプ';

  const summary =
    band === 'insufficient'
      ? `今回は${n}回しか配分できなかったため、傾向の判定はまだ難しい状況。配分の好みは複数の相手で見ないと分からないので、次回はもっと回数を重ねよう。`
      : band === 'altruistic'
        ? `あなたは「相手のことを優先しがち」な利他傾向（平均自己取り分 ${avg.toFixed(1)}/10）。海外の採用検査でも測定される社会的選好の指標で、チーム志向の組織やケア・教育系の現場で高く評価されます。`
        : band === 'fair'
          ? `あなたは公平性志向が強い社会的選好（平均自己取り分 ${avg.toFixed(1)}/10）。「半々で分ける」反応が標準的なバランス型で、調整役・仲裁役として力を発揮します。`
          : band === 'pragmatic'
            ? `あなたは自己主張ができる決断型（平均自己取り分 ${avg.toFixed(1)}/10）。自分の取り分をしっかり主張する社会的選好は、競争的な環境で活躍する条件にもなります。リーダー職や交渉職での強みです。`
            : `あなたは相手との関係性で配分を大きく変えるタイプ（ばらつき±${stdev.toFixed(1)}）。親しい人・初対面・上下関係などで柔軟に判断を切り替える、関係性を読む力が強いタイプです。交渉や人間関係の調整役で力を発揮します。`;

  const strengths =
    band === 'insufficient'
      ? ['—']
      : band === 'altruistic'
        ? ['チームの雰囲気をやわらかくできる', '相手の立場を想像できる', '長期的な信頼関係を築ける']
        : band === 'fair'
          ? ['対立する意見を整理できる', '誰に対しても同じ基準で接する', '誤解を減らす伝え方ができる']
          : band === 'pragmatic'
            ? ['自分の主張を言葉にできる', '交渉ができる', '責任を引き受けられる']
            : ['相手によって対応を切り替えられる', '人間関係の文脈を読める', '誰とでも関わり方を作れる'];

  const realLife =
    band === 'insufficient'
      ? ['—']
      : band === 'altruistic'
        ? ['食べ物を分ける時、自分は少なめでも気にならない', '友達の悩みを優先してしまう', '誰かの誕生日を覚えている']
        : band === 'fair'
          ? ['じゃんけんで決めるのが好き', 'ルールを守る・守らせる', '損得をきっちり計算する']
          : band === 'pragmatic'
            ? ['ジャンケンに負けると悔しい', '貢献に見合う報酬を求める', '不公平には黙っていない']
            : ['親しい友達と他人で態度を変える', '相手の立場を見て話し方を変える', '上下関係を敏感に察する'];

  const workStyles =
    band === 'insufficient'
      ? ['—']
      : band === 'altruistic'
        ? ['チームでの長期プロジェクト', '教育・福祉・医療', 'コミュニティ運営']
        : band === 'fair'
          ? ['ファシリテーター・調整役', '法務・コンプライアンス', '監査']
          : band === 'pragmatic'
            ? ['営業・交渉職', 'リーダー職', '起業・経営']
            : ['営業・接客（関係性重視）', '広報・PR', '人事・コミュニティマネージャー'];

  const careers =
    band === 'insufficient'
      ? ['—']
      : band === 'altruistic'
        ? ['看護師・介護士', '教員', 'NPO・NGO', 'カウンセラー', '対人支援']
        : band === 'fair'
          ? ['仲裁人', '法務', '監査', '人事制度設計', 'コーチ']
          : band === 'pragmatic'
            ? ['経営者', '営業マネージャー', '弁護士', '投資家', '事業開発']
            : ['広報', 'PR', 'コミュニティマネージャー', '営業', '人事'];

  const develop =
    band === 'insufficient'
      ? ['次回はもう少し回数を重ねてみよう', '配分の傾向は複数の場面で見ないと自分でも気づきにくい']
      : band === 'altruistic'
        ? ['自分の意見も同じくらい大切にする', '「No」と言える練習', '無理した時のサインを自覚する']
        : band === 'fair'
          ? ['完全な平等にこだわらず、貢献度を見る視点も加える', '直感で決める練習も']
          : band === 'pragmatic'
            ? ['相手の見えない努力にも目を向ける', '勝ち負けでなく協働の場面を増やす', '感謝の言葉を意識的に伝える']
            : ['なぜ相手によって変えたか言語化する', '初対面の人にも自分なりの基準を持つ', '相手を変えても変わらない自分の軸を見つける'];

  return {
    gameLabel: 'コイン分配の選好課題',
    origin: '行動経済学・神経科学で「自分と他人にどう資源を分けるか」を測る代表的な課題で、海外大手の採用検査にも取り入れられています。',
    trait: '社会的選好（自分と他者への資源配分の好み）',
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
      { label: '平均自己取り分', value: n > 0 ? `${avg.toFixed(1)}/10` : '—' },
      { label: '配分のばらつき', value: n > 0 ? `±${stdev.toFixed(1)}` : '—' },
      { label: '配分シナリオ数', value: `${n}回` },
    ],
  };
};
