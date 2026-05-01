import { useEffect, useState } from 'react';
import type { AnswerPayload, GameId } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { saveMyAnswer, getMyAnswer } from '@/lib/myAnswers';
import { BalloonRisk } from './BalloonRisk';
import { DigitSpan } from './DigitSpan';
import { CardDecks } from './CardDecks';
import { EmotionMatch } from './EmotionMatch';
import { MoneySplit } from './MoneySplit';
import { StopSignal } from './StopSignal';
import { PatternMatch } from './PatternMatch';

interface GameContainerProps {
  gameId: GameId;
  startedAtMs: number;
  durationMs: number;
  onAnswered?: () => void;
}

export const GameContainer = ({ gameId, startedAtMs, durationMs, onAnswered }: GameContainerProps) => {
  const { send } = useSync();
  const [done, setDone] = useState<boolean>(() => !!getMyAnswer(gameId));

  useEffect(() => {
    setDone(!!getMyAnswer(gameId));
  }, [gameId]);

  const handleComplete = (payload: AnswerPayload) => {
    saveMyAnswer(gameId, payload);
    send({ type: 'S_ANSWER', gameId, payload });
    setDone(true);
    onAnswered?.();
  };

  if (done) {
    // 完了済はGameContainerでは何も描画しない（StudentPhaseBoardが分析カード表示）
    return null;
  }

  const props = { startedAtMs, durationMs, onComplete: handleComplete };
  switch (gameId) {
    case 'balloon':
      return <BalloonRisk {...props} />;
    case 'digit_span':
      return <DigitSpan {...props} />;
    case 'card_decks':
      return <CardDecks {...props} />;
    case 'emotion_match':
      return <EmotionMatch {...props} />;
    case 'money_split':
      return <MoneySplit {...props} />;
    case 'stop_signal':
      return <StopSignal {...props} />;
    case 'pattern_match':
      return <PatternMatch {...props} />;
  }
};
