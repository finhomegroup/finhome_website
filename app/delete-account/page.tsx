import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { DELETE_ACCOUNT_CONTENT as C } from "@/content/delete-account";

// Private page: not linked from nav/footer, excluded from the sitemap, and
// explicitly de-indexed. Reachable only by direct URL (for app-store review /
// support links).
export const metadata: Metadata = {
  title: C.pageTitle,
  description: C.intro,
  robots: { index: false, follow: false },
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8">
      {children}
    </section>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg font-medium text-ink md:text-xl">
      {children}
    </h2>
  );
}

export default function DeleteAccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {C.pageTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              {C.intro}
            </p>
          </Reveal>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {/* Cách 1 — in-app */}
            <Reveal>
              <Card>
                <CardTitle>{C.inAppTitle}</CardTitle>
                <ol className="mt-4 space-y-3">
                  {C.inAppSteps.map((stepText, i) => (
                    <li key={stepText} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-soft text-sm font-semibold text-brand-green">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-base leading-relaxed text-ink-2">
                        {stepText}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            </Reveal>

            {/* Cách 2 — web self-service */}
            <Reveal>
              <Card>
                <CardTitle>{C.webTitle}</CardTitle>
                <p className="mt-3 text-base leading-relaxed text-ink-2">
                  {C.webIntro}
                </p>
                <div className="mt-5">
                  <DeleteAccountForm />
                </div>
              </Card>
            </Reveal>

            {/* Cách 3 — support email */}
            <Reveal>
              <Card>
                <CardTitle>{C.supportTitle}</CardTitle>
                <p className="mt-3 text-base leading-relaxed text-ink-2">
                  {C.supportIntro}
                </p>
                <a
                  href={`mailto:${C.supportEmail}?subject=${encodeURIComponent(
                    "Yêu cầu xóa tài khoản FinHome",
                  )}`}
                  className="mt-3 inline-block font-medium text-brand-green underline"
                >
                  {C.supportEmail}
                </a>
              </Card>
            </Reveal>

            {/* Data deleted / retained */}
            <Reveal>
              <Card>
                <CardTitle>{C.dataDeletedTitle}</CardTitle>
                <ul className="mt-4 space-y-2">
                  {C.dataDeleted.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span className="text-base leading-relaxed text-ink-2">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-6 font-display text-base font-medium text-ink">
                  {C.dataRetainedTitle}
                </h3>
                <ul className="mt-3 space-y-2">
                  {C.dataRetained.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span className="text-base leading-relaxed text-ink-2">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 rounded-xl border border-ink-4/15 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
                  {C.retentionNote}
                </p>
              </Card>
            </Reveal>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
