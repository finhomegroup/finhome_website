// Domain-aware URL helpers and JSON-LD schema builders. All build-time only.
import type { Metadata } from "next";
import { SITE, CONTACT } from "@/content/site";
import { img } from "@/lib/images";
import type { Post } from "@/content/posts";

/** Absolute URL from a site-relative path, e.g. "/blog/" -> "https://finhome.group/blog/". */
export function absUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return new URL(clean, SITE.url).toString();
}

/** Normalize to leading + trailing slash to match `trailingSlash: true`. "/" stays "/". */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absUrl("/logos/Logo_7.png"),
    email: CONTACT.email,
    telephone: CONTACT.phoneTel,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address,
      addressCountry: "VN",
    },
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "vi-VN",
  };
}

export function articleSchema(post: Post): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: absUrl(img(post.cover)),
    inLanguage: "vi-VN",
    ...(post.date
      ? { datePublished: post.date, dateModified: post.date }
      : {}),
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absUrl("/logos/Logo_7.png") },
    },
    mainEntityOfPage: absUrl(canonicalPath(`/blog/${post.slug}`)),
    ...(post.source
      ? {
          isBasedOn: {
            "@type": "WebPage",
            name: post.source.name,
            url: post.source.url,
          },
          citation: post.source.url,
        }
      : {}),
  };
}

/**
 * FAQPage structured data. Callers pass the same array they render as prose,
 * so the visible copy and the markup cannot drift apart.
 */
export function faqSchema(
  items: readonly { q: string; a: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** WebApplication structured data for a free on-site calculator tool. */
export function calculatorSchema(input: {
  name: string;
  description: string;
  /** Site-relative route, e.g. "/cong-cu/quy-tac-72". */
  path: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: absUrl(canonicalPath(input.path)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    inLanguage: "vi-VN",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
    publisher: { "@type": "Organization", name: SITE.name },
  };
}

/**
 * The `Metadata` for an ordinary page: canonical, `openGraph` and `twitter`,
 * all three stated in FULL.
 *
 * Both objects are complete rather than the two or three per-page fields they
 * look like they need, and both must exist. Two sides of one Next behaviour:
 *
 * - **`openGraph` is REPLACED, not merged.** The moment a route sets any
 *   `openGraph` key it stops inheriting all of the root layout's — including
 *   the share image. See `node_modules/next/dist/docs/01-app/03-api-reference/
 *   04-functions/generate-metadata.md` ("Inheriting fields").
 * - **`twitter` must be set, not left to be back-filled from `openGraph`.**
 *   Next copies title/description/images across, but only for fields
 *   `twitter` does not already have — and `app/layout.tsx` sets a complete
 *   `twitter`, so the inherited object already has all three and the
 *   back-fill is suppressed. A route with `openGraph` and no `twitter`
 *   therefore ships a per-page `og:title` beside the HOMEPAGE's
 *   `twitter:title`. /vision, /blog and /cong-cu/ all shipped exactly that.
 *
 * `path` must already be canonical — `trailingSlash: true` is on, so a
 * canonical without the slash advertises a URL that redirects.
 */
export function pageMetadata(input: {
  /** Canonical, slash-terminated site-relative path. */
  path: string;
  /** Raw page title. The root layout's template appends the brand to the
   *  document title; this helper appends it to the CARD titles only. */
  title: string;
  description: string;
  ogType?: "website" | "article";
  /** Per-page share image. Defaults to the site card. */
  image?: { url: string; alt: string; width?: number; height?: number };
  /** ISO date, for articles only. */
  publishedTime?: string;
}): Metadata {
  const cardTitle = `${input.title} — ${SITE.name}`;
  const images = input.image
    ? [input.image]
    : [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }];
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      type: input.ogType ?? "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: input.path,
      title: cardTitle,
      description: input.description,
      images,
      // Spread rather than set, so an absent date does not emit `undefined`.
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description: input.description,
      images: [input.image ? input.image.url : SITE.ogImage],
    },
  };
}
