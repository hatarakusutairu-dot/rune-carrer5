import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useSync } from '@/contexts/SyncContext';

// 校舎・教室の固定一覧。授業当日に参加するクラスをチェックで選ぶ。
const AVAILABLE_CLASSES = [
  '梅田第1',
  '梅田第2',
  '梅田7F',
  '名古屋',
  '岡山',
] as const;

export const RoomCreateForm = () => {
  const { createRoom, conn, lastError } = useSync();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isCreating = conn === 'connecting';

  const toggle = (cls: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // AVAILABLE_CLASSESの並び順を維持して配列化
    const list = AVAILABLE_CLASSES.filter((c) => selected.has(c));
    if (list.length === 0) {
      alert('参加するクラスを1つ以上選んでください');
      return;
    }
    createRoom(list);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="text-xl font-bold">ルームを作成</h2>
        <p className="mt-2 text-sm text-slate-600">
          今日参加するクラスを選んでください。生徒はここから自分のクラスを選択して入室します。
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABLE_CLASSES.map((cls) => {
            const checked = selected.has(cls);
            return (
              <label
                key={cls}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${
                  checked
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(cls)}
                  className="w-5 h-5 accent-emerald-600"
                />
                <span className={`font-semibold ${checked ? 'text-emerald-900' : 'text-slate-700'}`}>
                  {cls}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-slate-500">
          選択中：
          {selected.size === 0
            ? '—'
            : AVAILABLE_CLASSES.filter((c) => selected.has(c)).join('・')}
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isCreating || selected.size === 0}>
            {isCreating ? '作成中…' : 'ルームを作成して開始'}
          </Button>
        </div>

        {lastError && (
          <p className="mt-3 text-sm text-red-600">
            エラー：{lastError.message}
          </p>
        )}

        <p className="mt-6 text-xs text-slate-500">
          ・クラスは後から増減できません。同日中の運用想定。
          <br />
          ・個人名や学籍番号は一切収集しません。
          <br />
          ・授業終了でルームのデータは消えます。
        </p>
      </div>
    </form>
  );
};
