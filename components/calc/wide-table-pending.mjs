// Pages with a wide table that does NOT yet pass `mobileCards`.
//
// THE RULE, from docs §3: set `mobileCards` from five columns up; four fit at
// 390 px compacted. Above that a real `<table>` scrolls sideways inside its
// `overflow-x-auto` frame instead of being read — measured on
// `phan-tich-an-sinh-xa-hoi` at a verified 390×844 viewport as 596 px inside a
// 300 px frame, with three of its SIX columns off-screen, and the three
// off-screen ones were the columns the paragraph beneath the table was
// comparing.
//
// WHY AN ALLOWLIST RATHER THAN A STRAIGHT ASSERTION. Asserting the rule across
// the suite today would go red on every entry below at once, across several
// units' rows plus pages nobody is holding, and a red shared tree is how work
// gets reverted rather than fixed. The `MULTI_LIVE_ALLOWLIST` shape solves it
// the way this repo already solves it: assert the PROPERTY, list the known
// exceptions with a reason each, and let the list shrink. The debt becomes
// visible instead of silent, and each owner deletes its own line — two entries
// have already come off this way.
//
// So an entry here is a DEBT, not a dispensation — unlike
// `MULTI_LIVE_ALLOWLIST`, whose single entry is a genuine exception to its
// convention. `check:markup` fails BOTH ways, so a stale line is as red as a
// new violation: you cannot delete a line without fixing the table, and you
// cannot fix the table without deleting the line.
//
// HOW TO COUNT, because this list was wrong three separate ways before it was
// right. Count header cells in `<thead>` ONLY, per `<table>`, on the BUILT
// export, matching `<th[\s>]`:
//
//   - Counting every `<th>` in the table counts one per row for any table
//     using `<th scope="row">` on its first body cell. That reported 23 "th"
//     for `cac-chi-so-tai-chinh`, which has THREE columns and twenty labelled
//     rows.
//   - Counting `scope="col"` undercounts by one where the leading header
//     carries no scope.
//   - Matching the bare prefix `<th` counts the table's own `<thead` opening
//     tag as a column, inflating every figure by exactly one. That version
//     shipped, and at a threshold of five it made the effective rule FOUR real
//     columns — one stricter than docs §3 — putting six four-column pages in
//     this list for a rule they already satisfied, `vay-mua-nha` among them,
//     reported at the time as the highest-priority violation in the suite.
//
// The tell was available before it was believed: a human had measured row 54
// in a browser as three of six columns off-screen, and the script said seven.
// When a derived number disagrees with a measured one, suspect the derivation.
//
// And the card fallback's signature is `<ul ... md:hidden>`, never the
// presence of a `<dl>`: `so-sanh-khoan-vay` ships a `<dl>` for something else
// entirely and no cards at all, so a `<dl>` test silently cleared the
// highest-priority page here.
//
// A plain .mjs for the same reason as the multi-live list: a Node script can
// import it with no TypeScript and no build step, and a `.ts` vitest test can
// import it too.
//
// EACH ENTRY NOW CARRIES MEASURED EVIDENCE, and adding it proved the rule wrong
// in both directions at once.
//
// On 2026-09-16 every live route was rendered at a verified 390 px layout
// viewport — same-origin iframes against the built export, recorded in
// `docs/visual-evidence.json` — and the column count turned out to be
// INDEPENDENT of whether the table actually overflows:
//
//   - `lai-kep` has FIVE columns, violates docs §3, and does NOT overflow at
//     390 px. Five short numeric columns compress and fit.
//   - `vay-thuong-mai` and `lai-suat-thuc-te` have FOUR columns each, satisfy
//     docs §3, and DO overflow — long Vietnamese header text, not column count.
//
// So the threshold is a cheap static PROXY for the symptom, and `measured390`
// records the symptom itself. The two four-column rows are in
// `NARROW_OVERFLOW_MEASURED` below rather than in this list, deliberately:
// `check:markup` checks this list BOTH ways against the five-column rule, so a
// non-violator listed here would be reported as a stale entry and the fix
// would look like the bug.
//
// `measured390` is pinned against the manifest by
// `wide-table-pending.test.ts`, so it cannot drift from the measurement it
// claims to quote — the same pairing as `shipped()`/`verified` in
// `content/calculators/statutory-parameters.ts`.
//
// A NOTE ON THE EARLIER MISTAKE IN THIS FILE'S HISTORY, now that there is
// evidence: the `<th` prefix bug made the effective rule FOUR columns, and it
// was corrected as a pure error. Measurement shows the stricter behaviour was
// catching something real — four-column tables that overflow — for entirely
// the wrong reason. Right answer, wrong derivation, and only measuring
// separated the two.
export const WIDE_TABLE_PENDING = [
  // ----------------------------------------------------- P1 and P2: fix first
  // Their readers are the audience this site exists for.
  //
  // `so-sanh-khoan-vay` AND `lai-co-dinh-hay-tha-noi` WERE THE FIRST TWO
  // ENTRIES HERE and were fixed together on 2026-09-16, because they are two
  // routes over ONE component (`LoanCompareCalculator`) and therefore one
  // chart builder: `mobileCards` on `costBarsModel`'s six-column table cleared
  // the §3 violation on both at once.
  //
  // The design objection this list recorded against that fix did not survive
  // measurement. It read: "it is a COMPARISON, so the value is the row read
  // across and a per-row card block breaks that up". But that table's ROWS are
  // offers and its COLUMNS are metrics, so a card per row is a card per offer
  // — a coherent per-offer cost summary. The metric-read-across-offers view a
  // comparison actually wants already exists on the same page as the
  // "So sánh từng chỉ tiêu" table, which is metrics-as-rows and measures
  // 281 px at 390. Nothing was lost by carding the wide one.
  //
  // Fixing the six-column table then exposed a SECOND overflow on the
  // fixed-vs-floating route only: its four-column payment table at 427 px,
  // caused by a composed `${side} — ${structure}` option label held on one
  // line by `nowrap`. See `lib/calc/charts/compare-chart.ts` — a table docs §3
  // expects to fit, overflowing for a reason the column rule cannot see, which
  // is the same lesson `NARROW_OVERFLOW_MEASURED` was opened for.
  {
    slug: "lai-kep",
    columns: 5,
    measured390: "fits",
    owner: "P2 — compound interest",
    reason: "P2, Vietnamese-facing, just over the bound.",
  },

  // THE P3/P4 SHELF IS CLEARED. Seven entries lived here — diem-pivot,
  // gop-401k, toi-da-401k, ira-truyen-thong-hay-roth, nien-kim,
  // phan-tich-thu-nhap-huu-tri (two tables) and rut-toi-thieu-bat-buoc —
  // and all eight tables were carded on 2026-09-16. Measured at a verified
  // 390 px viewport before and after, each inside a 300 px scroll frame:
  //
  //   gop-401k                     750 px  ratio 2,50  ->  carded
  //   phan-tich-thu-nhap-huu-tri   724 px  ratio 2,41  ->  carded (2nd table)
  //   nien-kim                     632 px  ratio 2,11  ->  carded
  //   diem-pivot                   617 px  ratio 2,06  ->  carded
  //   rut-toi-thieu-bat-buoc       605 px  ratio 2,02  ->  carded
  //   phan-tich-thu-nhap-huu-tri   586 px  ratio 1,95  ->  carded (1st table)
  //   ira-truyen-thong-hay-roth    537 px  ratio 1,79  ->  carded
  //   toi-da-401k                  463 px  ratio 1,54  ->  carded
  //
  // All eight shared one shape: a prose or index first column plus numeric
  // measures, with the ROW as the varying entity — a method, a contribution
  // rate, an age, an income source. A card per row is that entity's whole
  // outcome, which is the reading each page is built around, so these were
  // the ordinary docs §3 case rather than design questions.
  //
  // `diem-pivot` was the one exception and its objection is answered where
  // the fix lives, in `components/pivot-calculator.tsx`: cards do cost the
  // read DOWN a column that compares four conventions at one level, but at
  // a ratio of 2,06 only about two of seven level columns were on screen,
  // so that comparison was not available to lose.
];

/**
 * Rows whose table OVERFLOWS 390 px while satisfying the five-column rule.
 *
 * Found by measurement, not by the rule, and kept apart from
 * `WIDE_TABLE_PENDING` for a mechanical reason: that list is the allowlist for
 * docs §3 and `check:markup` verifies it in both directions, so a row that does
 * not violate the column rule cannot be listed there without being reported as
 * stale.
 *
 * These are therefore NOT debts against docs §3 — they are evidence that docs
 * §3 under-detects. A threshold on columns can never catch them, and a
 * rendered-width check is the only thing that will. `check:markup` parses HTML
 * and has no layout engine, so that check cannot live in the gate; it lives in
 * the measurement sweep instead.
 *
 * EMPTY IS THE GOAL STATE, and it is now empty. Both entries were fixed on
 * 2026-09-16 and re-measured at a verified 390 px viewport: `vay-thuong-mai`
 * went 485 px -> 300 px inside its 300 px frame with 12 over-wide elements ->
 * 0, and `lai-suat-thuc-te` 400 px -> `mobileCards` with 13 -> 0.
 *
 * THE CAUSE RECORDED HERE WAS HALF WRONG, which is worth keeping because it
 * changed the fix. This docstring used to say "the cause in both cases is
 * header text length". Per-column measurement showed that was true only of
 * `lai-suat-thuc-te`. On `vay-thuong-mai` the headers merely MATCHED the
 * width of what was beside them: the real causes were an 8,5rem prose label
 * floor misapplied to a column of "1", "2", "3" (136 px for content needing
 * 32) and untyped money cells, which opted the table out of the compact
 * reading and pinned each amount column at the width of "5.000.000.000"
 * (125 px). Shortening its headers alone moved the table 380 px -> 380 px:
 * no gain at all, because they were not the binding constraint.
 *
 * The lesson for the next rendered-width finding is that "the widest text in
 * the column" is not the same as "the reason the column is that wide". Only
 * changing one thing at a time separates them.
 */
export const NARROW_OVERFLOW_MEASURED = [];
