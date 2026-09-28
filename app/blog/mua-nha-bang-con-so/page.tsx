import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChapterNav } from "@/components/education/chapter-nav";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/education/icons";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { educationChapters, type EducationChapter } from "@/content/education/chapters";
import { calculatorPath } from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_LINK_ARROW, FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: canonicalPath(C.slug),
  title: C.metaTitle,
  description: C.metaDescription,
});

/** Wider than `container-fh`: the chapter layout needs the 42/58 split. */
const WIDE = "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-[90px]";
const RULE = "border-ink-4/40";
const HEADING = "font-bold tracking-[-0.03em] text-ink";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

/**
 * The collection index, as five chapters.
 *
 * A STATIC segment under `app/blog/`, so it sits inside the blog information
 * architecture and takes precedence over `app/blog/[slug]`. `POSTS` contains
 * no entry with this slug, so the dynamic route never tries to build it.
 *
 * Every chapter and every article is in the server HTML. The chapter links at
 * the top are page anchors, not tabs, so nothing depends on JavaScript or on
 * reading in order. No `<Reveal>`, for the reason `app/blog/[slug]/page.tsx`
 * gives: this list is the only way into the collection.
 *
 * Only chapter 01 has a picture — the labelled illustration made for it. The
 * other chapters are typographic rather than reusing one picture five times;
 * each article carries its own computed chart and tool screenshots.
 */
export default function EducationCollectionPage() {
  const chapters = educationChapters();

  return (
    <>
      <SiteHeader />
      {/* Typography is scoped to this page's main: the self-hosted Inter
          (400 body, 700 headings) — a regular-width face, as in the selected
          design. The shared header keeps the brand's Maison Neue. Inter ships
          only 400 and 700 here, so no class below asks for 500 or 600. */}
      <main data-chapter-page className="flex-1 pb-20 pt-3 font-reading tracking-normal md:pb-28 md:pt-4">
        <div className={WIDE}>
          <div id="muc-luc" className="scroll-mt-28">
            <Link
              href="/blog/#tin-thi-truong"
              className={cn(
                "inline-flex min-h-8 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink",
                FH_POINTER,
                FOCUS,
              )}
            >
              <ArrowLeftIcon className="size-4" />
              {C.toNewsCta}
            </Link>

            <h1 className={cn("mt-1 text-[36px] leading-[1.05] sm:text-[44px] lg:text-[54px] xl:text-[58px]", HEADING)}>
              {C.pageTitle}
            </h1>
            <p className="mt-2 text-[17px] leading-snug text-ink-2 md:text-2xl">
              {C.lede}
            </p>

            <ChapterNav
              label={C.chaptersLabel}
              chapters={chapters.map(({ anchor, number, label }) => ({ anchor, number, label }))}
            />
          </div>

          {chapters.map((chapter, index) => (
            <Chapter
              key={chapter.anchor}
              chapter={chapter}
              lead={index === 0}
              next={chapters[index + 1]}
            />
          ))}

          {/* How to use the collection, and the two ways out of it. */}
          <section
            aria-labelledby="cach-dung"
            className={cn("mt-16 grid gap-8 border-t pt-12 md:mt-20 md:pt-16 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-12", RULE)}
          >
            <div>
              <h2 id="cach-dung" className={cn("text-2xl leading-tight md:text-[28px]", HEADING)}>
                {C.scopeTitle}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-2">{C.scopeBody}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href={`${calculatorPath("kha-nang-mua-nha")}/`}
                className={cn("flex flex-col rounded-2xl bg-bg-soft p-5 transition-colors hover:bg-bg-soft/70", FH_POINTER, FOCUS)}
              >
                <span className="text-base font-bold text-ink">Bắt đầu từ công cụ</span>
                <span className="mt-2 text-sm leading-relaxed text-ink-2">
                  Nếu bạn muốn tính trước rồi đọc sau, mở công cụ Khả năng mua nhà và nhập số của mình.
                </span>
              </Link>
              <Link
                href="/blog/#tin-thi-truong"
                className={cn("flex flex-col rounded-2xl bg-bg-soft p-5 transition-colors hover:bg-bg-soft/70", FH_POINTER, FOCUS)}
              >
                <span className="text-base font-bold text-ink">{C.toNewsTitle}</span>
                <span className="mt-2 text-sm leading-relaxed text-ink-2">{C.toNewsBody}</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Chapter({
  chapter,
  lead,
  next,
}: {
  chapter: EducationChapter;
  lead: boolean;
  next: EducationChapter | undefined;
}) {
  const titleId = `${chapter.anchor}-tieu-de`;
  const intro = <ChapterIntro chapter={chapter} titleId={titleId} lead={lead} />;
  const list = <ChapterList chapter={chapter} />;

  return (
    <section
      id={chapter.anchor}
      aria-labelledby={titleId}
      className={cn(
        "scroll-mt-28",
        lead ? "pt-8" : cn("mt-16 border-t pt-12 md:mt-20 md:pt-16", RULE),
      )}
    >
      {lead ? (
        <>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:items-center lg:gap-12">
            {intro}
            <figure>
              <div className="overflow-hidden rounded-2xl bg-bg-soft">
                <Image
                  src={C.budgetIllustration.src}
                  alt={C.budgetIllustration.alt}
                  width={C.budgetIllustration.width}
                  height={C.budgetIllustration.height}
                  unoptimized
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-[1600/733] h-auto w-full object-cover"
                />
              </div>
              <figcaption className="mt-2 text-[13px] leading-snug text-ink-3">
                {C.budgetIllustration.caption}
              </figcaption>
            </figure>
          </div>
          <div className="mt-8 md:mt-9">{list}</div>
        </>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-12">
          {intro}
          {list}
        </div>
      )}

      <NextChapter next={next} />
    </section>
  );
}

function ChapterIntro({
  chapter,
  titleId,
  lead,
}: {
  chapter: EducationChapter;
  titleId: string;
  lead: boolean;
}) {
  return (
    <div>
      {/* The big pale number is decoration; the heading says it in words. */}
      <p
        aria-hidden="true"
        className={cn(
          "select-none font-bold leading-[0.8] tracking-[-0.05em] text-ink-4/30 tabular-nums",
          lead ? "text-[72px] md:text-[104px] xl:text-[120px]" : "text-[64px] md:text-[88px]",
        )}
      >
        {chapter.number}
      </p>
      <h2
        id={titleId}
        className={cn(
          "mt-3",
          HEADING,
          lead
            ? "text-[32px] leading-[1.08] sm:text-[40px] lg:text-[48px] xl:text-[56px]"
            : "text-[28px] leading-[1.1] sm:text-[34px] lg:text-[40px]",
        )}
      >
        <span className="sr-only">Chương {chapter.number}: </span>
        {chapter.title}
      </h2>
      <p className="mt-3 text-[17px] leading-snug text-ink-2 md:mt-4 md:text-xl xl:text-[22px]">
        {chapter.lede}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-7">
        <Link
          href={chapter.start.href}
          className={cn(
            "inline-flex min-h-12 items-center rounded-full bg-brand-green-ink px-7 text-base font-bold text-white transition-opacity hover:opacity-90 md:min-h-[52px] md:px-8 md:text-[17px]",
            FH_POINTER,
            FOCUS,
          )}
        >
          {C.chapter.startCta}
          <span className="sr-only">: {chapter.start.title}</span>
        </Link>
        <Link
          href={chapter.tool.href}
          className={cn(
            "group/link inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand-green-ink md:text-[17px]",
            FH_POINTER,
            FOCUS,
          )}
        >
          {C.chapter.toolCta}
          <span className="sr-only"> trên công cụ {chapter.tool.title}</span>
          <ArrowRightIcon className={cn("size-[18px]", FH_LINK_ARROW)} />
        </Link>
      </div>
    </div>
  );
}

function ChapterList({ chapter }: { chapter: EducationChapter }) {
  const listId = `${chapter.anchor}-bai`;
  return (
    <div>
      <h3 id={listId} className={cn("text-[22px] leading-tight md:text-[26px]", HEADING)}>
        {C.chapter.listTitle}
      </h3>
      <p className="mt-1 text-sm text-ink-3 md:text-[15px]">{C.chapter.listNote}</p>
      <ol aria-labelledby={listId} className={cn("mt-4 border-t", RULE)}>
        {chapter.articles.map((article) => (
          <li
            key={article.slug}
            className={cn(
              "group relative grid grid-cols-[3rem_minmax(0,1fr)_auto] gap-x-3 border-b py-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-5 md:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] md:gap-x-8",
              "has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-green",
              RULE,
            )}
          >
            <span className="pt-0.5 text-[15px] tabular-nums text-ink-3 md:text-base">
              {article.number}
            </span>
            <div className="min-w-0">
              <h4 className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-brand-green-ink md:text-[19px]">
                {/* The title is the link; the pseudo-element stretches its
                    target over the whole row without lengthening its name. */}
                <Link href={article.href} className={cn("after:absolute after:inset-0 focus-visible:outline-none", FH_POINTER)}>
                  {article.title}
                </Link>
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-ink-2 md:text-[15px]">{article.excerpt}</p>
            </div>
            <span className="col-start-2 mt-2 whitespace-nowrap text-sm text-ink-3 md:col-start-3 md:row-start-1 md:mt-0.5">
              {article.readingTime}
            </span>
            <ArrowRightIcon
              className="col-start-3 row-start-1 mt-0.5 size-5 text-ink-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand-green-ink md:col-start-4"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function NextChapter({ next }: { next: EducationChapter | undefined }) {
  // A plain anchor, like the chapter nav: the browser owns the jump and the
  // history entry, so Back returns to where the reader was.
  return (
    <a
      href={next ? `#${next.anchor}` : "#muc-luc"}
      className={cn("group/link mt-8 inline-flex min-h-11 flex-col justify-center md:mt-10", FH_POINTER, FOCUS)}
    >
      <span className="text-xs font-bold uppercase tracking-wide text-ink-3">
        {next ? C.chapter.nextLabel : C.chapter.backToChapters}
      </span>
      {next ? (
        <span className="mt-1 flex items-center gap-3">
          <span className="text-[26px] font-bold tabular-nums text-ink-3 md:text-[30px]">{next.number}</span>
          <span className="text-[17px] text-ink">{next.group.name}</span>
          <ArrowRightIcon className={cn("size-[18px] text-ink-2", FH_LINK_ARROW)} />
        </span>
      ) : null}
    </a>
  );
}
