import Link from "next/link";
import type { Post } from "@/content/posts";

type Props = {
  post: Post;
  className?: string;
  children: React.ReactNode;
};

/** Sourced posts open the publisher URL; FinHome originals stay on /blog/[slug]. */
export function PostCardLink({ post, className, children }: Props) {
  if (post.source) {
    return (
      <a
        href={post.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className={className}>
      {children}
    </Link>
  );
}
