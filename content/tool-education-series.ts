// The 2026-09-30 tool education series: ten tools with an interactive visual,
// each mapped to ONE canonical article and ONE public social package.
//
// Delivery data, not a product surface. It is read by
// `content/tool-education-series.test.ts` (existence, links, figures) and
// mirrored by `docs/tool-education-series-2026-09-30.md` and
// `public/social/index.html`. No runtime page imports it.
//
// `reuse` points at an existing "Mua nhà bằng con số" article whose declared
// household is kept; `new` is a standalone Markdown guide whose example is
// the tool's own shipped default, so "Tính với số của tôi" opens the tool on
// exactly the article's figures with no URL state.

export type SeriesEntry = {
  /** Registry slug of the tool; also the social package directory. */
  tool: string;
  /** Canonical article slug under /blog/. */
  article: string;
  kind: "reuse" | "new";
  /** Images a new guide references that Codex exports from the package HTML. */
  exports: readonly { file: string; width: number; height: number; mode: string }[];
};

const guideImages = (slug: string) => [
  { file: `public/images/blog/${slug}-cover.png`, width: 1200, height: 630, mode: "?cover" },
  { file: `public/images/blog/${slug}-flow.png`, width: 960, height: 510, mode: "?flow" },
];

export const TOOL_EDUCATION_SERIES: readonly SeriesEntry[] = [
  { tool: "ke-hoach-huu-tri", article: "de-danh-huu-tri-tien-du-den-bao-nhieu-tuoi", kind: "new", exports: guideImages("de-danh-huu-tri-tien-du-den-bao-nhieu-tuoi") },
  { tool: "lai-kep", article: "lai-kep-bao-nhieu-la-tien-ban-tu-gop", kind: "new", exports: guideImages("lai-kep-bao-nhieu-la-tien-ban-tu-gop") },
  { tool: "muc-tieu-tiet-kiem", article: "du-tien-tra-truoc-sau-3-nam", kind: "reuse", exports: [] },
  { tool: "tien-gui-co-ky-han", article: "can-tien-truoc-dao-han-mat-bao-nhieu-lai", kind: "new", exports: guideImages("can-tien-truoc-dao-han-mat-bao-nhieu-lai") },
  { tool: "kha-nang-mua-nha", article: "co-600-trieu-nen-tim-nha-tam-gia-nao", kind: "reuse", exports: [] },
  { tool: "vay-mua-nha", article: "vay-2-ty-moi-thang-tra-bao-nhieu", kind: "reuse", exports: [] },
  { tool: "lai-suat-tha-noi", article: "het-uu-dai-khoan-tra-tang-bao-nhieu", kind: "reuse", exports: [] },
  { tool: "tinh-phan-tram", article: "lai-tu-7-len-9-tang-2-hay-28-phan-tram", kind: "new", exports: guideImages("lai-tu-7-len-9-tang-2-hay-28-phan-tram") },
  { tool: "giam-gia-va-thue", article: "giam-20-roi-giam-10-co-phai-giam-30", kind: "new", exports: guideImages("giam-20-roi-giam-10-co-phai-giam-30") },
  { tool: "margin-va-markup", article: "cong-40-vao-gia-von-co-phai-lai-40", kind: "new", exports: guideImages("cong-40-vao-gia-von-co-phai-lai-40") },
];

/**
 * Social packages whose `poster.png` (and, for a new guide, cover and flow
 * PNGs) are NOT exported yet. The test requires every listed package to have
 * NO poster.png yet, and every other package to have all its PNGs with the
 * right signature and size. EMPTY since 2026-09-30: all 22 files exist
 * (Codex browser captures, converted JPEG → PNG). The release test requires it
 * to stay empty, so a new package must ship its exports with it.
 */
export const PENDING_EXPORTS: readonly string[] = [];
