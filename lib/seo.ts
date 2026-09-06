// Domain-aware URL helpers and JSON-LD schema builders. All build-time only.
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
