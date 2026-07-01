/**
 * Hover tokens — extracted from News section (#tintuc) as the reference.
 * Cards: shadow lift. Images: subtle zoom inside `.group`. Links: opacity fade.
 */

/** Base + hover shadow on white cards — includes hand cursor on hover targets. */
export const FH_CARD_SHADOW =
  "cursor-pointer shadow-[0_1px_20px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]";

/** Pointer hand on clickable / interactive targets. */
export const FH_POINTER = "cursor-pointer";

/** Clickable card — alias for card links (same as FH_CARD_SHADOW). */
export const FH_CLICKABLE_CARD = FH_CARD_SHADOW;

/** Cover image zoom — parent must have `group`. */
export const FH_CARD_IMAGE_ZOOM =
  "transition-transform duration-300 group-hover:scale-[1.02]";

/** Text CTA link (e.g. "Xem thêm"). */
export const FH_LINK_OPACITY = `transition-opacity hover:opacity-70 ${FH_POINTER}`;

/** Arrow icon inside `group/link` wrapper. */
export const FH_LINK_ARROW =
  "transition-transform duration-300 group-hover/link:translate-x-0.5";

/** Input / form field — same shadow lift as cards on hover. */
export const FH_INPUT_SHADOW =
  "transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]";
