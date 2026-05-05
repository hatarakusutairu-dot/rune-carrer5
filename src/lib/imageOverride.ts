// 端末ローカルでの画像差し替え管理（localStorage ベース）
// キー: img-override:{src} → DataURL
// 同タブ更新検知: CustomEvent('image-override-changed')
// クロスタブ更新検知: storage イベント

const KEY_PREFIX = 'img-override:';
export const OVERRIDE_EVENT = 'image-override-changed';

export const overrideKey = (src: string): string => `${KEY_PREFIX}${src}`;

export const getImageOverride = (src: string): string | null => {
  try {
    return localStorage.getItem(overrideKey(src));
  } catch {
    return null;
  }
};

export const setImageOverride = (src: string, dataUrl: string): void => {
  try {
    localStorage.setItem(overrideKey(src), dataUrl);
    notify(src, dataUrl);
  } catch (e) {
    // QuotaExceeded など
    throw e;
  }
};

export const removeImageOverride = (src: string): void => {
  try {
    localStorage.removeItem(overrideKey(src));
    notify(src, null);
  } catch {
    // ignore
  }
};

export const listOverrides = (): Array<{ src: string; dataUrl: string }> => {
  const out: Array<{ src: string; dataUrl: string }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) {
        const v = localStorage.getItem(k);
        if (v) out.push({ src: k.slice(KEY_PREFIX.length), dataUrl: v });
      }
    }
  } catch {
    // ignore
  }
  return out;
};

export const overrideStorageBytes = (): number => {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) {
        const v = localStorage.getItem(k) ?? '';
        total += k.length + v.length;
      }
    }
  } catch {
    // ignore
  }
  // localStorage は UTF-16、概算で文字数×2
  return total * 2;
};

const notify = (src: string, value: string | null) => {
  try {
    window.dispatchEvent(new CustomEvent(OVERRIDE_EVENT, { detail: { src, value } }));
  } catch {
    // ignore
  }
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
