import { useState } from 'react';
import { Button } from '@/components/common/Button';

interface ClassSelectorProps {
  classes: string[];
  onConfirm: (className: string) => void;
  busy?: boolean;
}

export const ClassSelector = ({ classes, onConfirm, busy }: ClassSelectorProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-md">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="text-xl font-bold">あなたのクラスを選んでね</h2>
        <p className="mt-1 text-sm text-slate-600">
          名前ではなく、所属クラスだけ教えてください。
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {classes.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelected(c)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selected === c
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs text-slate-500">クラス</div>
              <div className="font-bold">{c}</div>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button
            disabled={!selected || busy}
            onClick={() => selected && onConfirm(selected)}
            className="w-full"
          >
            {busy ? '入室中…' : 'これで入る'}
          </Button>
        </div>
      </div>
    </div>
  );
};
