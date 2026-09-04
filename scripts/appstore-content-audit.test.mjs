import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const PUBLIC_POST_CONSUMERS = [
  "api/blog-posts.ts",
  "app/blog/page.tsx",
  "app/blog/[slug]/page.tsx",
  "app/sitemap.ts",
  "components/sections/news.tsx",
];

const PROVIDER_CONTENT =
  /(vietcombank|vietinbank|bidv|agribank|seabank|techcombank|vpbank|mbbank|mb bank|acb|sacombank|hdbank|tpbank|\bvib\b|ocb|shinhan|woori|hsbc|standard chartered)/i;

async function loadPostsModule() {
  const source = await readFile(new URL("../content/posts.ts", import.meta.url), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
}

test("every public blog surface uses the planning-only post collection", async () => {
  for (const file of PUBLIC_POST_CONSUMERS) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /\bPUBLIC_POSTS\b/, `${file} does not use PUBLIC_POSTS`);
    assert.doesNotMatch(
      source,
      /import\s*\{[^}]*\bPOSTS\b[^}]*\}\s*from/,
      `${file} imports the unfiltered POSTS collection`,
    );
  }
});

test("evaluated public posts exclude named providers and provider products", async () => {
  const { POSTS, PUBLIC_POSTS, getPost } = await loadPostsModule();
  assert.ok(POSTS.length > PUBLIC_POSTS.length, "audit corpus has no blocked fixtures");

  for (const post of PUBLIC_POSTS) {
    const body = await readFile(
      new URL(`../content/posts/${post.slug}.md`, import.meta.url),
      "utf8",
    );
    const publicSurface = [
      post.slug,
      post.title,
      post.excerpt,
      post.cover,
      post.source?.name ?? "",
      body,
    ].join("\n");
    assert.doesNotMatch(
      publicSurface,
      PROVIDER_CONTENT,
      `${post.slug} exposes a provider identity or product`,
    );
    assert.equal(getPost(post.slug)?.slug, post.slug);
  }

  for (const slug of [
    "agribank-bidv-ncb-dieu-chinh-lai-sau-chi-dao-ngan-hang-nha-nuoc",
    "bidv-seabank-dieu-chinh-lai-suat-6-8",
    "vietinbank-ban-toa-thap-ciputra",
  ]) {
    assert.equal(getPost(slug), undefined, `${slug} remains publicly routable`);
  }
});
