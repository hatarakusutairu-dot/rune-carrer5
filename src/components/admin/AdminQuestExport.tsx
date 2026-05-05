import { useSync } from '@/contexts/SyncContext';
import { buildQuestCsv, downloadBlob, stamp } from '@/lib/questExport';

export const AdminQuestExport = () => {
  const { questAgg, state } = useSync();

  if (!questAgg || questAgg.total === 0) {
    return (
      <div className="text-sm text-slate-600 leading-relaxed">
        現在、提出されている My Quest カードはありません。
        <br />
        授業中に生徒が提出すると、ここから CSV / JSON でダウンロードできます。
        <br />
        <span className="text-[11px] text-slate-500">
          ※ 講師モードでルームを開いている状態で動作します（接続: {state ? 'OK' : '未接続'}）
        </span>
      </div>
    );
  }

  const total = questAgg.total;
  const expected = state?.totalStudents ?? 0;
  const ratio = expected > 0 ? (total / expected) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-sm text-slate-700">
          現在の提出数：
          <span className="text-2xl font-black tabular-nums">{total}</span>
          {expected > 0 && (
            <span className="text-slate-500"> / {expected}人（{ratio.toFixed(0)}%）</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              downloadBlob(`my-quest_${stamp()}.csv`, buildQuestCsv(questAgg), 'text/csv;charset=utf-8');
            }}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            CSVダウンロード
          </button>
          <button
            onClick={() => {
              downloadBlob(
                `my-quest_${stamp()}.json`,
                JSON.stringify(questAgg, null, 2),
                'application/json',
              );
            }}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            JSON
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        CSV は Excel / Google Sheets でそのまま開けます（BOM付きUTF-8）。
        集計と全カード（匿名）を含みます。
      </p>
    </div>
  );
};
