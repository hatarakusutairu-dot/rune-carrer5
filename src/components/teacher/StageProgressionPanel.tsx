import { GAME_ORDER, type GameId, type Phase } from '@shared/protocol';
import { DEFAULT_GAME_DURATION } from '@shared/scoring';
import { Button } from '@/components/common/Button';
import { useSync } from '@/contexts/SyncContext';

const STAGE_TITLES = [
  'Stage 0：Start / 今日のミッション',
  'Stage 1：Mini Game / 採用系ミニアプリ体験',
  'Stage 2：Result / 強みの芽診断',
  'Stage 3：Share / ペア・グループ共有',
  'Stage 4：Reveal / 今の採用とつなげる',
  'Stage 5：Skill Link / 社会で活きる力',
  'Stage 6：My Quest / この1年で育てたい力',
];

const GAME_LABELS: Record<GameId, string> = {
  balloon: '風船リスク（リスク許容度）',
  digit_span: '数字記憶（作業記憶）',
  card_decks: 'カード山引き（意思決定）',
  emotion_match: '表情から気持ちを読む（感情認識）',
  money_split: 'コイン分配（社会的選好）',
  stop_signal: '信号反応（反応抑制）',
  pattern_match: 'パターン推論（規則性発見）',
};

const phaseLabel = (phase: Phase): string => {
  switch (phase) {
    case 'lobby':
      return '待機中';
    case 'intro':
      return 'カウントダウン';
    case 'active':
      return '回答受付中';
    case 'results':
      return '結果表示';
    case 'stage_summary':
      return 'Stage集計';
    case 'closed':
      return '終了';
  }
};

export const StageProgressionPanel = () => {
  const { state, send } = useSync();
  if (!state) return null;

  const stage = state.currentStage;
  const phase = state.phase;
  const currentGame = state.currentGameId;

  const startGame = (gameId: GameId) => {
    const durationMs = DEFAULT_GAME_DURATION[gameId];
    send({ type: 'T_START_GAME', gameId, durationMs });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-bold">{STAGE_TITLES[stage] ?? `Stage ${stage}`}</h3>
        <span className="text-xs text-slate-500">フェーズ：{phaseLabel(phase)}</span>
      </div>

      {stage === 1 ? (
        <div className="mt-4">
          <div className="text-sm font-medium text-slate-700">採用ゲーム7種</div>
          <ol className="mt-2 grid gap-2 sm:grid-cols-2">
            {GAME_ORDER.map((g) => (
              <li
                key={g}
                className={`rounded-xl border p-3 ${
                  currentGame === g ? 'border-teal-500 bg-teal-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-500">
                      推奨 {Math.round((DEFAULT_GAME_DURATION[g] ?? 0) / 1000)}秒
                    </div>
                    <div className="font-semibold text-sm">{GAME_LABELS[g]}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={currentGame === g ? 'primary' : 'secondary'}
                      onClick={() => startGame(g)}
                      disabled={phase === 'intro' || phase === 'active'}
                      className="px-3 py-1.5 text-sm"
                    >
                      開始
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => send({ type: 'T_SKIP_GAME', gameId: g })}
                      className="px-2 py-1.5 text-xs"
                    >
                      スキップ
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => send({ type: 'T_END_GAME' })}
              disabled={phase !== 'active'}
            >
              締切（結果へ）
            </Button>
            <Button
              variant="secondary"
              onClick={() => send({ type: 'T_NEXT_GAME' })}
              disabled={phase !== 'results'}
            >
              次のゲームへ
            </Button>
            <Button
              variant="ghost"
              onClick={() => send({ type: 'T_END_STAGE' })}
            >
              Stage 1 を締めて集計
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-600">
          このStageは Pass 4以降で詳細実装予定。現状はStage切替のみ可能。
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          onClick={() => send({ type: 'T_NEXT_STAGE' })}
          disabled={stage >= 6}
        >
          ▶ 次のStageへ
        </Button>
        <Button
          variant="ghost"
          onClick={() => send({ type: 'T_CLOSE_ROOM' })}
          className="ml-auto text-red-700"
        >
          ルームを閉じる
        </Button>
      </div>
    </div>
  );
};
