# AI web heroes — independent local verification

2026-10-01. Implementation: Claude Code. Image generation and independent browser review: Codex. Local source on branch `aiws/auto-education-20260930`, base commit `8bbc948f8bf5f64fdf9d85ebbe5c3b35df58b8d3`; changes remain uncommitted. Preview: <http://127.0.0.1:3274/blog/mua-nha-bang-con-so/>.

## Outcome and scope

- All 23 “Mua nhà bằng con số” articles have distinct AI people heroes: 21 new images plus the two previously approved C05/C11 images.
- Seven “Tính thử trước khi quyết định” guides and the collection page have distinct library heroes: 31 surfaces in total. Registry tests enforce complete, unique mapping and no pending article heroes.
- Article hero spans the reading column; financial examples, tool captures and diagrams remain. C01's concept illustration now sits full-width inside its relevant reserve-money section, not stacked before the contents.
- News, homepage, calculator logic, social exports and share images were not changed by this scope.

## Browser evidence actually observed

Codex used the in-app browser against the local Next dev server, not screenshots supplied by Claude. All 30 individual article/guide pages were opened at 1440 × 1000 and 390 × 844: **60 page/viewport checks**. Every hero loaded; all checks had no horizontal overflow. Heroes measured 768 CSS px on desktop and 350 CSS px on mobile, aligned with their reading column. Visual review covered faces, composition, tagline and surrounding content; no face was cut by the article or guide frame.

Evidence folder: `artifacts/ai-web-heroes-2026-10-01/`. Each of the 30 slugs has `{slug}-desktop.jpg` and `{slug}-mobile.jpg`.

Additional checks:

| Surface / interaction | Observed result | Screenshot |
| --- | --- | --- |
| Collection, final mobile repair | Natural 3:2 frame; both heads complete with headroom; image and frame 350 × 233.33 CSS px; loaded; no overflow | `collection-mobile-final.jpg` |
| Collection, 1024 and 1440 | Faces visible, text on solid green, no hard gradient seam | `collection-tablet-final.jpg`, `collection-desktop-final.jpg` |
| C01 after layout repair | Answer → early tool CTA → people hero → contents → reserve section paragraphs → full-width balance figure → existing tool capture | `co-600-trieu-nen-tim-nha-tam-gia-nao-{desktop,mobile}.jpg`, `c01-balance-{desktop,mobile}-final.jpg` |
| Guide hub, mobile expanded | All seven distinct guide images loaded; no overflow. Hub screenshot includes first six; seventh was also checked on its individual page | `guides-hub-mobile-final.jpg` |
| C23 article → tool | Early CTA activated with Enter reaches `/cong-cu/lai-suat-tha-noi/`; form and result exist; “Xem kết quả” brings result into viewport | `article-to-tool-mobile.jpg` |
| C23 return / exercise | Browser Back returns to article; “Xem các bước” reaches `#bai-tap`, heading visible at about 104 px from viewport top | DOM/interaction observation |
| C01 return to collection | “Quay lại Mua nhà bằng con số” reaches the collection's `#ngan-sach` chapter | DOM/interaction observation |

The C23 smoke flow returned no captured console errors at the time of inspection. This is not a full browser-console audit across every input state.

## Automated evidence after the last implementation change

`aiws native check finhome-website --task auto-education-20260930 --mode full`

- Exact execution root: this worktree. Node 24.21.0.
- 2026-10-01T12:13:10.744Z–12:14:43.397Z; exit 0.
- **365 files / 8,154 tests passed**, including fixes for the nine prior failures and new placement/no-crop assertions.
- TypeScript passed; lint had **0 new issues**, 3 existing baseline issues.
- Production build generated 310 pages; rendered markup contracts passed.
- Gate receipt: `/tmp/finhome-ai-heroes-full-3.log`, independently read by Codex. `git diff --check` clean. Only review documentation changed after this gate.

## Asset provenance and limits

Built-in imagegen generated the missing C16–C23 sources and removed unwanted logo details from C09/C10. Prompts and provenance are retained in `generated-supplement/manifest-c16-c23.json` and `manifest-logo-cleanup.json` under the evidence folder. Claude produced responsive WebP derivatives from the accepted sources; new sources are 1536 × 1024, not claimed as native Full HD. No upscaling. Old unused source PNGs are retained for provenance, not served.

Verification proves the scoped local UI and source gate, not live production, every calculator scenario, every device, or a formal accessibility/performance audit. The older C01 concept figure tops out at 1200 px, slightly below 2× density for a 768 px desktop column. No commit, push, PR, deploy or social post was performed. Local preview server remains intentionally running for review.
