import type { VercelRequest, VercelResponse } from "@vercel/node";

import {
  CATEGORY_LABELS,
  liveCalculators,
} from "../content/calculators/registry.js";

/** Public, credential-free catalogue consumed by the native app's Tool tab. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tools = liveCalculators().map((tool) => ({
    slug: tool.slug,
    title: tool.title,
    summary: tool.summary,
    category: tool.category,
    categoryLabel: CATEGORY_LABELS[tool.category],
    usRules: tool.usRules === true,
  }));

  res.setHeader(
    "Cache-Control",
    // s-maxage: cached at Vercel's edge too — a public, static catalogue must not run the
    // function for every app launch.
    "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  );
  res.status(200).json({ tools, total: tools.length });
}
