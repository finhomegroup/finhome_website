import Link from "next/link";
import type { Post } from "@/content/posts";

type Props = {
  post: Post;
  className?: string;
  children: React.ReactNode;
};

/** Always open the FinHome article page (SEO). Source credit lives on the detail page. */
export function PostCardLink({ post, className, children }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} className={className}>
      {children}
    </Link>
  );
}
