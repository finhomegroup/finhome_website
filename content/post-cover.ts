// Split out of content/posts.ts so that file keeps no runtime imports: it is
// also loaded by the api/blog-posts.ts serverless function (see its header).
// This module is only bundled by Next, so the extensionless import is right.

import type { Post } from "./posts";
import { SITE } from "./site";

/**
 * The image to use for a post's share card and Article schema.
 *
 * Education articles have no photograph — their visual is a rendered SVG built
 * from the calculator's own engine — so they fall back to the site card rather
 * than to an invented stock cover. Pass the result through `img()`.
 *
 * Exception (2026-10-01, C05 and C11 only): a post may declare `ogImage`, the
 * share image of the labelled AI illustration its article already shows.
 */
export function postCover(post: Post): string {
  return post.cover ?? post.ogImage ?? SITE.ogImage;
}
