import type { VercelRequest, VercelResponse } from "@vercel/node";
import { POSTS } from "../content/posts.js";
import { BLOG_PAGE_SIZE } from "../content/blog-pagination.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const pageCount = Math.max(1, Math.ceil(POSTS.length / BLOG_PAGE_SIZE));
  const requested = Number(req.query.page) || 1;
  const page = Math.min(Math.max(requested, 1), pageCount);
  const posts = POSTS.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);

  res.setHeader(
    "Cache-Control",
    "public, max-age=300, stale-while-revalidate=3600",
  );
  res.status(200).json({ posts, page, pageCount, total: POSTS.length });
}
