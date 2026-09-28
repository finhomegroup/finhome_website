import Link from "next/link";
import { BUYER_QUESTIONS } from "@/content/home";
import { Container } from "@/components/ui/container";

/**
 * Three buyer questions under the hero — PHOTO PREVIEW, proposed.
 *
 * Parallel choices, not steps: an unordered list with no numbers. Each card is
 * ONE link containing its question and explanation, so the whole card is the
 * target and it is announced as the question it answers. Visible focus ring.
 */
export function BuyerQuestions() {
  return (
    <section aria-labelledby="buyer-questions-title" className="bg-bg-soft py-12 lg:py-16">
      <Container>
        <h2 id="buyer-questions-title" className="fh-h2 text-ink">
          {BUYER_QUESTIONS.title}
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3 lg:mt-8 lg:gap-6">
          {BUYER_QUESTIONS.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-brand-green-ink/10 transition hover:ring-brand-green-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-ink"
              >
                <h3 className="font-display text-xl font-medium leading-snug text-ink">
                  {item.question}
                </h3>
                <p className="mt-2 flex-1 font-display-book text-base leading-relaxed text-ink-2">
                  {item.explanation}
                </p>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  className="mt-4 size-5 text-brand-green-ink transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
