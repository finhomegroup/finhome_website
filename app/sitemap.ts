import type { MetadataRoute } from "next";
import { absUrl, canonicalPath } from "@/lib/seo";
import { POSTS } from "@/content/posts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absUrl(canonicalPath("/")), changeFrequency: "weekly", priority: 1 },
    { url: absUrl(canonicalPath("/blog")), changeFrequency: "weekly", priority: 0.8 },
    { url: absUrl(canonicalPath("/vision")), changeFrequency: "monthly", priority: 0.5 },
    { url: absUrl(canonicalPath("/privacy-policy")), changeFrequency: "yearly", priority: 0.3 },
    { url: absUrl(canonicalPath("/terms")), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postEntries: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: absUrl(canonicalPath(`/blog/${post.slug}`)),
    ...(post.date ? { lastModified: post.date } : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
