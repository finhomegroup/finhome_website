"use client";

import { motion } from "framer-motion";
import { PARTNER_CTA } from "@/content/partners-team";
import { CTA_HREF } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { PartnerTables } from "@/components/sections/partner-tables";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

// Decorative badges float around the partner title. Desktop geometry re-measured
// from the live Framer page @1440px (Logo Mirror ≈88–92px; wrappers flank the
// centered heading). Tablet uses scaled corner placement so icons stay clear of
// the title without inventing unmeasured mobile coordinates.
const BADGE_SCALE_MD = 0.55;

/** Soft multi-axis elevation from Framer `Logo Mirror` (desktop). */
const LOGO_MIRROR_SHADOW =
  "0px 0px 0px 6px #fff, 0px 0.602187px 0.421531px -0.916667px rgba(0,0,0,0.05), 0px 2.28853px 1.60197px -1.83333px rgba(0,0,0,0.05), 0px 10px 7px -2.75px rgba(0,0,0,0.04), 0px -0.602187px 0.541969px -1.08333px rgba(0,0,0,0.06), 0px -2.28853px 2.05968px -2.16667px rgba(0,0,0,0.05), 0px -10px 9px -3.25px rgba(0,0,0,0.03), 0.602187px 0px 0.541969px -1.16667px rgba(0,0,0,0.06), 2.28853px 0px 2.05968px -2.33333px rgba(0,0,0,0.05), 10px 0px 9px -3.5px rgba(0,0,0,0.03), -0.602187px 0px 0.602187px -1.16667px rgba(0,0,0,0.06), -2.28853px 0px 2.28853px -2.33333px rgba(0,0,0,0.05), -10px 0px 10px -3.5px rgba(0,0,0,0.03)";

const BADGES: {
  icon: string;
  /** Rendered Logo Mirror size (smaller than live Framer ~88–92px per design tweak). */
  size: number;
  wrapper: { width: number; height: number; top: number };
  side: "left" | "right";
  offset: number;
  tablet: { top: number; offset: number };
  rotate: [number, number];
  floatY: [number, number];
  rotateDuration: number;
  floatDuration: number;
}[] = [
  {
    icon: "/images/partners-team/partner-person.png",
    size: 76,
    wrapper: { width: 127, height: 180, top: 0 },
    side: "left",
    offset: 140,
    tablet: { top: 0, offset: 0 },
    rotate: [-8, 10],
    floatY: [0, -15],
    rotateDuration: 4.2,
    floatDuration: 3.6,
  },
  {
    icon: "/images/partners-team/partner-shield.png",
    size: 76,
    wrapper: { width: 137, height: 186, top: 145 },
    side: "left",
    offset: 180,
    tablet: { top: 88, offset: 0 },
    rotate: [-18, -8],
    floatY: [0, 25],
    rotateDuration: 4.8,
    floatDuration: 5.2,
  },
  {
    icon: "/images/partners-team/partner-settings.png",
    size: 76,
    wrapper: { width: 128, height: 181, top: 16 },
    side: "right",
    offset: 124,
    tablet: { top: 4, offset: 0 },
    rotate: [-10, 8],
    floatY: [0, -22],
    rotateDuration: 5,
    floatDuration: 4.1,
  },
  {
    icon: "/images/partners-team/partner-chat.png",
    size: 76,
    wrapper: { width: 137, height: 186, top: 146 },
    side: "right",
    offset: 185,
    tablet: { top: 84, offset: 0 },
    rotate: [8, 22],
    floatY: [0, 25],
    rotateDuration: 4.4,
    floatDuration: 5.4,
  },
];

function FloatingBadge({
  badge,
  variant,
}: {
  badge: (typeof BADGES)[number];
  variant: "desktop" | "tablet";
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = variant === "desktop";
  const midRotate = (badge.rotate[0] + badge.rotate[1]) / 2;

  return (
    <div
      className="absolute flex items-start justify-center"
      style={{
        top: isDesktop ? badge.wrapper.top : badge.tablet.top,
        width: badge.wrapper.width,
        height: badge.wrapper.height,
        [badge.side]: isDesktop ? badge.offset : badge.tablet.offset,
        ...(isDesktop
          ? {}
          : {
              transform: `scale(${BADGE_SCALE_MD})`,
              transformOrigin:
                badge.side === "left" ? "top left" : "top right",
            }),
      }}
    >
      <motion.div
        className="flex items-center justify-center"
        animate={
          prefersReducedMotion
            ? { rotate: midRotate }
            : { rotate: [badge.rotate[0], badge.rotate[1]] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: badge.rotateDuration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }
        }
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? { y: 0 }
              : { y: [badge.floatY[0], badge.floatY[1]] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: badge.floatDuration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
          }
        >
          <div
            className="overflow-hidden"
            style={{
              width: badge.size,
              height: badge.size,
              backgroundColor: "#f8f8f8",
              borderRadius: 40,
              boxShadow: LOGO_MIRROR_SHADOW,
            }}
          >
            <img
              src={badge.icon}
              alt=""
              width={433}
              height={433}
              className="block size-full object-cover"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function DecorativeBadges({
  variant,
}: {
  variant: "desktop" | "tablet";
}) {
  return (
    <>
      {BADGES.map((badge) => (
        <FloatingBadge
          key={`${variant}-${badge.icon}`}
          badge={badge}
          variant={variant}
        />
      ))}
    </>
  );
}

/** Partner CTA + dashboard tables share one homepage viewport (`#doitac`). */
export function PartnerCta() {
  return (
    <SectionFrame id="doitac">
      <Container>
        <Reveal>
          {/* Badges share this frame with the title. Compact layout so CTA +
              dashboard fit one viewport (desktop badges still flank the heading). */}
          <div className="relative md:min-h-[200px]">
            {/* -mx-5 cancels container-fh's 20px inline padding so badge offsets
                match the outer 1200px container edge measured on Framer. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -mx-5 hidden md:block xl:hidden"
            >
              <DecorativeBadges variant="tablet" />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -mx-5 hidden xl:block"
            >
              <DecorativeBadges variant="desktop" />
            </div>

            <div
              aria-hidden="true"
              className="hidden md:block"
              style={{ height: 40 }}
            />

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="fh-h2 text-ink">{PARTNER_CTA.title}</h2>
              <p className="fh-lead mx-auto mt-2 max-w-xl text-balance text-[15px] leading-snug md:text-base">
                {PARTNER_CTA.subtitle}
              </p>
              <div className="mt-4 flex justify-center md:mt-5">
                <Button
                  href={CTA_HREF}
                  size="lg"
                  hoverLabel={PARTNER_CTA.hoverCta}
                >
                  {PARTNER_CTA.cta}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-5 md:mt-6">
          <PartnerTables />
        </div>
      </Container>
    </SectionFrame>
  );
}
