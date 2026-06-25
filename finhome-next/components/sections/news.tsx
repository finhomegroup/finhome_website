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
      </div>
      <div
        className={
          featured
            ? "flex flex-1 flex-col justify-center gap-3 p-6 md:p-8"
            : "flex flex-1 flex-col gap-2 p-5"
        }
      >
        <span className="text-xs uppercase tracking-wide text-primary">
          {post.category}
        </span>
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
    <section id="tintuc" className="py-16 md:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              {NEWS_SECTION.title}
            </h2>
            <p className="mt-4 text-ink-2">{NEWS_SECTION.subtitle}</p>
          </div>

          <div className="mt-12 space-y-8">
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
