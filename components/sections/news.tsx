import Link from "next/link";
import { NEWS_SECTION } from "@/content/home";
import { POSTS, type Post } from "@/content/posts";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import {
  FH_CARD_IMAGE_ZOOM,
  FH_CLICKABLE_CARD,
  FH_LINK_ARROW,
  FH_LINK_OPACITY,
} from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit shrink-0 rounded-full border border-brand-softgreen bg-bg-soft px-3 py-1 text-sm font-medium shadow-[0_0.42px_1.26px_-0.42px_rgba(28,70,255,0.01),0_1.6px_4.8px_-0.83px_rgba(28,70,255,0.01),0_7px_21px_-1.25px_rgba(28,70,255,0.03)]">
      <span className="bg-[radial-gradient(207%_50%_at_50%_50%,#17ab48_0%,#a2db46_100%)] bg-clip-text text-transparent">
        {label}
      </span>
    </span>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4 md:flex-row md:items-stretch md:gap-4",
        FH_CLICKABLE_CARD,
      )}
    >
      <div className="min-h-0 shrink-0 overflow-hidden rounded-xl md:w-1/2">
        <img
          src={img(post.cover)}
          alt={post.title}
          className={cn(
            "aspect-[3/2] h-full w-full object-cover md:aspect-auto md:min-h-[280px]",
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
          <span className="bg-[radial-gradient(96%_50%_at_50%_50%,#17ab48_0%,#a2db46_100%)] bg-clip-text font-display-book text-sm text-transparent">
            {post.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
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
          src={img(post.cover)}
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
    </Link>
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
  const [featured, ...rest] = POSTS;

  return (
    <section id="tintuc" className="py-12 md:py-[50px]">
      <Container>
        <Reveal>
          <div className="text-center">
            <h2 className="fh-h2 text-ink">{NEWS_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-4 max-w-xl">
              {NEWS_SECTION.subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-5 md:gap-6">
            <FeaturedCard post={featured} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <ViewMoreLink />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
