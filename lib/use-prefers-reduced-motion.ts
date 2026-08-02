import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  // `addEventListener` on MediaQueryList only exists from Safari 14 (iOS 14)
  // onward; older iOS only has the deprecated `addListener`. Without this
  // fallback, calling `addEventListener` throws on first mount on those
  // devices — crashing every section wrapped in `Reveal` before framer-motion
  // ever gets to reveal it, leaving the page stuck at its `opacity: 0` SSR
  // output.
  if (mql.addEventListener) {
    mql.addEventListener("change", onStoreChange);
    return () => mql.removeEventListener("change", onStoreChange);
  }
  mql.addListener(onStoreChange);
  return () => mql.removeListener(onStoreChange);
}

/** `useSyncExternalStore` (not `useState` + `useEffect`): the server snapshot
 * is always `false`, matching SSR output. framer-motion's own
 * `useReducedMotion()` reads `matchMedia` synchronously on first client
 * render instead — which mismatches SSR when the OS preference is already
 * "reduce" and causes a hydration error. A `useState` lazy initializer that
 * reads `window.matchMedia` has the same problem. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
