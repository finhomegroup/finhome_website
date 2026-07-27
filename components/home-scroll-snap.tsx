"use client";

import { useEffect } from "react";

const SNAP_CLASS = "home-snap-y";
const DURATION_MS = 550;
const WHEEL_THRESHOLD = 10;

function getSections(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("main > section"),
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sectionCanScrollInner(section: HTMLElement, deltaY: number): boolean {
  const max = section.scrollHeight - section.clientHeight;
  if (max <= 1) return false;
  if (deltaY > 0) return section.scrollTop < max - 1;
  return section.scrollTop > 1;
}

function currentIndex(sections: HTMLElement[]): number {
  const probe = window.scrollY + window.innerHeight * 0.35;
  let best = 0;
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].offsetTop <= probe) best = i;
  }
  return best;
}

function maxScrollY(): number {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function isPastLastSection(sections: HTMLElement[]): boolean {
  if (sections.length === 0) return false;
  const last = sections[sections.length - 1];
  return window.scrollY > last.offsetTop + window.innerHeight * 0.2;
}

/**
 * Full-page section scroll: one wheel / key step → next or previous section.
 * From the last section, one more scroll down jumps to the footer; from the
 * footer, one scroll up returns to the last section.
 */
export function HomeScrollSnap() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(SNAP_CLASS);
    const previousPadding = root.style.scrollPaddingTop;
    const previousBehavior = root.style.scrollBehavior;
    const previousRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";
    root.style.scrollPaddingTop = "0px";
    root.style.scrollBehavior = "auto";

    const jumpTop = () => {
      if (window.location.hash) return;
      window.scrollTo(0, 0);
    };
    jumpTop();
    requestAnimationFrame(jumpTop);
    window.addEventListener("pageshow", jumpTop);

    let locked = false;
    let rafAnim = 0;
    let unlockTimer = 0;

    const cancelAnim = () => {
      if (rafAnim) {
        cancelAnimationFrame(rafAnim);
        rafAnim = 0;
      }
      window.clearTimeout(unlockTimer);
    };

    const animateToY = (targetY: number) => {
      cancelAnim();
      locked = true;

      const startY = window.scrollY;
      const distance = targetY - startY;
      const clamped = Math.max(0, Math.min(maxScrollY(), targetY));

      const finish = () => {
        window.scrollTo(0, clamped);
        rafAnim = 0;
        unlockTimer = window.setTimeout(() => {
          locked = false;
        }, 80);
      };

      if (Math.abs(distance) < 2 || prefersReducedMotion()) {
        finish();
        return;
      }

      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        window.scrollTo(0, startY + (clamped - startY) * easeInOutCubic(t));
        if (t < 1) {
          rafAnim = requestAnimationFrame(tick);
        } else {
          finish();
        }
      };

      rafAnim = requestAnimationFrame(tick);
    };

    const goToIndex = (index: number) => {
      const sections = getSections();
      if (index < 0 || index >= sections.length) return;
      animateToY(sections[index].offsetTop);
    };

    const goToFooter = () => {
      animateToY(maxScrollY());
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;

      const sections = getSections();
      if (sections.length === 0) return;

      const last = sections.length - 1;
      const index = currentIndex(sections);
      const section = sections[Math.min(index, last)];

      // Footer → last section in one step.
      if (event.deltaY < 0 && isPastLastSection(sections)) {
        event.preventDefault();
        if (!locked) goToIndex(last);
        return;
      }

      // Tall section: finish inner scroll before changing page position.
      if (!locked && sectionCanScrollInner(section, event.deltaY)) return;

      event.preventDefault();
      if (locked) return;

      if (event.deltaY > 0) {
        if (index < last) goToIndex(index + 1);
        else goToFooter(); // last section → footer in one step
      } else {
        if (index > 0) goToIndex(index - 1);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const keys = [
        "PageDown",
        "PageUp",
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
        " ",
      ];
      if (!keys.includes(event.key)) return;
      if (
        event.target instanceof HTMLElement &&
        (event.target.closest(
          "input, textarea, select, [contenteditable=true]",
        ) ||
          event.target.isContentEditable)
      ) {
        return;
      }

      const sections = getSections();
      if (sections.length === 0) return;

      const last = sections.length - 1;
      const index = currentIndex(sections);
      const down =
        event.key === "PageDown" ||
        event.key === "ArrowDown" ||
        (event.key === " " && !event.shiftKey);
      const up =
        event.key === "PageUp" ||
        event.key === "ArrowUp" ||
        (event.key === " " && event.shiftKey);

      if (event.key === "Home") {
        event.preventDefault();
        if (!locked) goToIndex(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        if (!locked) goToFooter();
        return;
      }

      if (up && isPastLastSection(sections)) {
        event.preventDefault();
        if (!locked) goToIndex(last);
        return;
      }

      if (down) {
        event.preventDefault();
        if (locked) return;
        if (index < last) goToIndex(index + 1);
        else goToFooter();
        return;
      }
      if (up) {
        event.preventDefault();
        if (locked) return;
        if (index > 0) goToIndex(index - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.classList.remove(SNAP_CLASS);
      root.style.scrollPaddingTop = previousPadding;
      root.style.scrollBehavior = previousBehavior;
      window.history.scrollRestoration = previousRestoration;
      cancelAnim();
      window.removeEventListener("pageshow", jumpTop);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
