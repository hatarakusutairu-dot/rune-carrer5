import { useEffect, useRef, useState } from 'react';
import { EMOTIONS } from '@/content/emotions';
import { AI_AVATARS } from '@/content/aiAvatars';
import {
  fileToDataUrl,
  getImageOverride,
  overrideStorageBytes,
  removeImageOverride,
  setImageOverride,
} from '@/lib/imageOverride';

type Slot = {
  src: string;
  label: string;
  fallback: string;
};

const EMOTION_SLOTS: Slot[] = EMOTIONS.map((e) => ({
  src: `/img/emotion-${e.key}.png`,
  label: e.label,
  fallback: e.emoji,
}));

const AVATAR_SLOTS: Slot[] = AI_AVATARS.map((a) => ({
  src: `/img/avatar-${a.key}.png`,
  label: a.name,
  fallback: a.face,
}));

const MAX_SIZE = 600 * 1024; // 600KB / 枚（localStorage圧迫防止）
const fmtKB = (bytes: number): string => `${(bytes / 1024).toFixed(1)}KB`;

export const AdminImages = () => {
  const [tab, setTab] = useState<'emotions' | 'avatars'>('emotions');
  const slots = tab === 'emotions' ? EMOTION_SLOTS : AVATAR_SLOTS;
  const [, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const totalBytes = overrideStorageBytes();

  const force = () => setRefresh((n) => n + 1);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-slate-200">
        <TabButton active={tab === 'emotions'} onClick={() => setTab('emotions')}>
          表情（{EMOTION_SLOTS.length}種）
        </TabButton>
        <TabButton active={tab === 'avatars'} onClick={() => setTab('avatars')}>
          AIアバター（{AVATAR_SLOTS.length}種）
        </TabButton>
        <div className="ml-auto self-end pb-1 text-[11px] text-slate-500">
          上書き合計: {fmtKB(totalBytes)} / 5MB（localStorage）
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          ⚠ {error}
        </div>
      )}

      <ul className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => (
          <SlotCard
            key={slot.src}
            slot={slot}
            onError={(e) => setError(e)}
            onChanged={force}
          />
        ))}
      </ul>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        ※ 上書き画像はこの端末ブラウザにのみ保存されます。1枚あたり最大 {fmtKB(MAX_SIZE)} 推奨。
        <br />
        ※ 「リセット」で上書きを削除すると、絵文字または public/img/ 配置画像に戻ります。
      </p>
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold rounded-t-lg ${
      active
        ? 'bg-violet-100 text-violet-900 border-b-2 border-violet-500'
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {children}
  </button>
);

const SlotCard = ({
  slot,
  onError,
  onChanged,
}: {
  slot: Slot;
  onError: (e: string) => void;
  onChanged: () => void;
}) => {
  const [override, setOverrideState] = useState<string | null>(() => getImageOverride(slot.src));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOverrideState(getImageOverride(slot.src));
  }, [slot.src]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError(`${slot.label}: 画像ファイルを選んでください`);
      return;
    }
    if (file.size > MAX_SIZE * 2) {
      onError(`${slot.label}: 大きすぎます (${fmtKB(file.size)} / 推奨上限 ${fmtKB(MAX_SIZE)})`);
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setImageOverride(slot.src, dataUrl);
      setOverrideState(dataUrl);
      onChanged();
      onError(''); // clear
    } catch (e) {
      const msg = String(e);
      if (msg.includes('QuotaExceeded') || msg.includes('quota')) {
        onError('容量上限に達しました。不要な上書きを削除してください。');
      } else {
        onError(msg);
      }
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const reset = () => {
    removeImageOverride(slot.src);
    setOverrideState(null);
    onChanged();
  };

  return (
    <li className="rounded-xl bg-white border border-slate-200 p-2 shadow-sm">
      <div className="aspect-square bg-slate-50 rounded overflow-hidden flex items-center justify-center">
        {override ? (
          <img src={override} alt={slot.label} className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-5xl leading-none">{slot.fallback}</span>
        )}
      </div>
      <div className="mt-1.5 text-xs font-bold text-slate-800 truncate" title={slot.label}>
        {slot.label}
      </div>
      <div className="text-[10px] text-slate-500 truncate" title={slot.src}>
        {slot.src}
      </div>
      <div className="mt-1.5 flex gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
          id={`file-${slot.src}`}
        />
        <label
          htmlFor={`file-${slot.src}`}
          className="flex-1 text-xs text-center px-2 py-1 rounded bg-violet-100 hover:bg-violet-200 text-violet-800 cursor-pointer"
        >
          {override ? '差替' : 'アップ'}
        </label>
        <button
          onClick={reset}
          disabled={!override}
          className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
        >
          ↺
        </button>
      </div>
    </li>
  );
};
