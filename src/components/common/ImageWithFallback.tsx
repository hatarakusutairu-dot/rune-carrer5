import { useEffect, useState } from 'react';
import { getImageOverride, OVERRIDE_EVENT } from '@/lib/imageOverride';

type Props = {
  src: string;
  fallback: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
};

export const ImageWithFallback = ({
  src,
  fallback,
  alt = '',
  className,
  imgClassName,
  fallbackClassName,
}: Props) => {
  // 試す順: ローカル上書き(あれば) → public/img/{src} → 絵文字
  const [override, setOverride] = useState<string | null>(() => getImageOverride(src));
  const [errorIdx, setErrorIdx] = useState(0);

  useEffect(() => {
    setOverride(getImageOverride(src));
    setErrorIdx(0);
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ src: string; value: string | null }>;
      if (!ev.detail || ev.detail.src === src) {
        setOverride(getImageOverride(src));
        setErrorIdx(0);
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === null || e.key.endsWith(src)) {
        setOverride(getImageOverride(src));
        setErrorIdx(0);
      }
    };
    window.addEventListener(OVERRIDE_EVENT, handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(OVERRIDE_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [src]);

  const candidates = override ? [override, src] : [src];

  if (errorIdx >= candidates.length) {
    return (
      <span className={fallbackClassName ?? className} aria-label={alt}>
        {fallback}
      </span>
    );
  }
  return (
    <img
      key={errorIdx}
      src={candidates[errorIdx]}
      alt={alt}
      onError={() => setErrorIdx((i) => i + 1)}
      className={imgClassName ?? className}
      loading="lazy"
      decoding="async"
    />
  );
};
