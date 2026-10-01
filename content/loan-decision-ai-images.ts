// The two AI illustrations approved for the loan-decision packages (C05, C11).
//
// Delivery data, not a product surface: read by
// `content/loan-decision-series.test.ts` and mirrored in
// docs/loan-decision-education-2026-10-01.md. No runtime page imports it.
//
// EDITORIAL EXCEPTION, user-approved 2026-10-01, for these two packages only.
// The seo-blog "real people" rule and the ten-package Pexels rule are
// unchanged (content/tool-education-series.test.ts still enforces them).
//
// Only what a clean checkout needs is kept here. The full ten-image library —
// prompts, local reference paths, generated-file paths — is a LOCAL artifact
// (artifacts/ai-people-library-2026-10-01/manifest.json), optional and never
// required in production or CI.

export type LoanDecisionAiImage = {
  /** Social package directory and tool slug. */
  tool: string;
  /** Canonical article slug. */
  article: string;
  /** Position and file name in the local library. */
  libraryImage: { n: number; file: string };
  /** SHA-256 of the generated PNG the web files were derived from. */
  generatedSha256: string;
  /** Pixel size of the generated PNG and of the 1536 derivative. */
  size: { w: number; h: number };
  /**
   * Public files. `poster` is the EXACT generated PNG (byte-identical, same
   * SHA-256 — no JPEG resave), used by the social poster in 1080 and ?hd 2x
   * modes; `article` and `share` are sips JPEG resizes, no other edits.
   */
  web: { poster: string; article: readonly [string, string, string]; share: string };
  /** The stock photo used ONLY as a composition reference — not the output's author. */
  compositionReference: { pexelsId: string; url: string; creator: string; licence: string; licenceRecorded: string };
  approvedOn: string;
};

const web = (base: string) => ({
  poster: `/images/education/${base}-original.png`,
  // 720 / 1200 / 1536 widths for the full-column article figure.
  article: [`/images/education/${base}-720.jpg`, `/images/education/${base}-1200.jpg`, `/images/education/${base}-1536.jpg`] as const,
  share: `/images/education/${base}-1200.jpg`,
});

export const LOAN_DECISION_AI_IMAGES: readonly LoanDecisionAiImage[] = [
  {
    tool: "so-sanh-khoan-vay",
    article: "hai-goi-vay-thang-thap-co-re-hon",
    libraryImage: { n: 1, file: "images/01-home-planning.png" },
    generatedSha256: "1774ea5bd46715b202bced68dcfd3ad96b228d09fe28e03459bc62829408677d",
    size: { w: 1536, h: 1024 },
    web: web("ai-library-01-home-planning"),
    compositionReference: {
      pexelsId: "7592743",
      url: "https://www.pexels.com/photo/asian-couple-on-sofa-in-living-room-7592743/",
      creator: "Miriam Alonso",
      licence: "https://www.pexels.com/license/",
      licenceRecorded: "2026-10-01",
    },
    approvedOn: "2026-10-01",
  },
  {
    tool: "lai-co-dinh-hay-tha-noi",
    article: "lai-co-dinh-hay-tha-noi",
    libraryImage: { n: 2, file: "images/02-couple-calm-confidence.png" },
    generatedSha256: "e1b748bacc633e8889370e0ec2f29e53063eb963cc62b969745c4a328bbcaced",
    size: { w: 1536, h: 1024 },
    web: web("ai-library-02-couple-calm-confidence"),
    compositionReference: {
      pexelsId: "7593066",
      url: "https://www.pexels.com/photo/cheerful-asian-couple-resting-on-sofa-with-laptop-7593066/",
      creator: "Miriam Alonso",
      licence: "https://www.pexels.com/license/",
      licenceRecorded: "2026-10-01",
    },
    approvedOn: "2026-10-01",
  },
];
