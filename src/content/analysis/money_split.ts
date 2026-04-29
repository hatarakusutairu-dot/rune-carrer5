import type { AnswerPayload } from '@shared/protocol';
import { scoreAnswer, topNTypes } from '@shared/scoring';
import type { PersonalAnalysis } from '../gameAnalysis';
import { ENCOURAGE_DEFAULT } from './_common';

export const analyzeMoneySplit = (
  p: Extract<AnswerPayload, { kind: 'money_split' }>
): PersonalAnalysis => {
  const avg = p.selfShares.length
    ? p.selfShares.reduce((a, b) => a + b, 0) / p.selfShares.length
    : 0;

  const altruistic = avg < 4;
  const fair = avg >= 4 && avg <= 6;
  // pragmatic when avg > 6

  const headline = altruistic
    ? '相手のことを考えられる利他タイプ'
    : fair
      ? '公平を大事にするバランスタイプ'
      : '自分の取り分も主張できる決断タイプ';

  const summary = altruistic
    ? 'あなたは「相手のことを優先しがち」な利他傾向が強く出ています。海外の採用検査でも測定される社会的選好の指標で、チーム志向の組織やケア・教育系の現場で高く評価されます。'
    : fair
      ? 'あなたは公平性志向が強い社会的選好。「半々で分ける」反応が標準的なバランス型で、調整役・仲裁役として力を発揮します。'
      : 'あなたは自己主張ができる決断型。自分の取り分をしっかり主張する社会的選好は、競争的な環境で活躍する条件にもなります。リーダー職や交渉職での強みです。';

  const strengths = altruistic
    ? ['チームの雰囲気をやわらかくできる', '相手の立場を想像できる', '長期的な信頼関係を築ける']
    : fair
      ? ['対立する意見を整理できる', '誰に対しても同じ基準で接する', '誤解を減らす伝え方ができる']
      : ['自分の主張を言葉にできる', '交渉ができる', '責任を引き受けられる'];

  const realLife = altruistic
    ? ['食べ物を分ける時、自分は少なめでも気にならない', '友達の悩みを優先してしまう', '誰かの誕生日を覚えている']
    : fair
      ? ['じゃんけんで決めるのが好き', 'ルールを守る・守らせる', '損得をきっちり計算する']
      : ['ジャンケンに負けると悔しい', '貢献に見合う報酬を求める', '不公平には黙っていない'];

  const workStyles = altruistic
    ? ['チームでの長期プロジェクト', '教育・福祉・医療', 'コミュニティ運営']
    : fair
      ? ['ファシリテーター・調整役', '法務・コンプライアンス', '監査']
      : ['営業・交渉職', 'リーダー職', '起業・経営'];

  const careers = altruistic
    ? ['看護師・介護士', '教員', 'NPO・NGO', 'カウンセラー', '対人支援']
    : fair
      ? ['仲裁人', '法務', '監査', '人事制度設計', 'コーチ']
      : ['経営者', '営業マネージャー', '弁護士', '投資家', '事業開発'];

  const develop = altruistic
    ? ['自分の意見も同じくらい大切にする', '「No」と言える練習', '無理した時のサインを自覚する']
    : fair
      ? ['完全な平等にこだわらず、貢献度を見る視点も加える', '直感で決める練習も']
      : ['相手の見えない努力にも目を向ける', '勝ち負けでなく協働の場面を増やす', '感謝の言葉を意識的に伝える'];

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
      { label: '平均自己取り分', value: `${avg.toFixed(1)}/10` },
      { label: '配分シナリオ数', value: `${p.selfShares.length}回` },
    ],
  };
};
