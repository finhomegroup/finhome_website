import { describe, expect, it, vi } from "vitest";
import {
  APP_MAX_TEXT_SCALE,
  APP_MODE_STORAGE_KEY,
  APP_PRESENTATION_BOOTSTRAP,
} from "./app-presentation";

function runBootstrap(pathname: string, search: string, stored: Record<string, string> = {}) {
  const setAttribute = vi.fn();
  const setProperty = vi.fn();
  const replaceState = vi.fn();
  const store = { ...stored };
  const windowLike: Record<string, unknown> = {
    location: { pathname, search, hash: "", href: `https://www.finhome.group${pathname}${search}` },
    history: { state: null, replaceState },
    sessionStorage: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    },
  };
  const documentLike = { documentElement: { setAttribute, style: { setProperty } } };
  Function("window", "document", APP_PRESENTATION_BOOTSTRAP)(windowLike, documentLike);
  return { setAttribute, setProperty, replaceState, store, windowLike };
}

describe("calculator app presentation bootstrap", () => {
  it("stays inert for ordinary website visits", () => {
    const result = runBootstrap("/cong-cu/lai-kep/", "");
    expect(result.setAttribute).not.toHaveBeenCalled();
    expect(result.windowLike.__FINHOME_APP__).toBeUndefined();
  });

  it("ignores ?app=1 outside the calculators, so it cannot strip chrome from other pages", () => {
    for (const path of ["/", "/blog/lai-suat/", "/privacy-policy"]) {
      const result = runBootstrap(path, "?app=1&textScale=1");
      expect(result.setAttribute).not.toHaveBeenCalled();
      expect(result.store[APP_MODE_STORAGE_KEY]).toBeUndefined();
    }
  });

  it("enables app mode, scales type up to AX5, and turns analytics off", () => {
    const result = runBootstrap("/cong-cu/lai-kep/", "?app=1&textScale=3.1");
    expect(result.setAttribute).toHaveBeenCalledWith("data-finhome-app", "true");
    expect(result.setProperty).toHaveBeenCalledWith("--fh-app-root-font-size", "310%");
    expect(result.windowLike.__FINHOME_APP__).toBe(true);
    const capped = runBootstrap("/cong-cu/lai-kep/", "?app=1&textScale=9");
    expect(capped.setProperty).toHaveBeenCalledWith("--fh-app-root-font-size", `${APP_MAX_TEXT_SCALE * 100}%`);
  });

  it("removes the app parameters from the address once read", () => {
    const result = runBootstrap("/cong-cu/lai-kep/", "?app=1&textScale=1.35");
    expect(result.replaceState).toHaveBeenCalledWith(null, "", "/cong-cu/lai-kep/");
  });

  it("keeps app mode for the tab after a load without the parameters", () => {
    const first = runBootstrap("/cong-cu/lai-kep/", "?app=1&textScale=1.35");
    const later = runBootstrap("/cong-cu/thue-hay-mua/", "", first.store);
    expect(later.setAttribute).toHaveBeenCalledWith("data-finhome-app", "true");
    expect(later.setProperty).toHaveBeenCalledWith("--fh-app-root-font-size", "135%");
  });
});
