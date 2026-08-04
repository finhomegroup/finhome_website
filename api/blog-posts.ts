import type { VercelRequest, VercelResponse } from "@vercel/node";
import { POSTS, type Topic } from "../content/posts.js";
import { BLOG_PAGE_SIZE } from "../content/blog-pagination.js";
import { TOPICS } from "../content/blog-topics.js";

const TOPIC_IDS = new Set<string>(TOPICS.map((t) => t.id));

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawTopic = typeof req.query.topic === "string" ? req.query.topic : undefined;
  const topic = rawTopic && TOPIC_IDS.has(rawTopic) ? (rawTopic as Topic) : undefined;
  const filtered = topic ? POSTS.filter((p) => p.topics.includes(topic)) : POSTS;

  const pageCount = Math.max(1, Math.ceil(filtered.length / BLOG_PAGE_SIZE));
  const requested = Number(req.query.page) || 1;
  const page = Math.min(Math.max(requested, 1), pageCount);
  const posts = filtered.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);

  res.setHeader(
    "Cache-Control",
    "public, max-age=300, stale-while-revalidate=3600",
  );
  res.status(200).json({ posts, page, pageCount, total: filtered.length });
}
