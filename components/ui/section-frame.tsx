import { cn } from "@/lib/cn";

type SectionFrameProps = React.ComponentPropsWithoutRef<"section"> & {
  /** Vertically center content when it fits (default true). Desktop xl+ only. */
  center?: boolean;
};

/**
 * Homepage section shell. Sections size to their content and flow
 * naturally at every breakpoint — no forced one-viewport height.
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
      className={cn("flex flex-col overflow-x-clip", className)}
    >
      <div
        className={cn(
          "flex w-full flex-col",
          // Even vertical rhythm across breakpoints.
          center ? "py-10 md:max-xl:py-12 xl:py-14" : "pb-10 md:max-xl:pb-12 xl:pb-14",
        )}
      >
        {children}
      </div>
    </section>
  );
}
