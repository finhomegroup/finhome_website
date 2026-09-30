---
name: seo-blog
description: >-
  Write and review reader-first Vietnamese FinHome blog and education content,
  including collection copy, tool examples, visuals, qualifications, acquisition
  calls to action and article SEO. Use when drafting, reviewing or editing website
  articles, shared editorial labels or blog metadata.
---

# FinHome Blog — Reader-first Writing and SEO

## When to use

- Adding/editing `content/posts.ts` or `content/posts/*.md`
- Drafting/reviewing `content/education/**`, collection copy or shared article labels
- Changing `app/blog/**` or article schema
- User asks to "SEO blog", "optimize HTML bài viết", or publish roundups

## Reader-first contract

Help a first-home buyer understand a question, interpret evidence and take a useful
next step. Lead with what the reader needs, not a defence of what FinHome wrote.
This capability is shared across agents through the repository's `AGENTS.md`;
it is not a separate Cursor-only editorial policy.

### Voice and comprehension

- Write clear, conversational Vietnamese for an adult unfamiliar with finance.
  "Explain like I'm 5" means simple words and concrete examples, not baby talk,
  oversimplified promises or a lecture about the reader being wrong.
- Open with the reader's situation or question and a useful answer. Avoid category
  negation ("Đây không phải tin tức"), unprompted self-defence ("Đây không phải lỗi
  của ai"), praise of our process or comparisons that dismiss other content.
- Explain the distinction directly: "Mỗi lần trả nợ gồm gốc và lãi" is more useful
  than announcing that nobody is at fault. Define unfamiliar terms at first use.
- Prefer short paragraphs and headings that tell the reader something. Keep one
  main decision per article; SEO terms serve that decision, not the other way round.
- In running prose, use rounded triệu/tỷ and "khoảng" where appropriate. Preserve
  precise values, units and assumptions in the result table/detail. Verify the
  rounding against the same calculation; never replace the underlying fixture with
  a rounded number or round away a threshold that changes the decision.

### Examples, charts and reflection

For a tool-backed guide, connect: reader question → declared example → result and
visual → meaning for the household → try with the reader's own numbers. Adapt the
order to the question; do not force every news report into a calculator tutorial.

- Choose a chart that explains the decision, not decoration. Tell readers what to
  look at and what the difference means. Supply a readable text/table alternative.
- Capture actual tool results using the declared inputs. An illustration or mock
  must be labelled as such; do not present it as observed UI or calculated output.
- Keep the article's household, prose, screenshot, chart, exercise and related
  article references consistent. If examples differ, explain the difference at
  the transition, or use one scenario. Updating one article can stale another.
- Give one useful experiment, such as changing the term or monthly contribution,
  and a reflection question about what changed. A tool click alone is not learning.

### Qualifications without self-justification

Do not ban the word "không" or remove safeguards to make copy sound confident.
Use the reader's likely misunderstanding to decide where a qualification belongs.

| Content | Treatment |
| --- | --- |
| "Đây không phải tin tức" in a collection introduction | Replace with the question the collection helps answer; internal taxonomy stays internal. |
| "Được vay không có nghĩa nên vay hết" | Keep the useful distinction; explain it with household cash flow. |
| "Đây là kịch bản, không phải dự báo lãi suất" beside a projection | Keep near the result, with the assumed rate and period visible. |
| "Bài này không trả lời được gì" as a repeated heading | Prefer an action-oriented heading such as "Đối chiếu trước khi quyết định"; retain the substantive limits. |
| Long repeated explanations of tests or AI assistance | Keep truthful provenance in its designated section; shorten repetition, never fabricate or erase a material review limitation. |

Place conditions that change a conclusion beside that conclusion, even in a short
answer. Secondary details can follow. A generic end disclaimer cannot repair an
unsupported headline or a simulation described as a real contract outcome.
Keep source attribution and relevant jurisdiction/date context. Verify current
rates, law, fees and market availability from appropriate sources when making or
updating those claims; a calculator test does not validate them. Label hypotheses
as hypotheses and avoid inferring eligibility, bank approval, safety or available
housing from an illustrative affordability result.

### Acquisition through education

The free standalone website tools let readers try what they learned. The app is
the connected journey, not a reason to withhold the article's answer. Offer the
relevant next tool in context. Mention an app action only when implemented and its
destination is verified; do not invent store links, account saving or data transfer.

### Social imagery (FinHome publishing rule)

**Invariant.** Every social post (poster, share card, or article cover exported
from a social package) has **real people** as its hero image, and each post in
a set uses a **different source photograph** — a different crop of the same file
is not a different photo, and a new set should not reuse a photo already shipped
in a released package. Exact figures and diagrams are supporting content, never a
number-only or 3D-only hero.

- People are used only when the **source's own metadata** (title, tags or
  description) identifies them as Asian; nationality or ethnicity is never
  inferred from appearance or invented in copy or alt text.
- Rights are clear and recorded: source licence (e.g. Pexels), photographer,
  source page, licence URL, check date, project filename and intended use. The
  post shows a visible credit ("Ảnh minh họa: Tên / Pexels") and says the people
  are illustrative, not a customer, case study or endorsement.
- The source file stays unmodified in `public/images/...`; crop per photo so
  faces stay visible and clear of the headline in every exported size; exclude
  brand marks or printed words that could imply endorsement, and do not mirror a
  photo that shows readable text. Alt text describes only what is in frame.
- An identifiable person is never tied to real debt, distress or business
  results; the fictional example must read as fictional beside the photo.
- AI-generated imagery may supplement only when approved, is disclosed as
  synthetic, and is never presented as a real person; images a source labels as
  AI-generated are not "real people".

**What checking guarantees.** The editorial checklist and project tests can
confirm presence and provenance: a people photo in each hero, distinct source
IDs, credit, licence and illustrative wording, and no excluded file.

**What it does not guarantee.** It cannot establish anyone's identity or
ethnicity, an actual customer endorsement, legal clearance beyond the recorded
licence, or visual acceptance of a crop — those need a human look at the
rendered output. Publishing, and any exception to this rule, remain a human
editorial decision. Dated asset lists belong in the delivery recap, not here.

## Review and verification

1. Resolve the actual article data, registry and shared copy before reviewing. For
   education, use `articles.ts`, `types.ts`, `collection.ts` and `groups.ts`; for
   news, use `posts.ts` and the Markdown bodies. Report what was read in depth
   versus mechanically screened; neither is a live UI or legal verification.
2. Read as a buyer: after the opening, can I say what this helps me decide? After
   the example, can I explain the result? At the end, do I know what to try next?
3. Separate priority findings: misleading/unsupported claims or mismatched examples
   first; obstructive prose and number density next; cosmetic repetition after that.
   Give the passage, reader impact and proposed rewrite; label source rechecks still
   needed. Do not silently rewrite a review-only assignment.
4. For education edits, preserve `types.ts` structure, computed visuals, declared
   emphasis and glossary references. Run relevant article, financial-semantics,
   reading-comprehension, reading-time and visual-reference tests, then the owning
   project gate. Inspect changed rendered pages when claiming readability/layout.
5. Review the prose semantically. Existing tests check structure and selected
   numerical properties, not writing quality; do not add a blanket negative-word
   ban or weaken a numerical/safety test to pass a style change.

These instructions standardize drafting and review decisions. They do not guarantee
comprehension, financial suitability, conversion lift or compliance, and they do not
automatically enforce tone. Human editorial acceptance and publication authority
remain separate from passing tests or an AI review.

## Hard rules

1. **Canonical** on FinHome: `/blog/<slug>/` via `canonicalPath` (trailing slash).
2. **Do not republish** full third-party articles. Write FinHome summaries + cite `source` (SEO stays on FinHome).
3. **List/home cards always link to** `/blog/<slug>` — never send primary traffic straight to the publisher.
4. **One H1** = post title. Body uses `##` / `###` only.
5. **Title** ≤ ~60 chars when practical; **excerpt** 120–160 chars for meta description.
6. **Cover**: local assets via `img(post.cover)` (`/images/blog/...` or Framer map) — do not hotlink remote URLs at runtime.
7. External links: `target="_blank"` `rel="noopener noreferrer"` (Markdown component handles this).
8. If `post.source` exists, page must show `SourceAttribution` and schema `isBasedOn` / `citation`.
9. After implementation changes: run the project gate under the required Node version
   (see `AGENTS.md`), and confirm `out/blog/<slug>/index.html` has title, description,
   canonical and JSON-LD Article. Documentation-only capability updates use the
   skill validator and the project-required verification; they do not prove live UI.

## Checklist per new post

- [ ] Unique `slug` kebab-case Vietnamese ASCII
- [ ] `date` ISO; `readingTime` set
- [ ] Original title + excerpt (not a verbatim source headline dump)
- [ ] Opening answers a reader need; any qualification has a concrete purpose
- [ ] Tool guide: declared example → readable visual/result → explanation → experiment
- [ ] Source roundup: context → takeaways → buyer relevance → original-source link
- [ ] Source metadata matches the content type: roundup `source`, education `sources`
- [ ] Assumptions, results, screenshots and cross-article references agree
- [ ] Appears in `POSTS` (sitemap picks it up automatically)
- [ ] No scraped copyrighted image or long pasted quotes

## HTML / metadata map

| Concern | Where |
|--------|--------|
| Title / description / OG / Twitter | `generateMetadata` in `app/blog/[slug]/page.tsx` |
| Article JSON-LD | `articleSchema` + `JsonLd` |
| List page | `app/blog/page.tsx` metadata |
| Sitemap | `app/sitemap.ts` reads `POSTS` |
