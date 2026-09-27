# Result-status pilot — independent verification

Date: 2026-09-27. Implementation: Claude Code session `9af4faa6-44fd-4ae3-bbbd-c8fe59557bf6`; independent review and browser verification: Codex.

## Scope and disposition

Implemented on `ke-hoach-huu-tri`, `vay-mua-xe`, and `kha-nang-mua-nha` only. The housing route includes an optional target-price comparison; the social-housing route is excluded. No financial formula, parser, existing numeric default, analytics, production deployment, commit or push was changed/performed in this follow-up. Shared presenters opt into semantic states, with neutral defaults.

Source remains on `feat/blog-visual-chapters-20260924`, based on `9c0c4b274923a3e953b2a20f4dbba50fefa23c95`, with the pilot uncommitted. Existing unrelated `artifacts/`, `design-qa.md`, and `docs/blog-editorial-redesign-2026-09-24.md` were preserved.

**Technical gate passed; bounded desktop/mobile UI checks passed. This is not a VoiceOver, full WCAG, physical-device, or user-comprehension sign-off.**

## Final technical proof

Command, from the workspace with Node 24.21.0:

```sh
workspace-harness/bin/aiws native check finhome-website --mode full
```

Run: **03:52:31–03:53:51 UTC**, after the final implementation/copy repair. Exit 0; persisted native-check evidence. Underlying command: `pnpm gate`.

| Check | Observed result |
|---|---|
| Vitest | 316 files, **7,088 tests passed** |
| TypeScript | Passed |
| Baseline-aware lint | 3 existing findings, **0 new** |
| Static build | 288 pages |
| Built markup | 76 live / 0 planned calculators plus 202 other pages; contracts pass |

Earlier 7,062 / 7,080 / 7,086 runs predate later repairs and are not final evidence. Only documentation of the verification was edited after this final source gate; `git diff --check` was rerun after those documentation edits.

## Real browser observations

Browser: Codex in-app browser, static `out/` served locally at `127.0.0.1:3236`. Rebuilt pages were reloaded, not inferred from source tests. Data was synthetic/default fixture data.

| Tool | Actions and observed outcome |
|---|---|
| Retirement | Default: red, shortage starts at age 82 versus horizon 85; 3 years short; annual spending gap **20,942,597 VND**, real capital **4,089,679,933 VND**. Contribution 120 million/year: green, qualified by assumptions. Clearing contribution via keyboard: neutral with no stale success. Restoring 60 million returns red. |
| Car | Running costs 5 million/month: red and **−1,498,818 VND** remaining. 2 million: green and **+1,501,182 VND**. Default running cost 0: amber. Blank essential costs: neutral, including a partial month already negative. Cash-only fixture (400 million price covered by 300 million down plus 100 million trade-in), running cost 12 million: exact-zero amber, not a deficit. |
| Housing | Default reference price **2,674,155,117 VND**, amber for omitted fees/reserve. Target 3 billion: red, **325,844,883 VND price difference**, explicitly not cash to add. Fees 3%, reserve 100 million, target 2 billion: green relative to **2,499,179,725 VND** range, difference **499,179,725 VND**. Ratio-only mode remains neutral within its ceiling. Blank essential costs stays neutral even with target above incomplete range. Zero monthly residual with a cash-only target is amber; after final copy repair, UI explicitly preserves the entered saving amount. |

Housing loan/payment rows are now explicitly labelled as values **at the maximum reference price**, not the target home's financing. The comparison does not compute a second loan or cash requirement for the entered target.

### Interaction, layout and chart checks

- All three pilots inspected at 1440×1000 and 390×844; document overflow checks at 320×640 also found no horizontal page overflow. Housing additionally checked at 1024×768: CTA stays in flow, not pinned. Narrow viewport checks are **not** a claim of real browser zoom or physical-device testing.
- `Xem kết quả` via Enter moves focus to the result anchor with valid inputs; retirement invalid contribution moves focus to that input. Status action buttons reach the corresponding field; housing's fee action also opens the containing advanced disclosure.
- Financial deficits leave valid inputs unmarked as errors. The action button remains brand green; status words/icons and the result card carry the financial state.
- Default retirement chart: red depletion marker at 82 and unmet span through 85; two original money series remain. Its data table labels 82 as the first shortage and 85 as unmet, without inventing a negative balance.
- Car chart and table both report a 1,498,818 VND monthly deficit. The annotation occupies a separate aligned rail, leaving category fills/textures unchanged.
- Housing chart and table agree on the target, reference price and 499,179,725 VND difference in the costed green fixture.
- The pilot DOM has one result live region, containing only a settled concise sentence; visible rows and card are outside it. The sticky summary is hidden from assistive technology and matches the card's tone. A changed retirement result was observed in the settled live text. This confirms DOM/runtime behavior, **not what VoiceOver actually speaks**.
- Browser error log was empty in the bounded final inspection.

### Contrast

Actual computed UI colors were checked against their adjacent backgrounds. Green text on its light card: **4.69:1**; green status rail on white: **5.11:1**. Red text on its light card: approximately **6.05:1**; red rail on white: approximately **6.57:1**. The action caption was repaired from `ink-3` (about 4.42:1 on red/green tints) to `ink-2` (about 6.64:1). Regression tests cover card text pairings and rails. Decorative borders/tints are not relied upon to convey meaning.

## Evidence and remaining checks

Local screenshots are in the workspace artifact folder:
`/Users/hai.trannam/Documents/ChatGPT/AI Workspace/artifacts/finhome-result-status-2026-09-27/`

- `04-retirement-final-desktop.png`, `05-retirement-final-chart.png`, `06-retirement-final-mobile.png`
- `07-car-final-mobile.png`, `08-car-final-chart.png`
- `09-home-final-mobile.png`, `10-home-final-chart.png`

The final two copy-only changes were rechecked after the last build; the car mobile image was refreshed. Earlier captures remain valid for the unchanged layout/number/chart surfaces, not an assertion that every word in every capture is the last copy version.

**Still unverified:** actual VoiceOver speech and announcement cadence, true browser zoom, other browser engines/physical phones, and the planned five-person comprehension test. VoiceOver Utility control was interrupted twice, then recovered by refreshing its app binding; its caption-panel option was already enabled. Sending the activation shortcut did not produce an observable running VoiceOver app or spoken-caption result, so no speech pass is claimed. The browser zoom shortcut likewise did not change viewport/DPR, so that attempt is not zoom evidence. No VoiceOver preference was changed. These limitations remain visible before any production-release decision.

The desktop/mobile viewport override was reset, synthetic edited values cleared by navigation, and the existing preview remains available on the default retirement example. No production action was taken.

### Follow-up: native assistive-technology check

System Settings → Accessibility → VoiceOver initially exposed its switch as **off**. A temporary activation displayed **on**, but no spoken-caption result was observable; selecting the VoiceOver app timed out. Reopening System Settings then showed the switch **off** again. This is an unsuccessful activation/observation attempt, not a screen-reader pass. The final observed setting matches the initial setting; no security or AppleScript permission was changed.

Native inspection of the Codex app to find a real browser-zoom control was denied by the computer-use safety boundary. That boundary was not bypassed. True browser zoom remains unverified; the existing narrow-viewport evidence is not a substitute. No source implementation changed during this follow-up. Human-assisted VoiceOver and browser-zoom verification are still required for those two claims.
