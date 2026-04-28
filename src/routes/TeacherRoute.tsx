import { useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Layout } from '@/components/common/Layout';
import { Button } from '@/components/common/Button';
import { STAGES, TOTAL_MINUTES } from '@/content/stages';
import { MESSAGES } from '@/content/messages';
import { formatMMSS, useClassTimer } from '@/lib/timer';

export const TeacherRoute = () => {
  const timer = useClassTimer();
  const [stageIndex, setStageIndex] = useState(0);
  const [copied, setCopied] = useState<'url' | 'svg' | null>(null);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const stage = STAGES[stageIndex];
  const elapsedSec = Math.floor(timer.elapsedMs / 1000);
  const totalSec = TOTAL_MINUTES * 60;
  const remainSec = totalSec - elapsedSec;

  const stageElapsedSec = Math.max(0, elapsedSec - stage.startMin * 60);
  const stageRemainSec = stage.durationMin * 60 - stageElapsedSec;

  const studentUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}#/student`;
  }, []);

  const flashCopied = (kind: 'url' | 'svg') => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const copyUrl = async () => {
    if (!studentUrl) return;
    try {
      await navigator.clipboard.writeText(studentUrl);
      flashCopied('url');
    } catch {
      // ignore
    }
  };

  const copyQrSvg = async () => {
    const svg = qrWrapRef.current?.querySelector('svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    try {
      await navigator.clipboard.writeText(xml);
      flashCopied('svg');
    } catch {
      // ignore
    }
  };

  const downloadQrPng = () => {
    const svg = qrWrapRef.current?.querySelector('svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((png) => {
        if (!png) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(png);
        a.download = 'student-qr.png';
        a.click();
        URL.revokeObjectURL(a.href);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const next = () => setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
  const prev = () => setStageIndex((i) => Math.max(i - 1, 0));

  return (
    <Layout title="講師モード" subtitle="授業全体60分の進行管理">
      <div className="grid gap-4 lg:grid-cols-3 max-w-6xl">
        <section className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold">
              Stage {stage.id}：{stage.title}
            </h2>
            <span className="text-sm text-slate-600">
              推奨 {stage.durationMin}分（{stage.startMin}〜{stage.endMin}分）
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">授業全体 残り</div>
              <div className="text-3xl font-bold tabular-nums">{formatMMSS(remainSec)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">この Stage 残り</div>
              <div className="text-3xl font-bold tabular-nums">{formatMMSS(stageRemainSec)}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {!timer.running && !timer.paused && (
              <Button onClick={timer.start}>開始</Button>
            )}
            {timer.running && (
              <Button variant="secondary" onClick={timer.pause}>一時停止</Button>
            )}
            {timer.paused && (
              <Button onClick={timer.resume}>再開</Button>
            )}
            <Button variant="ghost" onClick={timer.reset}>リセット</Button>
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" onClick={prev} disabled={stageIndex === 0}>
                ← 戻る
              </Button>
              <Button onClick={next} disabled={stageIndex === STAGES.length - 1}>
                次へ →
              </Button>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            {MESSAGES.fallbackBadge}
          </div>
        </section>

        <aside className="rounded-2xl bg-white border border-slate-200 p-6">
          <h3 className="font-bold text-base">参加用QR</h3>
          <div ref={qrWrapRef} className="mt-3 flex justify-center bg-white p-2 rounded-lg">
            <QRCodeSVG value={studentUrl || 'https://example.com'} size={180} />
          </div>

          <label className="mt-4 block text-xs font-medium text-slate-600">
            参加URL（コピーして共有可）
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              readOnly
              value={studentUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-xs font-mono"
            />
            <Button variant="secondary" onClick={copyUrl} className="px-3 py-2 text-sm">
              {copied === 'url' ? 'コピー済' : 'URLコピー'}
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={copyQrSvg} className="px-3 py-2 text-sm">
              {copied === 'svg' ? 'コピー済' : 'QR(SVG)コピー'}
            </Button>
            <Button variant="secondary" onClick={downloadQrPng} className="px-3 py-2 text-sm">
              QR(PNG)保存
            </Button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            URLをチャットに貼ったり、QR画像を資料・スライドに貼り付けて配布できます。
          </p>
          <p className="mt-1 text-xs text-slate-500">
            読めない生徒には隣の人と一緒に見てもらう。
          </p>
        </aside>
      </div>

      <section className="mt-6 rounded-2xl bg-white border border-slate-200 p-6 max-w-6xl">
        <h3 className="font-bold text-base">Stage一覧</h3>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {STAGES.map((s, i) => (
            <li key={s.id}>
              <button
                onClick={() => setStageIndex(i)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  i === stageIndex
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs text-slate-500">
                  {s.startMin}〜{s.endMin}分
                </div>
                <div className="font-semibold text-sm">{s.title}</div>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
};
