# AI web heroes — implemented and gated locally, not released

## Publication (2026-10-01) — phase 1 only: PR opened, NOT merged

The user authorized "commit and merge" in two phases. Phase 1 has been done by Claude Code:
commit, push and a pull request to `main` covering the homepage hero and the 31 education
surfaces. **Merge is NOT done**: it waits for Codex's independent review of the actual PR head
and diff, green GitHub checks (`gate`, Vercel), and an explicit merge hand-back. No manual
deployment. The PR body lists the exact paths, dependencies included and excluded, and the
local gate.

- **Included in the commit:** the implementation and tests, the 90 WebP derivatives, the three derive scripts, and the two scoped recaps plus Codex's verification document.
  The WebPs break down as 24 library (03–10), 63 supplement (21 articles × 3) and 3 homepage.
  The derive scripts are `artifacts/ai-web-heroes-2026-10-01/derive.mjs`, `derive-supplement.mjs` and `artifacts/homepage-ai-hero-2026-10-01/derive.mjs`; they contain no absolute paths.
- **Excluded (local only):**
  - The generated PNG originals (about 2 MB each).
  - The artifact manifests: they hold absolute local generator paths. Hashes, origins and dimensions are recorded in the tracked registries instead (`content/education-web-heroes.ts`, `content/home.ts`).
  - Screenshots, the library ZIP and gallery, older artifact trees, the two rejected people JPGs, `docs/collection-hero-2026-10-01.md`, logs, `out/` and `node_modules`.
  - The tests that read those local files are `it.runIf(existsSync(...))`. They skip in a clean checkout; every other assertion runs from tracked files.

> 2026-10-01 later: the HOMEPAGE hero was also replaced, separately and outside this education scope.
> See `docs/homepage-photo-preview.md` → "CURRENT — homepage hero image replaced by an AI illustration".
> Its gate (`/tmp/finhome-homepage-ai-hero-full.log`, passed) also covers this 31-surface work unchanged.

## Current state (Claude, 2026-10-01 ~19:15 Asia/Saigon)

Scope confirmed by the user: all 7 "Tính thử trước khi quyết định" guides, the
"Mua nhà bằng con số" page, AND all 23 collection articles (31 surfaces). Not
committed, pushed or deployed.

**Full native gate PASSED after the mobile collection repair** with `aiws native check finhome-website --task auto-education-20260930 --mode full`.
- Run: Node 24.21, 2026-10-01T12:13:10Z–12:14:43Z, exit 0.
- vitest: 365 files, 8,154 tests. `tsc` clean. Lint: 0 new against the baseline 3.
- `next build` produced 310 static pages; `check:markup` reports all rendered contracts hold.
- Log: `/tmp/finhome-ai-heroes-full-3.log`. Earlier runs: `-full.log`, and `-full-2.log` after the C01 repair.
- Only this document changed afterwards.
- This is source/markup evidence only. Claude ran no browser.

**Mobile collection repair (after Codex's final review).** Evidence: `artifacts/ai-web-heroes-2026-10-01/collection-mobile-final.jpg`.
At 390 px the old below-`lg` crop cut both heads at the top edge: a 5:3 box with the image at 143% width, −31% left, −10% top.
- Below `lg`, the photo box is now `aspect-[3/2]`, the frame's own ratio.
- The image is `absolute inset-0 h-full w-full -scale-x-100`. It is still mirrored, with no zoom, offset or crop rule.
- So the whole frame shows, including both complete heads with the frame's own headroom.
- Desktop is unchanged: the box keeps `lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[64%]`,
  the image keeps `lg:object-cover lg:object-[50%_30%]`, and the overlay token and gradient are untouched.
- A new test in `collection-hero.test.ts` locks this:
  - base box ratio equals the 1536 × 1024 source;
  - no zoom width, offset or `object-*` below `lg`;
  - the lg rules are unchanged.
- **Independently re-observed by Codex after the repair:** mobile 390 × 844 shows the complete frame and both heads with headroom; image/frame both 350 × 233.33 CSS px, loaded, no horizontal overflow. Tablet 1024 × 900 and desktop 1440 × 1000 were also rechecked; the gradient and faces remain correct. Final screenshots overwrite the pre-repair `collection-*-final.jpg` files. See [independent verification](ai-web-heroes-verification-2026-10-01.md).

**Codex's browser verification, as reported to Claude (Claude did not observe these):**
- All 23 article heroes and all 7 guide heroes at 1440 and 390 px.
- C01's full-width balance figure: after the section's paragraphs, before the tool capture.
- No overflow.
- Collection hero at tablet 1024 and desktop 1440: pass.
- Before the mobile repair, the collection hero at 390 cropped both heads, which is what was fixed above.

**Codex's earlier browser review (historical, before the C01 repair), as reported to Claude:**
- Accepted: C09/C10 logo-free edits; C19/C20 read as thoughtful, not distressed.
- C19's background man's hair is near the top edge, but his face is complete in the full-frame rendering.
- The 31-source mapping is kept.
- One repair was requested, below; Codex has since re-verified it (above).

**C01 repair (2026-10-01, after Codex's review):** the article opened with the 768-px people hero and then a
576-px concept illustration before the contents.
- The AI hero stays after the answer and early tool link.
- The original balance illustration now renders INSIDE the body section
  "Có 600 triệu, không có nghĩa dùng cả 600 triệu trả trước". That is the section whose text keeps the
  100 triệu reserve separate. The figure comes after all its paragraphs and before that section's tool capture.
- It is now at full article-column width, with the same image, badge, alt and sentence caption.
- Mechanism: a new optional `illustration.inSection` (a section heading). The build fails if that heading does not exist.
  The figure markup moved into one `IllustrationFigure` helper.
- C05/C11 have no `inSection` and stay in the opening slot.
- All financial text is unchanged. The placement tests now assert the new order.
- Limit: C01's illustration ships only as 720/1200 WebP. At 48rem on a 2× screen the browser uses 1200 px, slightly under 2×.
- The `GuideHero` comment was corrected: only the title block and header tool button precede a guide's hero; its first answer paragraph comes after.

- **Wired, 31 of 31 surfaces:**
  - 7 guides and the collection page: library images 03–10, unchanged mapping.
  - C05/C11: their already-approved 01/02 illustrations, unchanged.
  - 21 articles from Codex's supplement: C01–C04, C06–C10, C12–C23.
  - All supplement images were derived with sharp by `artifacts/ai-web-heroes-2026-10-01/derive-supplement.mjs`.
    The script merges `manifest.json`, `manifest-c16-c23.json` and `manifest-logo-cleanup.json`.
  - Each became 720/1200/1536 WebP at `public/images/education/hero-cNN-{w}.webp`, 24–187 KB.
    The full 3:2 frame is kept: no crop, no upscale.
  - Each derivative was re-encoded from a source verified as 1536×1024. The source SHA-256 is recorded in `content/education-web-heroes.ts`.
  - **C09 and C10 use Codex's logo-free `*-hero-clean.png` edits**; their earlier WebPs were regenerated from those.
    The original PNGs stay in the artifact folder, unused.
  - `PENDING_ARTICLE_HEROES` is now empty, and a RELEASE test asserts that.
- **Registry and renderer:**
  - `content/education-web-heroes.ts` now has an `origin` of either `library` (n, file) or `supplement` (id, file).
    `compositionReference` is `null` for supplement images, which were made from a prompt alone, so they carry no stock credit.
    It also gains `ARTICLE_WEB_HEROES`, `ALL_WEB_HEROES`, `articleHero()` and `PENDING_ARTICLE_HEROES`.
  - `components/education/web-hero.tsx` adds `ArticleHero`. It uses the same full-column treatment as C05/C11:
    natural 3:2, no crop box, sizes 48rem, small "Ảnh minh họa AI" caption.
  - `education-article.tsx` renders it after the short answer and the early tool link, before the contents.
    So neither the answer nor the tool button is pushed down.
  - C01's balance illustration: see the repair above. It is no longer stacked under the hero.
  - Charts, examples, text and CTAs are unchanged.
- **(Historical, earlier this evening) the nine tests reported failing, repaired without weakening safeguards:**
  - `collection-hero.test.ts` (6): provenance now asserts the registered AI image.
    That covers library 03, its SHA, the composition reference, the AI tagline, no Pexels credit, the alt rules, and that only the registry names its file.
    It also asserts the retired photo is gone from the page.
    The overlay geometry model is kept, re-described for the mirrored face position. The markup checks the srcset, the mirror and the preload.
  - `loan-decision-series.test.ts` (1): the retired 7592756 is still guarded against reuse, via `RETIRED_RELEASED`.
    The non-vacuity check now uses only IDs read from live files, and asserts the collection page has no Pexels ID.
  - `education-web-heroes.test.ts` (2):
    - The hero's own image now counts once in the article body and never in the related cards.
    - The guide-card parser uses an anchor regex that accepts Next's slash-less `href`.
- **Independent scoped browser verification is complete:** see the linked verification report. Claude implemented and ran the source gate; Codex observed the browser. Neither establishes a production deployment.
- **Unchanged:** news, homepage, tools and formulas, social posters/exports, and share images.
  Guides still share their exported cover; the 21 education articles still use the site card.
  Changing share images is a separate decision.

## Scope and authority (historical — the scope question is since answered: all 31 surfaces)

User approved upgrading web heroes with AI-generated people after limiting the article scope to “Tính thử trước khi quyết định” and “Mua nhà bằng con số”. No deployment, Git publication, social posting or formula change is authorized by this turn. Implementation owner: native Claude Code session b81214ea-9fd3-4a62-8706-a685bee41ee0; Codex owns image generation and independent browser/check evidence.

At the earlier handoff, an optional scope question was unresolved and only seven guides plus the collection were implemented. The user's subsequent request explicitly included all 23 collection articles; the completed current scope is the 31 surfaces listed above.

## Earlier state (historical — superseded by the current state above; the session-quota stop and the C16–C23 "pending" status no longer apply)

- Claude wired the existing AI library images03–10 into seven guide articles, their discovery/related thumbnails and collection hero;24 responsive WebP derivatives at720/1200/1536. New modules: content/education-web-heroes.ts and components/education/web-hero.tsx.
- Each of these eight surfaces has a different source image. Titles/logo stay HTML; a small “Ảnh minh họa AI” tagline is shown. Stock credit removed from the seven article bodies because their web hero is now generated; original social posters/share covers remain unchanged.
- Collection retains the seamless green gradient; its new image is mirrored and crop-adjusted. The former stock original and derivatives remain deliberately retained for rollback/provenance.
- C05/C11 keep their previously released AI illustrations. The remaining collection article bodies, tools, formulas, homepage and news are unchanged.
- Claude stopped with a SESSION QUOTA error, reported reset18:20 Asia/Saigon. Process ended exit1. Do not restart a competing implementation owner without user direction.
- Codex generated13 supplemental source images with built-in image_gen for C01/C02/C03/C04/C06/C07/C08/C09/C10/C12/C13/C14/C15. Saved under artifacts/ai-web-heroes-2026-10-01/generated-supplement/ with manifest/prompt set. They were visually inspected but are NOT wired into the product. C16–C23 supplemental images were not generated.

## Independent verification after Claude stopped (historical; its nine failures are repaired above)

Full native check: aiws native check finhome-website --task auto-education-20260930 --mode full, Node24, 2026-10-01T08:29:41Z–08:30:13Z. FAILED at vitest:8138 passed,9 failed;362 files passed,3 failed. Later typecheck/lint/build/markup steps did not execute. Do not call this release-ready.

Failures for Claude to repair without weakening substantive safeguards:

1. Six in components/education/collection-hero.test.ts still depend on removed stock-photo fields and Pexels7592756. Update to scoped approved AI provenance, image dimensions/crop, markup, distinctness and priority assertions.
2. content/loan-decision-series.test.ts shipped-source non-vacuity guard still expects retired collection stock7592756. Preserve the real-photo safeguards for untouched social packages; account for the collection’s explicit source replacement.
3. Two in content/education-web-heroes.test.ts: whole-page AI img count counts related cards as well as hero (actual4, expected1); guide-block link parser yields an undefined image. Scope assertions to the actual hero and guide-card elements, not broad string slices. Browser below confirms the seven guide images exist; this does not itself prove tests correct.

Codex actual local UI, Next dev on127.0.0.1:3274, after final code edit:

- Auto article1440×1000 and390×844: hero spans768/350CSSpx, both faces visible, header tool CTA before image, small tagline, no horizontal overflow.
- Collection1440×1000 and390×844: both faces visible, text readable, no hard gradient seam, no horizontal overflow.
- Blog guide block390×844: expanded all7; all7 distinct WebP images loaded, no horizontal overflow; screenshot includes first6cards, the seventh was DOM-verified only.
- Not verified this turn: all seven article hero crops independently, keyboard/Back/tool handoffs after change, tablet breakpoint, console audit, production build or production UI, all23 education article hero implementation.
- Screenshots: artifacts/ai-web-heroes-2026-10-01/{auto-desktop-draft,auto-mobile-draft,collection-desktop-draft,collection-mobile-draft,guides-mobile-draft}.jpg.

## Next authorized step

Implementation and scoped local verification are complete. Await the user's publication decision before commit, push, PR or deployment. Preserve the diagrams, financial examples, CTA routes and excluded news/tool/formula scope. Source PNGs, responsive derivatives, generation manifests and screenshots are deliberately retained for provenance, rollback and review; no unrelated cleanup was performed.

Existing dirty docs/collection-hero-2026-10-01.md and old untracked artifacts/photos remain untouched. No commit, push, PR or deploy performed. Local dev session55152 remains for user preview; old3272 static preview serves earlier built output, not these source edits.
