import { cn } from "@/lib/cn";

type SectionFrameProps = React.ComponentPropsWithoutRef<"section"> & {
  /** Vertically center content when it fits (default true). */
  center?: boolean;
};

/**
 * One-viewport homepage section shell: exact `100dvh`, scroll-snap start,
 * and inner overflow when content is taller than the screen.
 */
export function SectionFrame({
  className,
  children,
  center = true,
  ...props
}: SectionFrameProps) {
  return (
    <section
      {...props}
      className={cn(
        "flex h-dvh max-h-dvh flex-col overflow-x-clip overflow-y-auto",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-full w-full flex-1 flex-col",
          center
            ? "justify-center pb-8 pt-[6.5rem] md:pb-10"
            : "justify-start",
        )}
      >
        {children}
      </div>
    </section>
  );
}
