"use client";

import { useEffect, useId, useState } from "react";
import { GranaryFigure } from "@/components/calc/granary-figure";
import { LeverStepper } from "@/components/calc/lever-stepper";
import { RenderBoundary } from "@/components/calc/render-boundary";
import { CompactStatusCard } from "@/components/calc/compact-status-card";
import {
  changeEcho,
  valuesKey,
  type ChangeEcho,
} from "@/components/retirement-granary-echo";
import {
  buildHeroView,
  type HeroView,
} from "@/components/retirement-granary-hero-view";
import { HeroReading } from "@/components/retirement-granary-reading";
import { RetirementTargetPanel } from "@/components/retirement-granary-target";
import { heldTrial, type TargetTrial } from "@/components/retirement-plan-target-view";
import {
  useRetirementPlan,
  type RetirementPlanValue,
} from "@/components/retirement-plan-state";
import type { LeverKey } from "@/lib/calc/retirement-levers";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const H = C.hero;

/**
 * /cong-cu/ke-hoach-huu-tri/'s tool-first hero, directly under the `h1`:
 * the verdict card, the granary of bowls, the three levers, the target —
 * how much to have at retirement, and one change that gets there — then the
 * reading.
 *
 * ONLY FIXED-HEIGHT BLOCKS SIT ABOVE THE LEVERS. The card is reserved at its
 * tallest state and the figure at three rows, so a press that flips the
 * verdict or adds a year cannot move the button that was just pressed.
 * Everything whose length depends on the answer — the legend, the bowls in
 * words, the reasons, the conditions — comes after them.
 *
 * THE CARD RENDERS ONCE, HERE. It left the result region, which keeps the
 * ONE live sentence (docs §1b): nothing in this subtree is live, and the
 * levers are plain buttons, so a press is announced once, by that region,
 * when it settles.
 *
 * OPTIONAL BY CONSTRUCTION. Every figure and sentence is built by the pure
 * `buildHeroView`, guarded here — the server renderer ignores error
 * boundaries — and `RenderBoundary` guards the client render. If either
 * fails, this renders nothing and the form and the result below still carry
 * the whole answer.
 */
export function RetirementGranaryHero() {
  const state = useRetirementPlan();
  let view: HeroView | null = null;
  let failure: string | null = null;
  try {
    view = buildHeroView(state);
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }
  // One log per distinct failure, not one per render while it keeps failing.
  useEffect(() => {
    if (failure !== null) console.error("RetirementGranaryHero", failure);
  }, [failure]);
  if (view === null) return null;
  return <HeroWithTrial state={state} view={view} />;
}

function HeroWithTrial({ state, view }: { state: RetirementPlanValue; view: HeroView }) {
  const [trial, setTrial] = useState<TargetTrial | null>(null);
  const model = view.model;
  const echo = state.lastPress;
  const values = state.fields.values;
  // The try can be taken back only while its field still holds the tried
  // value. Once the reader moves it, the try is spent and dropped here, in
  // render — React's reset-on-change pattern — so moving back to the same
  // figure later brings no undo that would skip what they typed in between.
  const live = heldTrial(trial, values);
  if (live !== trial) setTrial(live);
  // A press writes the field through the same binding a keystroke uses; the
  // echo is computed here, where the next value is known.
  const step = (key: LeverKey, next: string) => {
    let nextEcho: ChangeEcho | null = null;
    try {
      nextEcho = changeEcho(state, model, key, next, (echo?.serial ?? 0) + 1);
    } catch (error) {
      console.error("RetirementGranaryHero echo", error);
    }
    state.press(key, next, nextEcho);
  };
  return (
    // A client error in the layout empties this slot until the values change,
    // then it tries again — never the rest of the session without levers.
    <RenderBoundary resetKey={valuesKey(values)}>
      <HeroLayout
        view={view}
        echo={echo}
        onStep={step}
        onApply={(key, next) => {
          setTrial({ key, before: values[key] ?? "", after: next });
          step(key, next);
        }}
        undo={
          live
            ? () => {
                setTrial(null);
                step(live.key, live.before);
              }
            : null
        }
      />
    </RenderBoundary>
  );
}

function HeroLayout({
  view,
  echo,
  onStep,
  onApply,
  undo,
}: {
  view: HeroView;
  echo: ChangeEcho | null;
  onStep: (key: LeverKey, next: string) => void;
  onApply: (key: LeverKey, next: string) => void;
  undo: (() => void) | null;
}) {
  const summaryId = useId();
  const { model } = view;
  const drawn = model.kind === "unavailable" ? null : model;

  return (
    <div
      data-granary-hero="true"
      data-bowl-count={drawn?.bowls.length}
      data-first-short-age={drawn?.firstShortAge ?? undefined}
      // From `md`: the card beside the house, then the levers across the width
      // (in three columns from `lg`), so at 1280×800 all three sit in the
      // first screen. DOM order is the reading order at every width: card,
      // figure, levers, target, then the reading.
      className="mt-4 text-left md:mt-6 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-4"
    >
      {/* Reserved at the tallest card state, measured 2026-09-27 after
          `fonts.ready`: 195 px at 390 px wide (the boundary and other-income
          titles), more below 360 px where the lines wrap, so a lever press
          that flips the verdict cannot move the figure or the levers below.
          The card itself hugs its text. */}
      {/* On a phone the card sits at the foot of its slot, against the house,
          so a short card leaves its spare room above rather than a gap below. */}
      <div data-hero-card-slot="true" className="flex min-h-[12.5rem] flex-col justify-end max-[359px]:min-h-[15rem] md:col-start-1 md:row-start-1 md:justify-start">
        <CompactStatusCard status={view.card} closing={view.closing} />
      </div>

      {/* Always drawn: with no plan it keeps its rows and says why it is empty,
          so a field cleared mid-edit does not pull the form up under the caret. */}
      <GranaryFigure
        bowls={drawn?.bowls ?? []}
        groups={drawn?.groups ?? []}
        ticks={drawn?.ticks ?? []}
        caption={drawn ? H.figure.label : H.figure.unavailableLabel}
        describedBy={drawn ? summaryId : undefined}
        changed={echo?.ages}
        changeKey={echo?.serial}
        echo={echo?.text}
        className="mt-2 md:col-start-2 md:row-start-1 md:mt-0 md:self-start"
      />

      <div className="mt-4 grid gap-y-4 md:col-span-2 md:row-start-2 md:mt-0 lg:grid-cols-3 lg:gap-x-5">
        {view.levers.map((lever) => (
          <LeverStepper
            key={lever.key}
            leverKey={lever.key}
            label={lever.label}
            value={lever.value}
            hint={lever.hint}
            down={lever.down}
            up={lever.up}
            onStep={(direction) => {
              const next = direction === 1 ? lever.up.next : lever.down.next;
              if (next !== null) onStep(lever.key, next);
            }}
          />
        ))}
      </div>

      {/* A suggestion applies through the same press a lever makes. */}
      <RetirementTargetPanel target={view.target} onApply={onApply} undo={undo} />

      <HeroReading view={view} summaryId={summaryId} />
    </div>
  );
}
