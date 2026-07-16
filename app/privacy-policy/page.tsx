import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { LegalDocument } from "@/components/legal-document";
import { PRIVACY_CONTENT } from "@/content/legal";
import { canonicalPath } from "@/lib/seo";

export const metadata: Metadata = {
  title: PRIVACY_CONTENT.pageTitle,
  description: PRIVACY_CONTENT.intro,
  alternates: { canonical: canonicalPath("/privacy-policy") },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {PRIVACY_CONTENT.pageTitle}
            </h1>
          </Reveal>
          <Reveal className="mt-10">
            <LegalDocument doc={PRIVACY_CONTENT} />
          </Reveal>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
