import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useSync } from '@/contexts/SyncContext';

const PRESET_HINTS = ['梅田大,梅田小,名古屋', '高1A,高1B', '本校,分校'];

export const RoomCreateForm = () => {
  const { createRoom, conn, lastError } = useSync();
  const [classText, setClassText] = useState('');
  const isCreating = conn === 'connecting';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = classText
      .split(/[,、\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      alert('クラスを1つ以上入力してください');
      return;
    }
    createRoom(list);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="text-xl font-bold">ルームを作成</h2>
        <p className="mt-2 text-sm text-slate-600">
          今日参加するクラスを入力してください。生徒はここから選んで入室します。
        </p>
        <label className="block mt-6 text-sm font-medium">
          クラス一覧（カンマまたは改行区切り）
        </label>
        <textarea
          value={classText}
          onChange={(e) => setClassText(e.target.value)}
          placeholder="例：梅田大,梅田小,名古屋"
          rows={3}
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
        />
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
          {PRESET_HINTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setClassText(p)}
              className="px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isCreating}>
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
