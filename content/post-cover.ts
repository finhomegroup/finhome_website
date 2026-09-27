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
 */
export function postCover(post: Post): string {
  return post.cover ?? SITE.ogImage;
}
