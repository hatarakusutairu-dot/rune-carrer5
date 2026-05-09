import { useEffect, useState } from 'react';
import { listSlides } from '@/lib/slidesDB';
import {
  detectStage,
  onSlideMessage,
  sendSlideMessage,
  STAGE_GROUPS,
  type SlideStageGroup,
} from '@/lib/slideControl';
import { isSyncEnabled, setSyncEnabled } from '@/lib/slideAutoSync';

type DeckEntry = { url: string; name: string; source: 'default' | 'local' };

const fetchDefaultDeck = async (): Promise<DeckEntry[]> => {
  try {
    const res = await fetch('/slides/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return [];
    const data: { slides?: string[] } = await res.json();
    if (!Array.isArray(data?.slides)) return [];
    return data.slides.map((name) => ({
      url: `/slides/${name}`,
      name,
      source: 'default' as const,
    }));
  } catch {
    return [];
  }
};

export const AdminSlidesControl = () => {
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number | null>(0);
  const [currentName, setCurrentName] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [syncOn, setSyncOnState] = useState<boolean>(isSyncEnabled());

  const toggleSync = () => {
    const next = !syncOn;
    setSyncEnabled(next);
    setSyncOnState(next);
  };

  // デッキ読み込み（プレビュー一覧の表示用）
  useEffect(() => {
    let cancelled = false;
    const localUrls: string[] = [];
    Promise.all([fetchDefaultDeck(), listSlides()])
      .then(([defaults, locals]) => {
        if (cancelled) return;
        const localEntries: DeckEntry[] = locals.map((s) => {
          const url = URL.createObjectURL(s.blob);
          localUrls.push(url);
          return { url, name: s.name, source: 'local' };
        });
        setDeck([...defaults, ...localEntries]);
      });
    return () => {
      cancelled = true;
      localUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // /slides タブからの状態通知を受信
  useEffect(() => {
    const off = onSlideMessage((msg) => {
      if (msg.type === 'state-update') {
        setCurrentIdx(msg.index);
        setCurrentName(msg.name);
        setConnected(true);
      }
    });
    // /slides に「現状教えて」と問い合わせ
    sendSlideMessage({ type: 'state-request' });
    // 5秒経って返事が無ければ「未接続」と判定
    const t = window.setTimeout(() => {
      // 受信できていなければ connected は false のまま
    }, 5000);
    return () => {
      off();
      clearTimeout(t);
    };
  }, []);

  const openSlidesTab = () => {
    window.open('/slides', '_blank', 'noopener');
  };

  // ステージ別にスライドをグルーピング
  const stagesWithSlides = STAGE_GROUPS.map((g) => {
    const slides = deck
      .map((d, i) => ({ ...d, index: i }))
      .filter((d) => detectStage(d.name) === g.key);
    return { group: g, slides };
  }).filter((s) => s.slides.length > 0);

  const otherSlides = deck
    .map((d, i) => ({ ...d, index: i }))
    .filter((d) => detectStage(d.name) === 'other');

  if (deck.length === 0) {
    return (
      <div className="rounded-xl bg-white/70 border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        スライドが登録されていません。
        <br />
        <code className="bg-slate-100 px-1 rounded text-xs">public/slides/</code> に置いて git push、
        または下の「🎞 スライド管理」からアップロードしてください。
      </div>
    );
  }

  // 現在表示中スライド（/slides の状態 or 手元の選択）
  const previewIdx = currentIdx ?? 0;
  const previewSlide = deck[previewIdx];

  // ボタンクリック → /slides に送信 + 自分のプレビューも更新
  const goTo = (i: number) => {
    setCurrentIdx(Math.max(0, Math.min(deck.length - 1, i)));
    sendSlideMessage({ type: 'goto', index: i });
  };
  const goRel = (delta: number) => {
    const next = Math.max(0, Math.min(deck.length - 1, previewIdx + delta));
    setCurrentIdx(next);
    sendSlideMessage({ type: delta > 0 ? 'next' : 'prev' });
  };

  return (
    <div className="space-y-4">
      {/* 大きいプレビュー（プレゼン画面のミニ版）*/}
      {previewSlide && (
        <div className="rounded-2xl bg-black overflow-hidden border-2 border-slate-800 shadow-lg">
          <div className="aspect-video flex items-center justify-center">
            <img
              src={previewSlide.url}
              alt={previewSlide.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="bg-slate-900 text-white px-3 py-2 text-xs flex items-center justify-between">
            <span>
              <span className="tabular-nums">
                {previewIdx + 1} / {deck.length}
              </span>
              <span className="ml-2 text-slate-300">{previewSlide.name}</span>
            </span>
            <span className="text-slate-400 text-[10px]">プレビュー（投影画面と同じもの）</span>
          </div>
        </div>
      )}

      {/* 自動同期 ON/OFF + /slides リンク */}
      <div className="rounded-xl bg-white border border-slate-200 p-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={syncOn}
            onChange={toggleSync}
            className="w-4 h-4"
          />
          <span className="text-sm font-bold">
            🔁 自動同期
            <span className="ml-1 text-[11px] text-slate-500 font-normal">
              （講師の Stage / ゲーム遷移で自動ジャンプ）
            </span>
          </span>
        </label>
        <button
          onClick={openSlidesTab}
          className="ml-auto px-3 py-1.5 text-sm font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
        >
          🎞 別タブで /slides を開く
        </button>
        <div className="text-xs w-full">
          {connected ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              ●/slides 接続中：{currentName}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
              ○ /slides 未接続（プレビューはこのページのみ）
            </span>
          )}
        </div>
      </div>

      {/* 進行コントロール */}
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
        <div className="text-xs font-bold text-rose-900 mb-2">
          ⏯ スライド手動操作（自動同期がズレた時用）
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => goTo(0)}>⏮ 最初</Btn>
          <Btn onClick={() => goRel(-1)}>◀ 前へ</Btn>
          <Btn onClick={() => goRel(1)}>▶ 次へ</Btn>
          <Btn onClick={() => goTo(deck.length - 1)}>⏭ 最後</Btn>
        </div>
      </div>

      {/* Stage別ジャンプ */}
      <div className="rounded-xl bg-violet-50 border border-violet-200 p-3">
        <div className="text-xs font-bold text-violet-900 mb-2">🎯 Stage別ジャンプ（最初のスライドへ）</div>
        <div className="flex flex-wrap gap-2">
          {stagesWithSlides.map(({ group, slides }) => (
            <button
              key={group.key}
              onClick={() => goTo(slides[0].index)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-violet-200 text-violet-900 hover:bg-violet-300"
            >
              {group.label}（#{slides[0].index + 1}）
            </button>
          ))}
        </div>
      </div>

      {/* スライド一覧（クリックで直接ジャンプ） */}
      <div className="rounded-xl bg-white border border-slate-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold">📋 全スライド一覧（クリックでそのスライドへ）</h4>
          <span className="text-[11px] text-slate-500">{deck.length}枚</span>
        </div>
        {stagesWithSlides.map(({ group, slides }) => (
          <StageSection
            key={group.key}
            group={group}
            slides={slides}
            currentIdx={currentIdx}
            onPick={goTo}
          />
        ))}
        {otherSlides.length > 0 && (
          <StageSection
            group={{ key: 'other', label: 'その他', patterns: [] }}
            slides={otherSlides}
            currentIdx={currentIdx}
            onPick={goTo}
          />
        )}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        ※ <strong>/slides を別タブで開いた状態</strong>でこのページから操作してください。
        投影PCで /slides をプロジェクター側、管理ページを手元側で開くのが標準運用です。
      </p>
    </div>
  );
};

const Btn = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm font-bold rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100"
  >
    {children}
  </button>
);

const StageSection = ({
  group,
  slides,
  currentIdx,
  onPick,
}: {
  group: SlideStageGroup;
  slides: Array<DeckEntry & { index: number }>;
  currentIdx: number | null;
  onPick: (i: number) => void;
}) => (
  <div className="mb-3 last:mb-0">
    <div className="text-[11px] font-semibold text-slate-600 mb-1">
      {group.label}（{slides.length}枚）
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1.5">
      {slides.map((s) => {
        const isCurrent = currentIdx === s.index;
        return (
          <button
            key={s.index}
            onClick={() => onPick(s.index)}
            className={`relative rounded border-2 overflow-hidden aspect-video ${
              isCurrent ? 'border-rose-500 ring-2 ring-rose-300' : 'border-slate-200 hover:border-slate-400'
            }`}
            title={s.name}
          >
            <img
              src={s.url}
              alt={s.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-0.5 left-0.5 text-[9px] font-bold bg-white/80 px-1 rounded">
              {s.index + 1}
            </span>
            {isCurrent && (
              <span className="absolute bottom-0 inset-x-0 bg-rose-500 text-white text-[9px] py-0.5 text-center font-bold">
                表示中
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);
