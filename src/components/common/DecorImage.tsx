import { useState } from 'react';

// 装飾用画像。画像が無ければ何も表示しない（フォールバックなし）。
// テキストやアイコンが本体で、画像はあると嬉しいおまけ用途に使う。
type Props = {
  src: string;
  alt?: string;
  className?: string;
};

export const DecorImage = ({ src, alt = '', className }: Props) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
};
