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
    ...(post.date ? { datePublished: post.date } : {}),
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absUrl("/logos/Logo_7.png") },
    },
    mainEntityOfPage: absUrl(canonicalPath(`/blog/${post.slug}`)),
  };
}
