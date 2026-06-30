"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";

const FAQ_QUESTION_BG = "CKU5fM0cAKas042ZkEiDFMZCCrU.jpg";
const FAQ_TOGGLE_ICON = "iFYY6KsVY4Sg2HETYv3vxfrz8.png";

function ToggleIcon() {
  return (
    <span className="relative z-10 flex size-[30px] shrink-0 items-center justify-center">
      <img
        src={img(FAQ_TOGGLE_ICON)}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-contain"
      />
      <span className="relative flex size-full items-center justify-center">
        <span className="absolute h-[2px] w-3 rounded-full bg-white" />
        <span className="absolute h-3 w-[2px] origin-center rounded-full bg-white transition-transform duration-200 group-data-[state=open]:scale-y-0" />
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
      className={cn("flex w-full flex-col gap-5", className)}
    >
      {items.map((item, i) => (
        <RadixAccordion.Item
          key={i}
          value={`item-${i}`}
          className="overflow-hidden rounded-2xl bg-white p-[5px] shadow-[0_1px_20px_rgba(0,0,0,0.03)]"
        >
          <RadixAccordion.Header className="m-0">
            <RadixAccordion.Trigger className="group relative flex h-[62px] w-full items-center justify-between gap-4 overflow-hidden rounded-[13px] py-4 pl-5 pr-4 text-left data-[state=open]:rounded-b-none">
              <img
                src={img(FAQ_QUESTION_BG)}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover object-[0.6%_50%]"
              />
              <span className="relative z-10 min-w-0 flex-1 font-[family-name:var(--font-display)] text-[15px] font-medium leading-none tracking-[0.01em] text-ink">
                {i + 1}. {item.q}
              </span>
              <ToggleIcon />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-5 pb-4 pt-3">
              <p className="fh-body text-left">{item.a}</p>
            </div>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
