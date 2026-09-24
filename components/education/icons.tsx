import { cn } from "@/lib/cn";

// No icon library is installed in this project. These reuse the exact glyphs
// the site already ships — the right arrow from the home news section
// (`components/sections/news.tsx`) and the back arrow from the blog pages —
// rather than drawing new ones.

export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className={cn("shrink-0 fill-current", className)}
    >
      <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
