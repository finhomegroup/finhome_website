// Derive the scoped web-hero WebP files (2026-10-01) from the approved local AI
// library. Plain downscale/re-encode of the full 3:2 frame: no crop, no
// retouch, no upscale (1536 = the source width). Crops are CSS only.
// Verifies each source PNG's SHA-256 against the library manifest first.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(ROOT, "node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json"));
const sharp = require("sharp");
const LIB = path.join(ROOT, "artifacts/ai-people-library-2026-10-01");
const manifest = JSON.parse(readFileSync(path.join(LIB, "manifest.json"), "utf8"));
const WIDTHS = [720, 1200, 1536];

for (const n of [3, 4, 5, 6, 7, 8, 9, 10]) {
  const item = manifest.images.find((i) => i.n === n);
  const src = path.join(LIB, item.outputFile);
  const buf = readFileSync(src);
  const sha = createHash("sha256").update(buf).digest("hex");
  if (sha !== item.sha256) throw new Error(`sha mismatch for ${item.outputFile}`);
  const meta = await sharp(buf).metadata();
  if (meta.width !== 1536 || meta.height !== 1024) throw new Error(`unexpected size ${item.outputFile}`);
  const base = `ai-library-${String(n).padStart(2, "0")}-${item.name}`;
  for (const w of WIDTHS) {
    const out = path.join(ROOT, "public/images/education", `${base}-${w}.webp`);
    if (existsSync(out)) throw new Error(`refusing to overwrite ${out}`);
    const info = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(out);
    console.log(`${base}-${w}.webp ${info.width}x${info.height} ${info.size}B src-sha=${sha.slice(0, 12)}`);
  }
}
