// public/slides/ をスキャンして manifest.json を自動生成する
// npm run build / dev の前に実行される（package.json の prebuild で起動）
import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const slidesDir = join(__dirname, '..', 'public', 'slides');
const manifestPath = join(slidesDir, 'manifest.json');

if (!existsSync(slidesDir)) {
  mkdirSync(slidesDir, { recursive: true });
}

const files = readdirSync(slidesDir)
  .filter((f) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
  .sort(); // ファイル名昇順 = 投影順

writeFileSync(
  manifestPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), slides: files }, null, 2),
);

console.log(`[slides] manifest with ${files.length} slides:`);
for (const f of files) console.log(`  - ${f}`);
