import { useSyncExternalStore } from "react";

const MD_QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MD_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

/**
 * SSR-safe Tailwind `md` gate. Server snapshot is always `false` so the first
 * client paint matches SSR (no tilt until after hydration when md applies).
 */
export function useMinWidthMd(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MD_QUERY).matches,
    () => false,
  );
}
