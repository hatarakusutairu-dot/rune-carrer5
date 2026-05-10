import { useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/common/Button';

interface RoomCodeDisplayProps {
  code: string;
}

export const RoomCodeDisplay = ({ code }: RoomCodeDisplayProps) => {
  const [copied, setCopied] = useState<'url' | 'svg' | 'code' | null>(null);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const studentUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/student?code=${code}`;
  }, [code]);

  const flash = (kind: 'url' | 'svg' | 'code') => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const copyText = async (text: string, kind: 'url' | 'svg' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      flash(kind);
    } catch {
      // ignore
    }
  };

  const copyUrl = () => copyText(studentUrl, 'url');
  const copyCode = () => copyText(code, 'code');

  const copyQrSvg = () => {
    const svg = qrWrapRef.current?.querySelector('svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    void copyText(xml, 'svg');
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
        a.download = `room-${code}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="grid gap-6 lg:grid-cols-[auto,1fr] items-start">
        <div ref={qrWrapRef} className="flex justify-center bg-white p-2 rounded-lg">
          <QRCodeSVG value={studentUrl || 'https://example.com'} size={200} />
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-slate-500">参加コード（生徒に伝える）</div>
            <div className="flex items-baseline gap-3 mt-1">
              <div className="text-5xl font-black tracking-widest tabular-nums">
                {code}
              </div>
              <Button variant="secondary" onClick={copyCode} className="px-3 py-1.5 text-sm">
                {copied === 'code' ? 'コピー済' : 'コピー'}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              参加URL（Discord等に貼る）
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
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={copyQrSvg} className="px-3 py-2 text-sm">
              {copied === 'svg' ? 'コピー済' : 'QR(SVG)コピー'}
            </Button>
            <Button variant="secondary" onClick={downloadQrPng} className="px-3 py-2 text-sm">
              QR(PNG)保存
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            URL/コード/QRどれか1つを共有すれば生徒は入室できます。
          </p>
        </div>
      </div>
    </div>
  );
};
