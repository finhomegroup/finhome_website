import { describe, expect, it, vi } from "vitest";

import handler from "../../api/calculators";
import { liveCalculators } from "./registry";

function response() {
  const result = {
    statusCode: 0,
    body: undefined as unknown,
    headers: new Map<string, string>(),
  };
  const res = {
    status: vi.fn((statusCode: number) => {
      result.statusCode = statusCode;
      return res;
    }),
    json: vi.fn((body: unknown) => {
      result.body = body;
      return res;
    }),
    setHeader: vi.fn((name: string, value: string) => {
      result.headers.set(name, value);
      return res;
    }),
  };
  return { res, result };
}

describe("GET /api/calculators", () => {
  it("derives the public catalogue and count from the live registry", () => {
    const { res, result } = response();
    handler({ method: "GET" } as never, res as never);

    const body = result.body as { total: number; tools: Record<string, unknown>[] };
    expect(result.statusCode).toBe(200);
    expect(body.total).toBe(liveCalculators().length);
    expect(body.tools).toHaveLength(liveCalculators().length);
    expect(body.tools[0]).toMatchObject({
      slug: "vay-mua-nha",
      categoryLabel: "Vay & Thế chấp",
    });
    expect(result.headers.get("Cache-Control")).toContain("stale-while-revalidate");
  });

  it("rejects non-GET methods", () => {
    const { res, result } = response();
    handler({ method: "POST" } as never, res as never);
    expect(result.statusCode).toBe(405);
    expect(result.body).toEqual({ error: "Method not allowed" });
  });
});

