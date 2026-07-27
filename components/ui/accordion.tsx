"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import { FH_CARD_SHADOW, FH_POINTER } from "@/lib/interaction-styles";

const FAQ_QUESTION_BG = "CKU5fM0cAKas042ZkEiDFMZCCrU.jpg";
const FAQ_TOGGLE_ICON = "iFYY6KsVY4Sg2HETYv3vxfrz8.png";

function ToggleIcon() {
  return (
    <span className="relative z-10 flex size-6 shrink-0 items-center justify-center sm:size-[26px]">
      <img
        src={img(FAQ_TOGGLE_ICON)}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-contain"
      />
      <span className="relative flex size-full items-center justify-center">
        <span className="absolute h-[1.5px] w-2.5 rounded-full bg-white" />
        <span className="absolute h-2.5 w-[1.5px] origin-center rounded-full bg-white transition-transform duration-200 group-data-[state=open]:scale-y-0" />
      </span>
    </span>
  );
}

export function Accordion({
  items,
  className,
}: {
  items: { q: string; a: string }[];
  className?: string;
}) {
  return (
    <RadixAccordion.Root
      type="single"
      collapsible
      className={cn("flex w-full flex-col gap-2", className)}
    >
      {items.map((item, i) => (
        <RadixAccordion.Item
          key={i}
          value={`item-${i}`}
          className={cn(
            "overflow-hidden rounded-xl bg-white p-1",
            FH_CARD_SHADOW,
          )}
        >
          <RadixAccordion.Header className="m-0">
            <RadixAccordion.Trigger
              className={cn(
                "group relative flex min-h-0 w-full items-center justify-between gap-3 overflow-hidden rounded-[10px] py-2 pl-3.5 pr-2.5 text-left data-[state=open]:rounded-b-none sm:gap-3 sm:py-2.5 sm:pl-4 sm:pr-3",
                FH_POINTER,
              )}
            >
              <img
                src={img(FAQ_QUESTION_BG)}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover object-[0.6%_50%]"
              />
              <span className="relative z-10 min-w-0 flex-1 font-[family-name:var(--font-display)] text-[14px] font-medium leading-snug tracking-[0.01em] text-ink sm:text-[15px]">
                {i + 1}. {item.q}
              </span>
              <ToggleIcon />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-4 pb-3 pt-2">
              <p className="fh-body text-left text-[15px] leading-snug">
                {item.a}
              </p>
            </div>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
