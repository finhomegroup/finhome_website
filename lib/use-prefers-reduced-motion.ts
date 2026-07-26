import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
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
