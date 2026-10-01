// Derive web-hero WebP files for the collection articles from Codex's
// generated supplement (artifacts/ai-web-heroes-2026-10-01/generated-supplement).
// Plain downscale/re-encode of the full 3:2 frame: no crop, retouch or upscale.
// Usage: node derive-supplement.mjs C01 C02 …  (default: every manifest entry
// whose WebP files do not exist yet). Never overwrites.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(ROOT, "node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json"));
const sharp = require("sharp");
const DIR = path.join(ROOT, "artifacts/ai-web-heroes-2026-10-01/generated-supplement");
const load = (f) => JSON.parse(readFileSync(path.join(DIR, f), "utf8"));
// manifest.json (C01–C15), manifest-c16-c23.json, and manifest-logo-cleanup.json,
// whose "-clean" files REPLACE the listed originals (logo marks removed by Codex).
const items = new Map();
for (const i of load("manifest.json").images) items.set(i.id.toUpperCase(), { id: i.id.toUpperCase(), file: i.file, sha256: i.sha256 });
for (const i of load("manifest-c16-c23.json").items)items.set(i.id.toUpperCase(), { id: i.id.toUpperCase(), file: i.file });
for (const i of load("manifest-logo-cleanup.json").items) {
  const prev = items.get(i.id.toUpperCase());
  if (!prev || prev.file !== i.replaces) throw new Error(`cleanup ${i.id} does not replace a known original`);
  items.set(prev.id, { id: prev.id, file: i.file });
}
const WIDTHS = [720, 1200, 1536];
const out = (id, w) => path.join(ROOT, "public/images/education", `hero-${id.toLowerCase()}-${w}.webp`);

const wanted = process.argv.slice(2);
for (const item of items.values()) {
  if (wanted.length ? !wanted.includes(item.id) : WIDTHS.every((w) => existsSync(out(item.id, w)))) continue;
  const buf = readFileSync(path.join(DIR, item.file));
  const sha = createHash("sha256").update(buf).digest("hex");
  if (item.sha256 && item.sha256 !== sha) throw new Error(`sha mismatch for ${item.file}`);
  const meta = await sharp(buf).metadata();
  if (meta.width !== 1536 || meta.height !== 1024) throw new Error(`unexpected size ${meta.width}x${meta.height} ${item.file}`);
  for (const w of WIDTHS) {
    if (existsSync(out(item.id, w))) throw new Error(`refusing to overwrite ${out(item.id, w)}`);
    const info = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(out(item.id, w));
    console.log(`${item.id} ${path.basename(out(item.id, w))} ${info.width}x${info.height} ${info.size}B sha=${sha}`);
  }
}
