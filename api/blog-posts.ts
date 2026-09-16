import type { VercelRequest, VercelResponse } from "@vercel/node";
import { newsPosts, type Topic } from "../content/posts.js";
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
  // News only: the education collection has its own index and must never
  // appear in a dated feed or under a market topic.
  const news = newsPosts();
  const filtered = topic ? news.filter((p) => p.topics.includes(topic)) : news;

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
