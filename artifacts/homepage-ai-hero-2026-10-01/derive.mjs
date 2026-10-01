// Homepage AI hero (2026-10-01): plain sharp WebP resizes of the accepted
// source PNG, full frame — no crop, no retouch, no upscale (1595 = source
// width). Verifies the source SHA-256 first; never overwrites.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sharp = createRequire(path.join(ROOT, "node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json"))("sharp");
const SRC = path.join(ROOT, "artifacts/homepage-ai-hero-2026-10-01/homepage-hero-original.png");
const SHA = "4eec3eb89ee4a4ad2d05c4c476b3ae43c25707ef0f7fd502af82ba4d82455ceb";

const buf = readFileSync(SRC);
if (createHash("sha256").update(buf).digest("hex") !== SHA) throw new Error("source sha mismatch");
const meta = await sharp(buf).metadata();
if (meta.width !== 1595 || meta.height !== 986) throw new Error(`unexpected size ${meta.width}x${meta.height}`);
for (const w of [800, 1200, 1595]) {
  const out = path.join(ROOT, "public/images/home", `ai-hero-couple-${w}.webp`);
  if (existsSync(out)) throw new Error(`refusing to overwrite ${out}`);
  const info = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(out);
  console.log(`${path.basename(out)} ${info.width}x${info.height} ${info.size}B`);
}
