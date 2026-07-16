import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { LegalDocument } from "@/components/legal-document";
import { TERMS_CONTENT } from "@/content/legal";
import { canonicalPath } from "@/lib/seo";

export const metadata: Metadata = {
  title: TERMS_CONTENT.pageTitle,
  description: TERMS_CONTENT.intro,
  alternates: { canonical: canonicalPath("/terms") },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {TERMS_CONTENT.pageTitle}
            </h1>
          </Reveal>
          <Reveal className="mt-10">
            <LegalDocument doc={TERMS_CONTENT} />
          </Reveal>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
