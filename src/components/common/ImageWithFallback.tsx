import { useState } from 'react';

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
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={fallbackClassName ?? className} aria-label={alt}>
        {fallback}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={imgClassName ?? className}
      loading="lazy"
      decoding="async"
    />
  );
};
