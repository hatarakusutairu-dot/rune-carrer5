import { REACTION_EMOJIS, type ReactionEmoji } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';
import { ImageWithFallback } from './ImageWithFallback';

// 絵文字 → 画像ファイル名のキー
const REACTION_KEY: Record<ReactionEmoji, string> = {
  '👍': 'thumbs',
  '❤️': 'heart',
  '😂': 'laugh',
  '😮': 'surprise',
  '🌱': 'sprout',
  '🔥': 'fire',
  '👏': 'clap',
  '🎉': 'party',
};

export const ReactionBar = () => {
  const { send, conn } = useSync();
  const enabled = conn === 'connected';

  const handleClick = (emoji: ReactionEmoji) => {
    if (!enabled) return;
    send({ type: 'REACTION', emoji });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-3">
      <div className="flex flex-wrap justify-center gap-2">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleClick(emoji)}
            disabled={!enabled}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 hover:bg-amber-100 active:scale-95 transition disabled:opacity-40 flex items-center justify-center"
            aria-label={`reaction ${emoji}`}
          >
            <ImageWithFallback
              src={`/img/reaction-${REACTION_KEY[emoji]}.png`}
              fallback={emoji}
              alt={emoji}
              imgClassName="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              fallbackClassName="text-2xl sm:text-3xl leading-none"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
