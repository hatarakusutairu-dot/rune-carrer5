import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';

interface CodeEntryProps {
  initialCode?: string;
  onSubmit: (code: string) => void;
  busy?: boolean;
  errorMessage?: string;
}

// 全角数字（０-９）を半角に変換してから数字以外を除去
const toHalfWidthDigits = (s: string): string =>
  s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

const sanitize = (s: string): string =>
  toHalfWidthDigits(s).replace(/[^0-9]/g, '').slice(0, 6);

export const CodeEntry = ({ initialCode, onSubmit, busy, errorMessage }: CodeEntryProps) => {
  const [code, setCode] = useState(sanitize(initialCode ?? ''));

  useEffect(() => {
    if (initialCode) setCode(sanitize(initialCode));
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      alert('6桁の数字を入力してください');
      return;
    }
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="text-xl font-bold">参加コードを入力</h2>
        <p className="mt-1 text-sm text-slate-600">先生から教えてもらった6桁の数字</p>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(sanitize(e.target.value))}
          placeholder="000000"
          className="mt-4 w-full text-center text-4xl tracking-[0.5em] font-black tabular-nums rounded-xl border-2 border-slate-300 px-3 py-4 focus:border-teal-500 outline-none"
          aria-label="参加コード"
        />

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <div className="mt-6">
          <Button type="submit" disabled={busy || code.length !== 6} className="w-full">
            {busy ? '入室中…' : '入室する'}
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          ・名前は入力しません。
          <br />
          ・コードはルーム開設中のみ有効です。
        </p>
      </div>
    </form>
  );
};
