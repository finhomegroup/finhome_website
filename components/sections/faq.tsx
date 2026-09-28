import { FAQ_SECTION, SUPPORT_CONTACT } from "@/content/home";
import { CONTACT } from "@/content/site";
import { Accordion } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

const SUBTITLE_LINE1 = "Những thông tin cần thiết";
const SUBTITLE_LINE2 = "giúp bạn hiểu rõ FinHome trước khi trải nghiệm";

const CONTACT_LINK = cn(
  "inline-flex min-h-11 items-center font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink",
  FH_POINTER,
);

/**
 * The homepage support section (`#hotro`): the FAQ, then the real contact
 * routes. The early-access signup that used to sit here was a no-op form and
 * is gone — see `SUPPORT_CONTACT`.
 */
export function Faq() {
  return (
    <SectionFrame id="hotro">
      <Container className="max-w-[1104px]">
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2 text-ink">{FAQ_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-2 max-w-2xl text-balance text-[15px] leading-snug md:text-base">
              <span className="inline lg:block">{SUBTITLE_LINE1}{" "}</span>
              <span className="inline lg:block">{SUBTITLE_LINE2}</span>
            </p>
          </div>

          <div className="mx-auto mt-4 max-w-[800px]">
            <Accordion items={FAQ_SECTION.items} />
          </div>
        </Reveal>

        <div className="mx-auto mt-6 max-w-[800px] text-center md:mt-7">
          <h3 className="font-display text-lg font-medium text-ink">{SUPPORT_CONTACT.title}</h3>
          <p className="fh-body mt-1">{SUPPORT_CONTACT.body}</p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-6 text-sm">
            <a href={`mailto:${CONTACT.email}`} className={CONTACT_LINK}>
              {CONTACT.email}
            </a>
            <a href={`tel:${CONTACT.phoneTel}`} className={CONTACT_LINK}>
              {CONTACT.phoneLabel}
            </a>
          </p>
        </div>
      </Container>
    </SectionFrame>
  );
}
