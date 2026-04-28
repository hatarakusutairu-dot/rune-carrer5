import type { ConnState } from '@/lib/sync';

const LABEL: Record<ConnState, { text: string; color: string }> = {
  idle: { text: '未接続', color: 'bg-slate-200 text-slate-700' },
  connecting: { text: '接続中…', color: 'bg-amber-100 text-amber-800' },
  connected: { text: '接続中', color: 'bg-emerald-100 text-emerald-800' },
  disconnected: { text: '切断・再接続中', color: 'bg-red-100 text-red-800' },
  error: { text: '通信エラー', color: 'bg-red-100 text-red-800' },
};

export const ConnectionBadge = ({ state }: { state: ConnState }) => {
  const { text, color } = LABEL[state];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {text}
    </span>
  );
};
