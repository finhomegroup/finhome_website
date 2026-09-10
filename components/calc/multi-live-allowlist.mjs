// The single source of truth for calculator pages allowed more than one live
// ARIA results region — the one documented exception to the suite's "one
// live ResultGroup per page" convention (docs §4).
//
// Two checkers key this same business decision two different ways, because
// they read two different artifacts:
//   - components/calc/live-region.test.ts reads SOURCE and keys by component
//     filename (`components/<filename>`).
//   - scripts/check-built-markup.mjs reads the BUILT export and keys by route
//     slug (`out/cong-cu/<slug>/index.html`).
// Both import this array instead of hard-coding their own copy, so adding or
// removing an exception is one edit, not two edits with two different keys
// that can silently drift apart.
//
// A plain .mjs so a Node script (no TypeScript, no build step) can import it
// directly, and a `.ts` vitest test can import it too — Vite/vitest resolve
// `.mjs` as plain ESM, no transform needed.
export const MULTI_LIVE_ALLOWLIST = [
  {
    filename: "rule-of-72-calculator.tsx",
    slug: "quy-tac-72",
    // How many live ResultGroups/live results regions this page may have.
    limit: 2,
    reason:
      "Stacks two INDEPENDENT tools — rate→years and years→rate — each " +
      "with its own single input and its own two output rows. Typing in " +
      "one field changes only its own region, so each announcement is two " +
      "rows. Merging them into one region would announce four rows for a " +
      "change that affected two, which is worse. This is a real exception " +
      "to the convention, not a defect; anything added here needs its own " +
      "reason on the same footing.",
  },
];
