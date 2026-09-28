import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";

/**
 * THE ONE WAY A TOOL LINKS TO ITS EXPLANATION (navigation map T03).
 *
 * Opens the article in a NEW TAB, and says so in the link itself, so a reader
 * who is halfway through a form keeps it in the original tab. The note is
 * part of the link's accessible name — announced, not just an icon. Nothing
 * here claims the form is saved: this page stores nothing, and a reload or a
 * Back navigation is not promised to restore anything.
 *
 * A plain `<a>`: a new-tab navigation has no client routing to gain.
 * `navigation-map.test.ts` asserts every tool's education seam renders
 * through this component.
 */
export function EducationLink({ href, label, why }: { href: string; label: string; why: string }) {
  return (
    <p className="mt-4 text-sm leading-relaxed text-ink-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand-green-ink underline decoration-brand-green-ink/40 underline-offset-2"
      >
        {label}
        <span className="ml-1 whitespace-nowrap font-normal">{C.nextSteps.newTabNote}</span>
      </a>{" "}
      — {why}
    </p>
  );
}
