"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Renders nothing in place of a subtree that threw, so an optional island —
 * the tool-first hero — can never take the calculator down with it.
 *
 * For CLIENT renders: React's server renderer does not consult error
 * boundaries, so a component guarded by this one must also keep its own pure
 * computations from throwing during the prerender (the hero does, with a
 * try/catch around its builders). What remains below it is the page's own
 * form and result, which carry the answer on their own.
 */
export class RenderBoundary extends Component<
  {
    children: ReactNode;
    /** When this changes after a failure, the subtree is tried again. */
    resetKey?: string;
  },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidUpdate(previous: { resetKey?: string }): void {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Visible to a developer, silent to the reader: the tool below still works.
    console.error("RenderBoundary caught", error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
