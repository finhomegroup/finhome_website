import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { absUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
