import Link from "next/link";
import { NEWS_SECTION } from "@/content/home";
import { newsPosts, postCover, type Post } from "@/content/posts";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import {
  FH_CARD_IMAGE_ZOOM,
  FH_CLICKABLE_CARD,
  FH_LINK_ARROW,
  FH_LINK_OPACITY,
} from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { SectionFrame } from "@/components/ui/section-frame";
import { Reveal } from "@/components/reveal";
import { PostCardLink } from "@/components/post-card-link";

/**
 * THE LABEL IS NOT PAINTED WITH THE BRAND GRADIENT, and that is deliberate.
 *
 * It used to be: `bg-[radial-gradient(...#17ab48 0%,#a2db46 100%)] bg-clip-text
 * text-transparent`, which paints the GLYPHS with the gradient. Measured in a
 * browser on 2026-09-16, the glyphs span 3%-98% of that gradient's range, so
 * the lime end lands inside the letterforms and the worst contrast against the
 * `bg-soft` pill is 1.67:1 — against the 4.5:1 that 14px text needs. A gradient
 * is a decoration; here it was being applied to the one thing on the card that
 * has to be read.
 *
 * `brand-green-ink` is the token that exists for this: the same hue, darkened
 * until it clears 4.5:1 on every light ground the site uses (5.11 on white,
 * 4.54 on the rating wash). See the note in `app/globals.css`.
 */
function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit shrink-0 rounded-full border border-brand-softgreen bg-bg-soft px-3 py-1 text-sm font-medium shadow-[0_0.42px_1.26px_-0.42px_rgba(28,70,255,0.01),0_1.6px_4.8px_-0.83px_rgba(28,70,255,0.01),0_7px_21px_-1.25px_rgba(28,70,255,0.03)]">
      <span className="text-brand-green-ink">{label}</span>
    </span>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <PostCardLink
      post={post}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4 md:flex-row md:items-stretch md:gap-4",
        FH_CLICKABLE_CARD,
      )}
    >
      <div className="min-h-0 shrink-0 overflow-hidden rounded-xl md:w-1/2">
        <img
          src={img(postCover(post))}
          alt={post.title}
          className={cn(
            "aspect-[3/2] h-full w-full object-cover md:aspect-auto md:min-h-0 md:max-h-[240px] lg:max-h-[280px]",
            FH_CARD_IMAGE_ZOOM,
          )}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 py-1 md:w-1/2 md:py-2 md:pr-2">
        <div className="flex flex-1 flex-col gap-3">
          <CategoryBadge label={post.category} />
          <div className="space-y-2">
            <h3 className="fh-h3 text-left">{post.title}</h3>
            <p className="fh-body line-clamp-4 text-left text-[rgb(87,87,87)]">
              {post.excerpt}
            </p>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full bg-gradient-to-b from-[#95e678] to-[#46c670]"
            aria-hidden="true"
          />
          {/* Solid `brand-green-ink`, not the brand gradient: gradient-painted
              glyphs measured 1.65:1 here against the 4.5:1 this 14px line
              needs. Same reasoning as `CategoryBadge` above. */}
          <span className="font-display-book text-sm text-brand-green-ink">
            {post.readingTime}
            {post.source ? ` · Theo ${post.source.name}` : ""}
          </span>
        </div>
      </div>
    </PostCardLink>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <PostCardLink
      post={post}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4",
        FH_CLICKABLE_CARD,
      )}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute right-3 top-3 z-10">
          <CategoryBadge label={post.category} />
        </div>
        <img
          src={img(postCover(post))}
          alt={post.title}
          className={cn("aspect-[3/2] w-full object-cover", FH_CARD_IMAGE_ZOOM)}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 pt-4">
        <h4 className="font-display text-[17px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">
          {post.title}
        </h4>
        <p className="line-clamp-2 font-display-book text-base leading-[1.4] tracking-[-0.02em] text-[rgb(87,87,87)]">
          {post.excerpt}
        </p>
      </div>
    </PostCardLink>
  );
}

function ViewMoreLink() {
  return (
    <Link
      href="/blog"
      className={cn(
        "group/link inline-flex items-center gap-2 font-display text-[17px] font-medium text-ink",
        FH_LINK_OPACITY,
      )}
    >
      {NEWS_SECTION.cta}
      <svg
        viewBox="0 0 256 256"
        aria-hidden="true"
        className={cn("size-5 shrink-0 fill-current", FH_LINK_ARROW)}
      >
        <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
      </svg>
    </Link>
  );
}

export function News() {
  // News section shows news only; the education collection has its own index.
  const [featured, ...rest] = newsPosts();

  return (
    <SectionFrame id="tintuc">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
            <div>
              <h2 className="fh-h2 text-ink">{NEWS_SECTION.title}</h2>
              <p className="fh-lead mx-auto mt-3 max-w-xl md:mt-4">
                {NEWS_SECTION.subtitle}
              </p>
            </div>
            {/* Keep CTA in the header band so it stays on-screen in the
                desktop one-viewport section (cards alone can fill the fold). */}
            <ViewMoreLink />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-5">
            <FeaturedCard post={featured} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {rest.slice(0, 3).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </SectionFrame>
  );
}
