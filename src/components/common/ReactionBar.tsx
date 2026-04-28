import { REACTION_EMOJIS, type ReactionEmoji } from '@shared/protocol';
import { useSync } from '@/contexts/SyncContext';

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
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 hover:bg-amber-100 active:scale-95 transition text-2xl sm:text-3xl disabled:opacity-40"
            aria-label={`reaction ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
