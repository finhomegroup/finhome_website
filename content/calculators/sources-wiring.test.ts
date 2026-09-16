import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * A DECLARED `sources` BLOCK THAT THE ROUTE NEVER PASSES RENDERS NOTHING.
 *
 * `components/calc/calculator-page.tsx` takes `sources` as an optional prop
 * and renders it only when present, so a content module can declare a full
 * citation block — title, intro, hrefs, notes — and the page can ship without
 * a single one of them, with no error anywhere. Nothing would be red: the
 * object is still valid, still type-checks, still exported, still covered by
 * whatever test asserts its contents. It simply is not on the page.
 *
 * That is the same failure mode as a declared reading-emphasis phrase that
 * matches no paragraph — `emphasise()` skips it silently, which is why
 * `missingPhrases` exists — and it matters more here. The pages that carry a
 * `sources` block are the ones that PREFILL A LEGAL OR TAX PARAMETER, and the
 * shell's own docstring is explicit that naming a decree in prose is not a
 * citation a reader can check. A block that never renders leaves the page
 * asserting a statutory rate with nothing to open, which is the exact state
 * the block was added to fix.
 *
 * Checked BOTH WAYS, the way `WIDE_TABLE_PENDING` is: a content module that
 * declares sources and is not wired fails, and a route that passes a sources
 * prop while its content module declares none fails too. `tsc` catches the
 * blunt version of the second case (`C.sources` on a module without the key
 * is a type error), but not a route wired to some other object.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = HERE;
const ROUTES_DIR = path.resolve(HERE, "../../app/cong-cu");

/**
 * `sources:` at exactly two spaces — top level of the exported object.
 *
 * MATCHES A REFERENCE AS WELL AS A LITERAL, and it did not at first. The
 * pattern was `/^ {2}sources: \{$/m`, which only sees `sources: {`. An agent
 * citing the three social-security rows — which share one statutory model and
 * therefore should share one source list — found that the natural way to write
 * that, `sources: US_SOCIAL_SECURITY_SOURCES,`, is INVISIBLE to the old
 * pattern. Three rows would have declared citations that this sweep could not
 * see, so "a declared block that no route passes" would have gone unreported
 * on exactly the rows the sharing was meant to keep consistent. It worked
 * around the guard by spreading the shared object into a literal; the guard is
 * now fixed so the next author does not have to.
 *
 * Deliberately matches the KEY and not its value shape: literal, spread,
 * reference, or a call all count as declaring sources, because all four render.
 */
const DECLARES_SOURCES = /^ {2}sources:/m;

const contentFiles = readdirSync(CONTENT_DIR)
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
  .sort();

const routeFiles = readdirSync(ROUTES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(ROUTES_DIR, entry.name, "page.tsx"))
  .filter((file) => {
    try {
      readFileSync(file, "utf8");
      return true;
    } catch {
      return false;
    }
  })
  .sort();

const routeText = new Map(
  routeFiles.map((file) => [file, readFileSync(file, "utf8")] as const),
);

/**
 * The routes importing a given content module, found through the import
 * specifier rather than guessed from the slug: the module basename and the
 * route segment are different words on most rows (`tip.ts` is served at
 * `/cong-cu/tinh-tien-tip/`), so matching on the slug would silently find
 * nothing and pass.
 */
function routesImporting(moduleBase: string): string[] {
  const specifier = `@/content/calculators/${moduleBase}"`;
  return routeFiles.filter((file) => routeText.get(file)!.includes(specifier));
}

const sourcedModules = contentFiles.filter((name) =>
  DECLARES_SOURCES.test(readFileSync(path.join(CONTENT_DIR, name), "utf8")),
);

describe("every declared sources block reaches a page", () => {
  it("detects a sources key however it is written, not only as a literal", () => {
    // The control for the widening above. Each of these renders a source list,
    // so each must be seen by the sweep; a pattern that only matched `{` let a
    // shared definition slip past unnoticed.
    for (const form of [
      "  sources: {",
      "  sources: US_SOCIAL_SECURITY_SOURCES,",
      "  sources: { ...US_SOCIAL_SECURITY_SOURCES },",
      "  sources: buildSources(SLUG),",
    ]) {
      expect(DECLARES_SOURCES.test(form), `${form} not detected`).toBe(true);
    }
    // And it still must not fire on something that merely contains the word,
    // or on a nested key belonging to some other object.
    for (const form of [
      "  // sources: { }",
      "    sources: {",
      "  sourcesTitle: 'x',",
      "  retirementSources: {",
    ]) {
      expect(DECLARES_SOURCES.test(form), `${form} wrongly detected`).toBe(false);
    }
  });

  it("finds the modules and routes at all, so the sweep cannot pass vacuously", () => {
    // Both halves of this test are "for each X" loops, and a glob that
    // matched nothing would satisfy every one of them. docs §8's coincidental
    // pass, in the shape it takes in a file-walking test.
    expect(contentFiles.length).toBeGreaterThan(50);
    expect(routeFiles.length).toBeGreaterThan(50);
    expect(sourcedModules.length).toBeGreaterThan(5);
    // A known member, so a regex that stopped matching anything is caught.
    expect(sourcedModules).toContain("business-forecast.ts");
  });

  it.each(sourcedModules)("%s is passed to its route", (name) => {
    const base = name.replace(/\.ts$/, "");
    const importers = routesImporting(base);
    expect(
      importers.length,
      `no route imports @/content/calculators/${base}`,
    ).toBeGreaterThan(0);
    const wired = importers.filter((file) =>
      /sources=\{/.test(routeText.get(file)!),
    );
    expect(
      wired.map((file) => path.relative(ROUTES_DIR, file)),
      `${base} declares a sources block that no importing route passes to ` +
        `CalculatorPage, so none of its citations render`,
    ).not.toHaveLength(0);
  });

  it("has no route passing a sources prop its content module does not declare", () => {
    const wiredRoutes = routeFiles.filter((file) =>
      /sources=\{/.test(routeText.get(file)!),
    );
    expect(wiredRoutes.length).toBeGreaterThan(5);
    const orphans: string[] = [];
    for (const file of wiredRoutes) {
      const bases = [
        ...routeText.get(file)!.matchAll(/@\/content\/calculators\/([\w-]+)"/g),
      ].map((match) => match[1]);
      const declares = bases.some((base) =>
        sourcedModules.includes(`${base}.ts`),
      );
      if (!declares) orphans.push(path.relative(ROUTES_DIR, file));
    }
    expect(
      orphans,
      "a route passes `sources={...}` while none of the content modules it " +
        "imports declares a top-level sources block",
    ).toEqual([]);
  });
});
