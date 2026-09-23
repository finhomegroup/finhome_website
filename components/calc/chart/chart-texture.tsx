/**
 * The NON-COLOUR channel for stacked fills.
 *
 * THE DEFECT THIS EXISTS TO FIX. An independent visual review found that a
 * stacked segment was identifiable by its fill COLOUR and by nothing else:
 * `bar-chart.tsx` drew each segment as a plain coloured rectangle, and the
 * legend's mark for it was a coloured dot of the same shape as every other
 * dot. The palette is two greens and two neutrals (`SWATCHES` in
 * `chart-figure.tsx`), and the two greens are close enough that a reader who
 * cannot separate those hues could see the segment lengths and still not know
 * which quantity each one was. Line series already carry a second channel —
 * `STROKE_DASH`, mirrored in the legend — and this is the same rule finally
 * holding for fills.
 *
 * It is FULFILMENT OF THE EXISTING CHART CONTRACT, not a new gate: every model
 * in this suite already ships a summary sentence and a real table, and those
 * remain the authoritative reading of the numbers.
 *
 * CORRECTED: THE ENCODING IS BY SERIES, NOT BY PALETTE SLOT. The first version
 * of this file keyed the texture to `paletteSlot`, which takes
 * `% PALETTE_SLOTS`, and said "four slots need four distinguishable fills". A
 * second independent review measured what that means on a real figure — the
 * six-segment "Mỗi tháng tiền đi đâu" allocation bar on `kha-nang-mua-nha` at
 * 390×844, with widths 36/10/6/8/2/26 % of a 50 tr scale:
 *
 *     series 0 "Sinh hoạt thiết yếu"  and series 4 "Chi phí nhà ở khác"
 *       → the same grey AND the same plain fill
 *     series 1 "Nợ đang trả"          and series 5 "Còn lại chưa dùng"
 *       → the same green AND the same hatch
 *
 * A wrapped texture is not a second channel at all for those pairs: it repeats
 * exactly where the colour repeats, so the two duplicates cancel instead of
 * disambiguating. The texture is therefore keyed to `seriesIndex` — the
 * UNWRAPPED position in the model's declared legend order — while the colour
 * keeps wrapping at four. Both come from the one `paletteIndexByKey` map the
 * legend reads, so a segment's texture still cannot disagree with its swatch,
 * which is the defect `lib/calc/charts/palette.ts` was written to end.
 *
 * THE LIST IS AS LONG AS THE WORST REAL MODEL, PLUS HEADROOM. The widest
 * legend in the suite is the vehicle-budget figure's SEVEN entries (income,
 * essentials, other debts, reserve, instalment, running costs when they are
 * included, leftover); the allocation bar's six is the second widest. Eight
 * encodings cover both with one spare, and `legend-render.test.ts` ratchets
 * that no model outgrows the list unnoticed.
 *
 * SERIES 0 IS PLAIN on purpose. The first-listed series — usually the largest,
 * or the reader's own money — stays a clean block, and "nothing" is the least
 * cluttered member of any set of encodings.
 *
 * WHY A `<pattern>` AND NOT DRAWN LINES. A pattern tiles the shape it fills,
 * so the same definitions serve a horizontal bar, a narrow column and an
 * irregular area band without any per-shape clipping arithmetic. The price is
 * an id, and an id must be unique in a document that can hold two figures:
 * each drawing passes a `prefix` from its own `useId`, so two charts on one
 * page cannot collide.
 *
 * WHAT IS NOT CLAIMED HERE. Nothing in this repo's test environment can see a
 * rendered pattern; these tests establish that the marks exist, that they are
 * keyed the way the legend is keyed, that every simultaneous series gets a
 * DIFFERENT one, and that the plain series stays plain. Whether the eight
 * textures are TELLABLE APART at 390 px is a browser measurement.
 */
/**
 * The texture for each series, in the model's declared legend order.
 *
 * One list, read by the pattern definitions below and by the legend's marks,
 * for the reason `STROKE_DASH` is one list: two of them would drift.
 *
 * The family is deliberately structural rather than tonal — nothing here is
 * distinguished by DENSITY alone, which is what fails first when a segment is
 * 2 % of a bar wide. Reading the list: nothing, `/`, dots, `+`, `\`, `|`, `—`,
 * `×`.
 */
export const TEXTURE_KINDS = [
  "plain",
  "hatch",
  "dots",
  "grid",
  "backhatch",
  "vstripe",
  "hstripe",
  "cross",
] as const;

export type TextureKind = (typeof TEXTURE_KINDS)[number];

/**
 * The texture a SERIES draws, from its unwrapped index (`seriesIndex`).
 *
 * The modulo is a last resort, not the encoding: it exists so a model with
 * more series than there are textures still renders something instead of
 * `undefined`, and `legend-render.test.ts` fails before such a model ships.
 * Passing a WRAPPED palette slot here is the defect described above.
 */
export function textureKind(series: number): TextureKind {
  return TEXTURE_KINDS[series % TEXTURE_KINDS.length];
}

/**
 * The `fill` for a series' texture overlay, or `undefined` for the plain one.
 *
 * The caller draws the COLOURED rect first and this on top of it, rather than
 * building the colour into the pattern: the colours are Tailwind classes and a
 * pattern's own content cannot resolve `currentColor` from the element that
 * references it.
 */
export function textureFill(prefix: string, series: number): string | undefined {
  const kind = textureKind(series);
  return kind === "plain" ? undefined : `url(#${prefix}-${kind})`;
}

/**
 * The patterns, in one drawing's user units.
 *
 * `tile` is the repeat distance in the REFERENCING element's user space —
 * which is why it is a prop: a bar track is 100 units wide and a plot box is
 * 360, so the same rendered pitch is a different number in each. Aim for a
 * tile that renders around 8–10 px on a phone.
 *
 * `patternUnits="userSpaceOnUse"` rather than the default `objectBoundingBox`,
 * so the pitch is the same on a long segment and a short one — a texture that
 * stretched with its segment would be a second, misleading size channel.
 *
 * Every kind but `plain` is defined unconditionally. A drawing does not know
 * which series a figure's legend will list, and an unreferenced `<pattern>`
 * paints nothing.
 */
export function TextureDefs({
  prefix,
  tile,
}: {
  prefix: string;
  tile: number;
}) {
  /** One stripe direction: a single line in a rotated tile repeats seamlessly. */
  const stripe = (kind: TextureKind, rotate: number | null, vertical: boolean) => (
    <pattern
      id={`${prefix}-${kind}`}
      width={tile}
      height={tile}
      patternUnits="userSpaceOnUse"
      {...(rotate === null ? {} : { patternTransform: `rotate(${rotate})` })}
    >
      <line
        x1={0}
        y1={0}
        x2={vertical ? 0 : tile}
        y2={vertical ? tile : 0}
        strokeWidth={tile * 0.3}
        strokeOpacity={0.4}
        className="stroke-ink"
      />
    </pattern>
  );

  /** Both directions at once, at the tile's own angle. */
  const lattice = (kind: TextureKind, rotate: number | null) => (
    <pattern
      id={`${prefix}-${kind}`}
      width={tile}
      height={tile}
      patternUnits="userSpaceOnUse"
      {...(rotate === null ? {} : { patternTransform: `rotate(${rotate})` })}
    >
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={tile}
        strokeWidth={tile * 0.2}
        strokeOpacity={0.4}
        className="stroke-ink"
      />
      <line
        x1={0}
        y1={0}
        x2={tile}
        y2={0}
        strokeWidth={tile * 0.2}
        strokeOpacity={0.4}
        className="stroke-ink"
      />
    </pattern>
  );

  return (
    <defs>
      {/* Diagonal stripes. Drawing the diagonal itself would need three lines
          to cover the tile's corners; rotating the tile needs one. */}
      {stripe("hatch", 45, true)}

      <pattern
        id={`${prefix}-dots`}
        width={tile}
        height={tile}
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx={tile / 2}
          cy={tile / 2}
          r={tile * 0.2}
          fillOpacity={0.42}
          className="fill-ink"
        />
      </pattern>

      {/* A grid, which is the two stripe directions at once: distinguishable
          from the diagonal one by direction, not by density. */}
      {lattice("grid", null)}

      {/* The opposite diagonal, the two axis-aligned stripes on their own, and
          the diagonal lattice. Direction, not density, separates all four from
          `hatch` and `grid` — the reason the list can reach eight without any
          two members differing only in how dark they look. */}
      {stripe("backhatch", -45, true)}
      {stripe("vstripe", null, true)}
      {stripe("hstripe", null, false)}
      {lattice("cross", 45)}
    </defs>
  );
}

/**
 * The legend's copy of a series' texture, at swatch size.
 *
 * DRAWN LITERALLY rather than through the patterns above, because a 10-unit
 * swatch holds two or three marks and a tiled pattern at that size reads as
 * grey mush. It switches on the SAME `textureKind`, so the channel cannot
 * drift between the key and the drawing even though the two draw it at
 * different scales.
 *
 * Returns the marks only; the caller draws the coloured rect under them, so
 * the swatch's colour still comes from `SERIES_FILL` and nothing here has to
 * know the palette.
 *
 * Two marks per line kind, at the pattern's own angle: one line reads as a
 * divider and three crowd a 10-unit box.
 */
export function TextureMarks({
  kind,
  size,
}: {
  kind: TextureKind;
  size: number;
}) {
  if (kind === "plain") return null;

  if (kind === "dots") {
    return (
      <g className="fill-ink" fillOpacity={0.42}>
        <circle cx={size * 0.28} cy={size * 0.28} r={size * 0.1} />
        <circle cx={size * 0.72} cy={size * 0.28} r={size * 0.1} />
        <circle cx={size * 0.28} cy={size * 0.72} r={size * 0.1} />
        <circle cx={size * 0.72} cy={size * 0.72} r={size * 0.1} />
      </g>
    );
  }

  const lines = () => {
    if (kind === "grid") {
      return [
        { x1: size * 0.5, y1: 0, x2: size * 0.5, y2: size },
        { x1: 0, y1: size * 0.5, x2: size, y2: size * 0.5 },
      ];
    }
    if (kind === "cross") {
      // The diagonal lattice: one stroke each way, crossing in the middle.
      return [
        { x1: 0, y1: 0, x2: size, y2: size },
        { x1: 0, y1: size, x2: size, y2: 0 },
      ];
    }
    if (kind === "vstripe") {
      return [
        { x1: size * 0.3, y1: 0, x2: size * 0.3, y2: size },
        { x1: size * 0.7, y1: 0, x2: size * 0.7, y2: size },
      ];
    }
    if (kind === "hstripe") {
      return [
        { x1: 0, y1: size * 0.3, x2: size, y2: size * 0.3 },
        { x1: 0, y1: size * 0.7, x2: size, y2: size * 0.7 },
      ];
    }
    if (kind === "backhatch") {
      // The mirror of `hatch`, so the two are told apart by direction here as
      // well as in the plot.
      return [
        { x1: 0, y1: size * 0.45, x2: size * 0.45, y2: size },
        { x1: size * 0.55, y1: 0, x2: size, y2: size * 0.55 },
      ];
    }
    // Hatch: the same 45° direction as the pattern, at two stripes.
    return [
      { x1: 0, y1: size * 0.55, x2: size * 0.45, y2: 0 },
      { x1: size * 0.55, y1: size, x2: size, y2: size * 0.45 },
    ];
  };

  return (
    <g className="stroke-ink" strokeOpacity={0.55} strokeWidth={size * 0.12}>
      {lines().map((line, index) => (
        <line key={index} {...line} />
      ))}
    </g>
  );
}
