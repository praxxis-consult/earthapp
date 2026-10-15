# earthapp — agent workflow

This file defines how agents work on this React + Vite + TypeScript + Tailwind v4
project: the conventions every change follows, and the five-department loop that
turns a design frame into a shipped, verified screen. The README explains the product;
this file explains the work.

---

## Project conventions (read before every agent run)

| Concern | Convention |
|---|---|
| Framework | React 19 + Vite 8 + TypeScript 7 |
| Styling | Tailwind v4 via `@tailwindcss/vite` — utility classes only, no separate config file |
| Global tokens | Defined in `src/index.css` under `@theme { … }` |
| Fonts | Goldman (`--font-goldman`) for brand wordmark; Plus Jakarta Sans (`--font-jakarta`) for everything else |
| Brand palette | `#007C53` primary green · `#0C2310` dark green · `#AEE74A` accent lime · `#404438` dark muted · `#807E7E` nav text |
| Component folders | `src/components/ui/` — atoms (Button, Card, Badge, Logo) · `src/components/layout/` — page-level shells (Navbar, Footer, MainLayout) · `src/components/common/` — shared composites |
| SVG icons | Imported as `import icon from '../../assets/icons/icon.svg'` and rendered via `<img>` |
| State | Redux Toolkit + RTK Query: `src/app/store.ts`, `src/app/api/apiSlice.ts` (base query with bearer + refresh), per-feature `src/feature/<name>/<name>Slice.ts` and `<name>ApiSlice.ts` (`injectEndpoints`); components use the generated hooks |
| Routing | React Router v7 (`src/routes/`) |
| Responsive | Desktop (≥1024, measured against the 1440 frames) is the source of truth and its classes stay as they are; phone and tablet are added with `max-lg:` / `max-md:` / `max-sm:` overrides or `lg:hidden` swaps, never by changing desktop values. Collapsed navigation uses `src/components/ui/Drawer.tsx`; dashboard tables use `src/components/ui/DataTable.tsx` (table from `md`, one card per row below); sideways chip rows use `SCROLL_ROW` from `src/utils/styles.ts` |
| Linting | oxlint — run `npm run lint` before declaring a component done |

### Existing design tokens (index.css)

```css
@theme {
  --font-goldman: 'Goldman', serif;
  --font-jakarta: 'Plus Jakarta Sans', sans-serif;
  --color-primary:      #007C53;
  --color-primary-dark: #0C2310;
  --color-nav-text:     #807E7E;
}
```

Add new tokens here instead of hardcoding hex values in component files.

---

---

## The loop: five departments

The project runs as a multi-agent loop. Each department acts by itself, produces its
own output, and hands to the next. A department never assumes another one covered a
step. The loop ends only when the Judge awards full marks.

### 1. Builder — implements the code

Trigger: a design frame (file URL + node id) and, where one exists, the API endpoint.

1. Fetch the raw frame data over the REST API (`figma-refs/` holds dumps and
   `figma-refs/tree.cjs <node-id> [depth]` prints a layout tree). Never build from a
   screenshot or a summary; read widths, positions, padding, fills, strokes, effects,
   fonts and copy from the nodes.
2. Export the frame's own assets (icons, illustrations, images) and save them to
   `src/assets/icons/` or `src/assets/images/`, lowercased and hyphenated. Never
   substitute an icon pack.
3. Solve gradients from the node's gradient handles (the colour bands run parallel to
   the width handle; a start-to-end angle is wrong on non-square nodes). Sample the
   render against the node's PNG export.
4. Build with the conventions above: tokens, utility classes, shared components
   (`Drawer`, `DataTable`, `StatCard`, `EmptyBlock`, `LineChart`, `Pager`,
   `SelectorMenu`, `SCROLL_ROW`). The third copy of anything becomes a shared piece.
5. Wire to the API through an RTK Query slice. If the endpoint does not exist, the page
   reads a data module under `src/data/` shaped like the expected response and shows a
   real zero state; sample rows go in a `.sample.ts` twin behind `src/data/sample.ts`.
   Never put an invented figure on a page.
6. Add the responsive layer with `max-lg:` / `max-md:` / `max-sm:` overrides or
   `lg:hidden` swaps; desktop classes stay exactly as measured.
7. Measure the result in headless Chrome against the frame at its own size; write down
   every deliberate deviation in a code comment at the spot.

Hands over: the code, the measurements, the deviation list. Prints:
`BUILDER DONE — <screen>, <n> elements measured, <m> deviations noted.`

### 2. Adversarial auditor — attacks the work

Trigger: the Builder's hand-over.

Attack, do not review: overflow at 390, 768 and 1024; desktop regressions against the
pre-change baseline; wrong or invented data on a page; controls that do nothing without
a note; sign-in, refresh and session paths (double refresh, stale token, rate limit,
closed tab); version conflicts on saves; races between queries on load; keyboard and
Escape on dialogs; anything a hostile buyer or seller could exploit (unauthenticated
routes, injected text, oversized uploads).

Hands over: a findings list. Each finding names the file and line, the concrete input or
state, and the wrong output or crash. Prints:
`AUDITOR DONE — <n> findings.` A finding without a failure scenario is not a finding.

### 3. Fixer — fixes every finding with a regression test

Trigger: the auditor's list.

For each finding: write the check that fails (a Vitest test in `src/test/`, or a scripted
browser check where a test cannot reach), fix it, see the check pass, keep the check. Do
not fix by removing the control or the feature. Prints:
`FIXER DONE — <n>/<n> findings fixed, <t> tests added.`

### 4. Design researcher — raises the frontend to the best real UIs

Trigger: a screen where the design file is silent (mobile layouts, empty states, loading,
motion, micro-copy) or a Judge note on quality.

Go external: study the best real marketplace and seller-dashboard UIs for the pattern in
question, bring back concrete proposals with references, and apply them where they do not
contradict the frames. Never override a measured frame value. Prints:
`RESEARCHER DONE — <n> proposals, <m> applied.`

### 5. Judge — grades against the rubric

Trigger: after the Fixer (and the Researcher, when involved).

Grade the current state on the rubric below, one score per line, and say exactly what
loses points and where. Anything short of full marks goes back to the Builder (frame or
integration) or the Fixer (defects). Prints:
`JUDGE DONE — <score>/<max>; <list of point losses>.`

Rubric (each worth the same):
1. Frame fidelity: every measured element within 1px at 1440; assets, copy and gradients
   from the file; deviations written down.
2. Responsive: nothing past the viewport at 390, 768 and 1024; touch targets ≥ 44px;
   desktop unchanged against the baseline.
3. Data honesty: every number from the API or a real zero; samples only behind the switch.
4. Integration: every control does what it says or is marked inert with the reason; the
   end-to-end flows pass on the QA API.
5. Code health: `npm run lint`, `npx tsc --noEmit`, `npm run build` clean; shared pieces
   used instead of copies; conventions above followed.
6. Accessibility basics: labelled inputs, keyboard-reachable rows and dialogs, Escape
   closes dialogs, decorative images marked.

Maximum loops: **3**. If the Judge still withholds full marks after three, it writes a
`MANUAL REVIEW REQUIRED` section naming the open points and stops.

---

## Rules that apply to every department

- Commit messages and pull requests describe the product change in plain words. They never
  name the design tool or the tools used to make the change, and carry no attribution lines.
- Never put an invented figure on a page. The zero state is the honest state.
- Verify before stating: a claim about git, a deployment or an API is backed by a command
  run in the session.
- Development-only switches (`?sample=1`) are compiled out of production builds.
- The scratchpad scripts used for measuring and auditing live outside the repository; the
  measurements themselves go in the pull request.
