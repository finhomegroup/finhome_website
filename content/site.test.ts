import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "@/content/site";

describe("site navigation", () => {
  it("links the calculator suite from the main menu", () => {
    expect(NAV_ITEMS).toContainEqual({
      label: "Công cụ",
      href: "/cong-cu/",
    });
  });
});
