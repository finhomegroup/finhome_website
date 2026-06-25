"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";

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
      defaultValue="item-0"
      className={cn("w-full divide-y divide-ink-4/20", className)}
    >
      {items.map((item, i) => (
        <RadixAccordion.Item key={i} value={`item-${i}`} className="py-2">
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink">
              <span>{item.q}</span>
              <svg
                className="size-5 shrink-0 text-ink-3 transition-transform duration-200 group-data-[state=open]:rotate-45"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden text-ink-2 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="pb-4 pr-8 leading-relaxed">{item.a}</p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
