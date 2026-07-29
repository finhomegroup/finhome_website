import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import {
  BuyerJourneyTable,
  PartnerTouchpointsTable,
} from "@/components/brand-journey-tables";
import { BRAND_IDENTITY } from "@/content/brand-identity";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tầm nhìn & Sứ mệnh",
  description: BRAND_IDENTITY.northStar,
  alternates: { canonical: canonicalPath("/vision") },
  openGraph: {
    type: "website",
    url: canonicalPath("/vision"),
    title: "Tầm nhìn & Sứ mệnh — FinHome",
    description: BRAND_IDENTITY.northStar,
  },
};

function BackLink() {
  return (
    <Link
      href="/"
      className={cn(
        "mb-6 flex w-fit items-center gap-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink",
        FH_POINTER,
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {BRAND_IDENTITY.backLabel}
    </Link>
  );
}

export default function BrandIdentityPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-3xl text-center">
              <BackLink />
              <span className="fh-eyebrow mx-auto w-fit">
                {BRAND_IDENTITY.eyebrow}
              </span>
              <p className="mt-6 text-xs font-medium uppercase tracking-wide text-ink-3">
                {BRAND_IDENTITY.northStarLabel}
              </p>
              <h1 className="fh-h1 mt-2">{BRAND_IDENTITY.northStarHeadline}</h1>
              <p className="fh-lead mx-auto mt-4 max-w-2xl">{BRAND_IDENTITY.northStar}</p>
            </Reveal>

            <Reveal delay={0.1} className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
              {BRAND_IDENTITY.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
                >
                  <h2 className="fh-h3">{pillar.title}</h2>
                  <p className="fh-body mt-3">{pillar.body}</p>
                </div>
              ))}
            </Reveal>
          </Container>
        </section>

        <section className="bg-bg-soft py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="fh-h2">{BRAND_IDENTITY.valuesTitle}</h2>
              <p className="fh-lead mx-auto mt-3">{BRAND_IDENTITY.valuesSubtitle}</p>
            </Reveal>

            <Reveal
              delay={0.1}
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {BRAND_IDENTITY.values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl bg-white p-6 shadow-[0_1px_20px_rgba(0,0,0,0.03)]"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
                    {value.tagline}
                  </p>
                  <h3 className="fh-h3 mt-1">{value.title}</h3>
                  <ul className="mt-4 space-y-2">
                    {value.behaviors.map((behavior) => (
                      <li key={behavior} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gradient-to-b from-[#95e678] to-[#46c670]"
                        />
                        {behavior}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          </Container>
        </section>

        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="fh-h2">{BRAND_IDENTITY.principlesTitle}</h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {BRAND_IDENTITY.principles.map((principle, i) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-black/5 p-6"
                >
                  <span className="bg-[radial-gradient(207%_50%_at_50%_50%,#17ab48_0%,#a2db46_100%)] bg-clip-text font-display text-2xl font-medium text-transparent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="fh-h3 mt-3">{principle.title}</h3>
                  <p className="fh-body mt-2">{principle.detail}</p>
                </div>
              ))}
            </Reveal>
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="fh-h2">{BRAND_IDENTITY.journeyIntro.title}</h2>
              <p className="fh-lead mx-auto mt-3">{BRAND_IDENTITY.journeyIntro.body}</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 space-y-10">
              <BuyerJourneyTable />
              <PartnerTouchpointsTable />
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
