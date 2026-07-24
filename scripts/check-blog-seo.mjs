import { readFileSync } from "node:fs";

const t = readFileSync("content/posts.ts", "utf8");
const re =
  /slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?excerpt:\s*"([^"]+)"/g;
const posts = [];
for (const m of t.matchAll(re)) {
  posts.push({
    slug: m[1],
    titleLen: [...m[2]].length,
    excerptLen: [...m[3]].length,
    title: m[2],
    excerpt: m[3],
  });
}
console.log(
  posts
    .map(
      (p) =>
        `${p.slug}\n  title ${p.titleLen}c | excerpt ${p.excerptLen}c${p.excerptLen > 160 ? " ⚠️" : ""}${p.titleLen > 60 ? " (title long)" : ""}`,
    )
    .join("\n"),
);
console.log(
  `\nover160 excerpts: ${posts.filter((p) => p.excerptLen > 160).length}/${posts.length}`,
);
console.log(
  `titleOver60: ${posts.filter((p) => p.titleLen > 60).length}/${posts.length}`,
);
