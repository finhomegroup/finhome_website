import { cn } from "@/lib/cn";

type SectionFrameProps = React.ComponentPropsWithoutRef<"section"> & {
  /** Vertically center content when it fits (default true). Desktop xl+ only. */
  center?: boolean;
};

/**
 * Homepage section shell.
 * Phone + iPad: natural document flow (no locked height / inner scroll).
 * Desktop (`xl+`): one-viewport `100dvh` with inner overflow when content is tall.
 * (iPad / iPad Pro widths sit below `xl`, so they stay readable.)
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
        "flex flex-col overflow-x-clip",
        "xl:h-dvh xl:max-h-dvh xl:overflow-y-auto",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full flex-1 flex-col",
          center
            ? // Phone gap; iPad flows; xl+ clears header + centers.
              "py-8 max-md:py-16 xl:min-h-full xl:[justify-content:safe_center] xl:pb-8 xl:pt-[6.5rem]"
            : // Hero: phone bottom gap; iPad fills via hero classes; xl+ normal.
              "justify-start max-md:pb-16 md:max-xl:min-h-0 md:max-xl:flex-1",
        )}
      >
        {children}
      </div>
    </section>
  );
}
