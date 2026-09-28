import { APP_DOWNLOAD_PREVIEW as A } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";

/**
 * App-download PREVIEW section — proposed (docs/homepage-photo-preview.md).
 *
 * Sits after the buyer questions and before the steps. The QR / store-badge
 * panel is an OLD ILLUSTRATIVE IMAGE, allowed for this preview only: it is a
 * plain, non-interactive `<img>` inside a `<figure>` whose caption says so,
 * directly under it. There is deliberately NO link, button or store URL here
 * — the repository has no real download destination, and a control that
 * looks like a download but goes nowhere is the defect this site removed
 * from its header CTA once already.
 *
 * Layout: one column below `lg` in reading order — copy, then the QR panel,
 * then the phone artwork; from `lg` two columns, copy + QR left, phone right.
 * The panel keeps its full aspect (`h-auto`) up to 340 px wide. Calm
 * `bg-bg-soft` ground, `brand-green-ink` title, existing fonts.
 */
export function AppDownloadPreview() {
  return (
    <section aria-labelledby="app-download-title" className="bg-bg-soft py-16 lg:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-display text-sm font-medium uppercase tracking-wide text-brand-green-ink">
              {A.eyebrow}
            </p>
            <h2 id="app-download-title" className="fh-h2 mt-3 text-balance !text-brand-green-ink">
              {A.title}
            </h2>
            <p className="fh-body mt-4 max-w-md">{A.body}</p>
            <figure className="mt-8 w-full max-w-[340px]">
              <img
                src={img(A.panel)}
                alt={A.panelAlt}
                width={512}
                height={196}
                loading="lazy"
                className="block h-auto w-full select-none"
              />
              <figcaption className="mt-2 text-sm text-ink-2">{A.caption}</figcaption>
            </figure>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src={img(A.phone)}
              alt={A.phoneAlt}
              width={895}
              height={1024}
              loading="lazy"
              className="block h-auto w-[72vw] max-w-[360px] select-none"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
