import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// Vercel runs `api/*.ts` as native ESM ("type": "module") without bundling, so Node
// resolves each relative import literally: "./site" is ERR_MODULE_NOT_FOUND at cold
// start. The Next build (Turbopack) also bundles the content modules those functions
// load, and it cannot resolve "./site.js" to site.ts. So:
//   - a file in api/ (Node only) writes every relative import with ".js";
//   - a module outside api/ that a function loads makes no runtime import at all —
//     no specifier works for both loaders. Type-only imports are erased, so they pass.
// next build, tsc and vitest all accept the broken form, which is how /api/blog-posts
// returned FUNCTION_INVOCATION_FAILED from 16/09 (content/posts.ts → "./site").

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API = join(ROOT, "api");

type Edge = { file: string; specifier: string; typeOnly: boolean };

function isTypeOnly(node: ts.ImportDeclaration | ts.ExportDeclaration): boolean {
  if (ts.isExportDeclaration(node)) return node.isTypeOnly;
  const clause = node.importClause;
  if (!clause) return false; // `import "./x"` runs the module
  if (clause.isTypeOnly) return true;
  const named = clause.namedBindings;
  return !clause.name && !!named && ts.isNamedImports(named) && named.elements.every((el) => el.isTypeOnly);
}

function relativeImports(file: string): Edge[] {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const edges: Edge[] = [];
  const visit = (node: ts.Node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      edges.push({ file, specifier: node.moduleSpecifier.text, typeOnly: isTypeOnly(node) });
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      edges.push({ file, specifier: node.arguments[0].text, typeOnly: false });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return edges.filter((edge) => edge.specifier.startsWith("."));
}

function sourceFor(from: string, specifier: string): string | undefined {
  const base = resolve(dirname(from), specifier.replace(/\.js$/, ""));
  return [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(existsSync);
}

/** Every relative import in the modules a function loads at runtime. */
function importGraph(entry: string): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const edge of relativeImports(file)) {
      edges.push(edge);
      const next = sourceFor(file, edge.specifier);
      if (next && !edge.typeOnly) queue.push(next);
    }
  }
  return edges;
}

const show = (edge: Edge) => `${relative(ROOT, edge.file)} → ${edge.specifier}`;
const entries = readdirSync(API)
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
  .map((name) => join(API, name));

describe("serverless function imports", () => {
  it("finds the functions to check", () => {
    expect(entries.map((file) => relative(ROOT, file))).toEqual(
      expect.arrayContaining(["api/blog-posts.ts", "api/calculators.ts"]),
    );
  });

  it.each(entries.map((file) => [relative(ROOT, file), file]))("%s loads on Node ESM and in the Next build", (_name, entry) => {
    const edges = importGraph(entry);
    const inApi = (edge: Edge) => edge.file.startsWith(API);

    expect(edges.filter((edge) => inApi(edge) && !edge.specifier.endsWith(".js")).map(show)).toEqual([]);
    expect(edges.filter((edge) => !inApi(edge) && !edge.typeOnly).map(show)).toEqual([]);
    expect(edges.filter((edge) => !sourceFor(edge.file, edge.specifier)).map(show)).toEqual([]);
  });
});
