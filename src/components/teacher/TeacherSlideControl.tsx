import { useEffect, useState } from 'react';
import { useSync } from '@/contexts/SyncContext';
import { slideContextOf } from '@shared/slideContext';
import { DEFAULT_GAME_DURATION } from '@shared/scoring';
import { currentPhaseFor, phasesForSlide, type PostSlidePhase } from '@shared/slidePhases';

const PHASE_LABELS: Record<PostSlidePhase, string> = {
  'stage2-summary': '全体分析を表示',
  'opinion-input': '意見収集（5短文・2分）',
  'opinion-view': 'みんなの意見を表示',
  'quest-input': 'My Quest 入力',
  'quest-view': 'みんなのクエストを表示',
  'survey-qr': 'アンケートQRを表示',
};

const GAME_LABELS: Record<string, string> = {
  balloon: '🎈 風船リスク',
  digit_span: '🔢 数字記憶',
  card_decks: '🎴 カード山引き',
  emotion_match: '😊 表情を読む',
  money_split: '🪙 コイン分配',
  stop_signal: '🚦 信号反応',
  pattern_match: '◆ パターン推論',
  towers: '🗼 塔の移動',
  wasabi_waiter: '🍜 食堂タイム',
};

// 講師ホーム画面の最上部に置く「▶ 次へ」コントロール
// スライド送り＋ゲーム開始ボタンの2系統
export const TeacherSlideControl = () => {
  const { state, send } = useSync();
  const [slideNames, setSlideNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/slides/manifest.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data: { slides?: string[] }) => {
        setSlideNames(Array.isArray(data?.slides) ? data.slides : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!state) return null;

  const idx = state.slideIndex ?? 0;
  const total = slideNames.length;
  const currentName = slideNames[idx] ?? '';
  const isLast = total === 0 ? true : idx >= total - 1;
  const isFirst = idx <= 0;

  const goNext = () => send({ type: 'T_NEXT_SLIDE' });
  const goPrev = () => send({ type: 'T_PREV_SLIDE' });

  // 現在のスライドがゲーム対応ならその gameId を取得
  const ctx = currentName ? slideContextOf(currentName) : {};
  const slideGameId = ctx.gameId;
  const phase = state.phase;
  const postSlideStep = state.postSlideStep ?? 0;
  const inPhase = postSlideStep > 0;
  const currentPhase = currentName ? currentPhaseFor(currentName, postSlideStep) : null;
  const phases = currentName ? phasesForSlide(currentName) : [];
  const nextPhase: PostSlidePhase | null =
    !inPhase && phases.length > 0
      ? phases[0]
      : inPhase && postSlideStep < phases.length
        ? phases[postSlideStep]
        : null;
  // ゲーム開始ボタンを出す条件：ゲームスライド & ゲーム未開始 (lobby) & フェーズに入っていない
  const showStartButton = !!slideGameId && phase === 'lobby' && !inPhase;
  // ゲーム実行中の表示
  const isGameActive = phase === 'intro' || phase === 'active';
  // ▶ボタンのラベル
  const nextLabel = nextPhase
    ? `▶ ${PHASE_LABELS[nextPhase]} へ`
    : isLast
      ? '完了'
      : '▶ 次へ進む';

  const startGame = () => {
    if (!slideGameId) return;
    const durationMs = DEFAULT_GAME_DURATION[slideGameId] ?? 90_000;
    send({ type: 'T_START_GAME', gameId: slideGameId, durationMs });
  };
  const endGame = () => {
    send({ type: 'T_END_GAME' });
  };

  if (total === 0 && !loading) {
    return (
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 text-sm">
        <div className="font-bold text-amber-900 mb-1">⚠ スライドが未配置</div>
        <div className="text-amber-800">
          <code className="bg-white px-1 rounded text-xs">public/slides/</code> に PNG/JPG/PDF を配置して
          git push、再ビルドすると ▶ 次へ ボタンで進行できるようになります。
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-100 via-orange-50 to-amber-50 border-2 border-rose-300 p-3 sm:p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm sm:text-base font-bold text-rose-900">
          🎬 スライド進行
        </h3>
        <span className="text-xs text-slate-600 tabular-nums">
          {idx + 1} / {total}
        </span>
      </div>

      {/* プレビュー（スライド表示中のみ） */}
      {currentName && !inPhase && (
        <div className="rounded-xl bg-black overflow-hidden shadow-inner mb-3">
          <div className="aspect-video flex items-center justify-center">
            <img
              src={`/slides/${currentName}`}
              alt={currentName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* フェーズ中の表示（プレビュー代わり） */}
      {inPhase && currentPhase && (
        <div className="rounded-xl bg-gradient-to-br from-violet-100 to-rose-100 border-2 border-violet-300 p-4 mb-3 text-center">
          <div className="text-xs text-violet-600 font-bold tracking-wider">
            進行中フェーズ
          </div>
          <div className="text-lg font-black text-violet-900 mt-1">
            {PHASE_LABELS[currentPhase]}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            （下のメインエリアで操作中）
          </div>
        </div>
      )}

      {/* ゲーム開始ボタン（ゲームスライド＆未開始時のみ表示） */}
      {showStartButton && slideGameId && (
        <button
          onClick={startGame}
          className="w-full py-4 mb-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow"
        >
          {GAME_LABELS[slideGameId] ?? slideGameId} を開始
        </button>
      )}

      {/* ゲーム実行中の早期終了ボタン */}
      {isGameActive && (
        <button
          onClick={endGame}
          className="w-full py-3 mb-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
        >
          ⏹ 強制終了して結果へ
        </button>
      )}

      {/* メインの「▶ 次へ」ボタン（スライド送り） */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="col-span-1 py-3 rounded-xl bg-white border-2 border-rose-300 text-rose-800 font-bold text-base hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ◀ 戻る
        </button>
        <button
          onClick={goNext}
          disabled={isLast && !nextPhase}
          className="col-span-3 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg sm:text-xl shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel}
        </button>
      </div>

      <div className="mt-2 text-[11px] text-slate-600 leading-relaxed">
        スライド送りは「▶ 次へ」、ゲームは「{GAME_LABELS[slideGameId ?? ''] ?? 'ゲーム'} を開始」ボタンから。
        {currentName && (
          <span className="block mt-0.5 text-slate-500 truncate">
            現在：<code className="bg-white/60 px-1 rounded">{currentName}</code>
          </span>
        )}
      </div>
    </div>
  );
};
