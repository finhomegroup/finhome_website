import type { LegalDocContent } from "@/content/legal";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 shrink-0 text-brand-green"
      aria-hidden
    >
      <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M5 8.2 7 10.2 11 6.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 shrink-0 text-amber-600"
      aria-hidden
    >
      <path
        d="M8 1.5 14.5 13.5H1.5L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8 6.5v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-soft text-sm font-semibold text-brand-green">
      {n}
    </span>
  );
}

export function LegalDocument({ doc }: { doc: LegalDocContent }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8">
        <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
          {doc.docTitle}
        </h2>
        <p className="mt-1 text-sm text-ink-3">Cập nhật: {doc.updated}</p>
        {doc.intro ? (
          <p className="mt-4 text-base leading-relaxed text-ink-2">{doc.intro}</p>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        {doc.sections.map((section, i) => (
          <section
            key={section.title}
            className="rounded-3xl border border-ink-4/15 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="flex items-start gap-3">
              <NumberBadge n={i + 1} />
              <h3 className="flex-1 font-display text-lg font-medium text-ink md:text-xl">
                {section.title}
              </h3>
            </div>

            {section.content?.split("\n\n").map((para) => (
              <p key={para} className="mt-4 text-base leading-relaxed text-ink-2">
                {para}
              </p>
            ))}

            {section.checkmarks ? (
              <ul className="mt-4 space-y-2">
                {section.checkmarks.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span className="text-base leading-relaxed text-ink-2">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.subSections?.map((sub) => (
              <div key={sub.title} className="mt-5">
                <h4 className="font-display text-base font-medium text-ink">
                  {sub.title}
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {sub.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span className="text-base leading-relaxed text-ink-2">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {section.note ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <WarningIcon />
                <p className="text-sm leading-relaxed text-ink-2">{section.note}</p>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
