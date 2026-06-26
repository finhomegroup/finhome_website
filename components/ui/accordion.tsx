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
      className={cn("flex w-full flex-col gap-3", className)}
    >
      {items.map((item, i) => (
        <RadixAccordion.Item
          key={i}
          value={`item-${i}`}
          className="rounded-2xl bg-bg-soft px-5 py-3.5 md:px-6 md:py-4"
        >
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-4 text-left">
              <span className="inline-flex rounded-lg bg-brand-green/10 px-2.5 py-1 fh-h3 text-ink">
                {i + 1}. {item.q}
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-green text-white">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                  />
                  <line
                    x1="12"
                    y1="5"
                    x2="12"
                    y2="19"
                    className="origin-center transition-transform duration-200 group-data-[state=open]:scale-y-0"
                  />
                </svg>
              </span>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="fh-body pt-4">{item.a}</p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
