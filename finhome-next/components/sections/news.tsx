import Link from "next/link";
import { NEWS_SECTION } from "@/content/home";
import { POSTS, type Post } from "@/content/posts";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

function PostCard({ post, featured }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={
        featured
          ? "group flex flex-col overflow-hidden rounded-3xl bg-bg-soft transition-shadow hover:shadow-lg md:flex-row"
          : "group flex flex-col overflow-hidden rounded-2xl bg-bg-soft transition-shadow hover:shadow-lg"
      }
    >
      <div
        className={
          featured
            ? "relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:w-1/2"
            : "relative aspect-[16/10] w-full overflow-hidden"
        }
      >
        <img
          src={img(post.cover)}
          alt={post.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink shadow-sm backdrop-blur">
          <span className="size-1.5 rounded-full bg-brand-green" />
          {post.category}
        </span>
      </div>
      <div
        className={
          featured
            ? "flex flex-1 flex-col justify-center gap-3 p-6 md:p-8"
            : "flex flex-1 flex-col gap-2 p-5"
        }
      >
        <h3
          className={
            featured
              ? "font-display text-xl font-medium text-ink md:text-2xl"
              : "font-medium text-ink"
          }
        >
          {post.title}
        </h3>
        <p className="line-clamp-3 text-ink-2">{post.excerpt}</p>
        <span className="mt-1 text-xs text-ink-3">{post.readingTime}</span>
      </div>
    </Link>
  );
}

export function News() {
  const [featured, ...rest] = POSTS;

  return (
    <section id="tintuc" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="fh-h2">{NEWS_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-4 max-w-xl">{NEWS_SECTION.subtitle}</p>
          </div>

          <div className="mt-10 space-y-6">
            <PostCard post={featured} featured />
            <div className="grid gap-6 md:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Button href="/blog" variant="ghost">
              {NEWS_SECTION.cta}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
