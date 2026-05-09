// スライド後の追加フェーズ定義
// あるスライドを表示中に ▶次へ を押すと、まずこれらのフェーズを順に進む
// 最後のフェーズが終わったら次のスライドへ

export type PostSlidePhase =
  | 'stage2-summary'   // 全ゲーム総合分析（クラス別＋個人）
  | 'opinion-input'    // 5短文意見入力（2分タイマー）
  | 'opinion-view'     // 全員意見の可視化（バブル）
  | 'quest-input'      // My Quest 入力
  | 'quest-view'       // 全員クエスト表示
  | 'survey-qr';       // アンケートQR

export const SLIDE_POST_PHASES: Record<string, readonly PostSlidePhase[]> = {
  // 結果の見方スライド → 全ゲーム総合分析
  'results-howto': ['stage2-summary'],
  // ゲーミング強みスライド → 意見収集 + 可視化
  'gaming-strength': ['opinion-input', 'opinion-view'],
  // My Quest スライド → クエスト入力 + 全員表示
  'my-quest': ['quest-input', 'quest-view'],
  // ラストスライド → アンケートQR
  'closing': ['survey-qr'],
};

export const phasesForSlide = (filename: string): readonly PostSlidePhase[] => {
  for (const [key, phases] of Object.entries(SLIDE_POST_PHASES)) {
    if (filename.includes(key)) return phases;
  }
  return [];
};

// 現在の (slideName, postSlideStep) から、表示すべきフェーズ名を返す
export const currentPhaseFor = (
  slideName: string,
  postSlideStep: number,
): PostSlidePhase | null => {
  if (postSlideStep <= 0) return null;
  const phases = phasesForSlide(slideName);
  return phases[postSlideStep - 1] ?? null;
};
