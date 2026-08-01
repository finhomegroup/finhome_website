import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { VisionCompass } from "@/components/vision-compass";
import {
  BuyerJourneyTable,
  PartnerTouchpointsTable,
} from "@/components/brand-journey-tables";
import { BRAND_IDENTITY } from "@/content/brand-identity";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath } from "@/lib/seo";
import {
  IconVerifiedBadge,
  IconShieldFilled,
  IconChatDots,
  IconCompassFilled,
  IconSparkle,
  IconTrendingUp,
  IconTarget,
  IconRocket,
} from "@/components/vision-icons";

const VALUE_ICONS = [
  IconVerifiedBadge,
  IconShieldFilled,
  IconChatDots,
  IconCompassFilled,
  IconSparkle,
];

const PRINCIPLE_ICONS = [IconTrendingUp, IconTarget, IconRocket];

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

            <Reveal
              delay={0.1}
              className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16"
            >
              <div className="lg:sticky lg:top-28">
                <VisionCompass />
              </div>
              <div className="space-y-10">
                {BRAND_IDENTITY.pillars.map((pillar) => (
                  <div key={pillar.title}>
                    <h2 className="fh-h2">{pillar.title}</h2>
                    <p className="fh-body mt-3">{pillar.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>

        <section className="py-16 md:py-24">
          <Container>
            <Reveal
              delay={0.1}
              className="grid grid-cols-1 gap-5 md:grid-cols-3"
            >
              <h2 className="fh-h2 self-start">{BRAND_IDENTITY.valuesTitle}</h2>
              {BRAND_IDENTITY.values.map((value, i) => {
                const Icon = VALUE_ICONS[i];
                return (
                  <div
                    key={value.title}
                    className="rounded-2xl border-l-4 border-brand-green bg-[#f7f7f6] p-6"
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                      <Icon className="size-5 text-brand-green" />
                    </div>
                    <h3 className="fh-h3 mt-6">{value.title}</h3>
                    <p className="fh-body mt-2">{value.description}</p>
                  </div>
                );
              })}
            </Reveal>
          </Container>
        </section>

        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-start lg:gap-16">
              <div className="lg:sticky lg:top-28">
                <h2 className="fh-h2">{BRAND_IDENTITY.principlesTitle}</h2>
                <p className="fh-body mt-3 max-w-xs">{BRAND_IDENTITY.principlesSubtitle}</p>
              </div>

              <div className="space-y-6">
                {BRAND_IDENTITY.principles.map((principle, i) => {
                  const Icon = PRINCIPLE_ICONS[i];
                  return (
                    <div
                      key={principle.title}
                      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-bg-soft p-6 pb-14 shadow-[0_1px_20px_rgba(0,0,0,0.04)] md:p-8 md:pb-16"
                    >
                      <div className="flex items-center gap-3">
                        <div className="fh-badge-gradient flex size-11 shrink-0 items-center justify-center rounded-full text-white">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="fh-h3">{principle.title}</h3>
                      </div>
                      <p className="fh-body mt-3 pr-14">{principle.detail}</p>
                      <span className="absolute bottom-4 right-6 font-display text-4xl font-medium text-ink-4/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
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
