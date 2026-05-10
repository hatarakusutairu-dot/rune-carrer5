import { useEffect, useState } from 'react';
import { useSync } from '@/contexts/SyncContext';

const SLOT_COUNT = 8;

// 生徒：5短文意見入力フォーム（2分タイマー、講師の▶で締切でも可）
export const OpinionInputForm = () => {
  const { state, send, mySid } = useSync();
  const [texts, setTexts] = useState<string[]>(() => Array(SLOT_COUNT).fill(''));
  const [submitted, setSubmitted] = useState(false);

  // sid が変わったり再入場した場合にリセット
  useEffect(() => {
    setTexts(Array(SLOT_COUNT).fill(''));
    setSubmitted(false);
  }, [mySid]);

  const expiresAt =
    state?.activeStartedAt && state?.activeDurationMs
      ? state.activeStartedAt + state.activeDurationMs
      : null;
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, []);

  const remainingMs = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  const min = Math.floor(remainingMs / 60000);
  const sec = Math.floor((remainingMs % 60000) / 1000);

  const update = (i: number, v: string) => {
    setTexts((arr) => {
      const next = [...arr];
      next[i] = v.slice(0, 30);
      return next;
    });
  };

  const submit = () => {
    const filtered = texts.map((t) => t.trim()).filter((t) => t.length > 0);
    send({ type: 'S_GAME_SKILLS', texts: filtered });
    setSubmitted(true);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-4 space-y-3">
      <div>
        <h3 className="text-base font-bold text-amber-900">
          ✏️ ゲームで得られる力は何があるだろう？
        </h3>
        <p className="text-xs text-slate-700 mt-1">
          思いついた力を8つまで（30文字以内 / 1個ずつ）。
          途中送信もOK、後から追加で送れば上書きされます。
        </p>
      </div>

      {expiresAt && (
        <div className="text-center">
          <div className="text-3xl font-black tabular-nums text-amber-900">
            残り {min}:{String(sec).padStart(2, '0')}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {texts.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              value={t}
              onChange={(e) => update(i, e.target.value)}
              maxLength={30}
              placeholder={i === 0 ? '例：集中力' : '例：状況判断'}
              className="flex-1 px-3 py-2 rounded-lg border border-amber-300 focus:border-amber-500 focus:outline-none text-sm bg-white"
              disabled={submitted && remainingMs === 0}
            />
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={texts.every((t) => !t.trim())}
        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold"
      >
        {submitted ? '✓ 提出済み（上書き送信）' : '提出'}
      </button>
      <p className="text-[11px] text-slate-500 text-center">
        提出後でも 残時間内なら追加・修正して再送信できます
      </p>
    </div>
  );
};
