// PDFをページごとPNG Blobに変換する
// pdfjs-dist は重い（main bundleに入れると+400KB）ので、利用時のみ動的importする

export type RenderedPage = {
  blob: Blob;
  width: number;
  height: number;
};

let workerInitialized = false;

export const pdfToImages = async (
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<RenderedPage[]> => {
  const pdfjsLib = await import('pdfjs-dist');
  if (!workerInitialized) {
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    workerInitialized = true;
  }

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const total = pdf.numPages;
  const out: RenderedPage[] = [];
  for (let i = 1; i <= total; i++) {
    onProgress?.(i, total);
    const page = await pdf.getPage(i);
    // 1.5倍で投影に十分な解像度（2倍以上はサイズ膨張）
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas context unavailable');
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
    );
    out.push({ blob, width: canvas.width, height: canvas.height });
  }
  return out;
};

export const imageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
