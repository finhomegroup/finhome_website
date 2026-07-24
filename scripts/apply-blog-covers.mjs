import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const coversPath = path.join(root, "public", "images", "blog", "covers.json");
const postsPath = path.join(root, "content", "posts.ts");

const covers = JSON.parse(await fs.readFile(coversPath, "utf8"));
let s = await fs.readFile(postsPath, "utf8");

for (const c of covers) {
  if (!c.cover) continue;
  const re = new RegExp(
    `(slug:\\s*"${c.slug}"[\\s\\S]*?cover:\\s*")[^"]+(")`,
  );
  if (!re.test(s)) {
    console.error("no match", c.slug);
    process.exit(1);
  }
  s = s.replace(re, `$1${c.cover}$2`);
  console.log(c.slug, "->", c.cover);
}

await fs.writeFile(postsPath, s);
await fs.unlink(coversPath);
console.log("updated posts.ts, removed covers.json");
