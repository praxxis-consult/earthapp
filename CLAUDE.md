# earthapp — Claude Code Agent Workflow

This file defines the multi-agent pipeline for converting Figma designs into
production-ready TSX components inside this React + Vite + TypeScript +
Tailwind v4 project.

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

## Agent roles

### Agent 1 — Figma Agent

**Trigger:** receives a Figma file URL and a node ID.

**Responsibilities:**
1. Call `mcp__plugin_figma_figma__get_design_context` with the provided URL/node.
2. Call `mcp__plugin_figma_figma__get_screenshot` to capture a visual reference.
3. Call `mcp__plugin_figma_figma__download_assets` for any SVG/PNG icons or
   images referenced in the node. Save them to `src/assets/icons/` (SVGs) or
   `src/assets/images/` (rasters). Use the original Figma asset name, lowercased
   and hyphenated (e.g. `arrow-right.svg`).
4. Extract the following from the design context and write them to
   `design-spec.json` at the project root:

```jsonc
{
  "meta": {
    "figma_url": "<url>",
    "node_id": "<id>",
    "node_name": "<Figma layer name>",
    "component_name": "<PascalCase name for the TSX file>",
    "target_folder": "src/components/ui | layout | common",
    "screenshot_path": "src/assets/images/<name>-spec.png"
  },
  "tokens": {
    "colors": { "<role>": "<hex>" },
    "typography": {
      "<role>": {
        "font_family": "",
        "font_size_px": 0,
        "font_weight": 0,
        "line_height_px": 0,
        "letter_spacing_px": 0,
        "text_transform": "none | uppercase | lowercase"
      }
    },
    "spacing": {
      "padding_x_px": 0,
      "padding_y_px": 0,
      "gap_px": 0,
      "border_radius_px": 0
    },
    "shadows": ["<tailwind shadow string or CSS box-shadow value>"],
    "borders": { "width_px": 0, "color": "<hex>", "style": "solid" }
  },
  "assets": [
    { "name": "<filename>", "path": "src/assets/icons/<filename>", "role": "<description>" }
  ],
  "layout": {
    "display": "flex | grid",
    "direction": "row | column",
    "breakpoints": {}
  },
  "variants": ["<variant name>"],
  "notes": "<any behaviour or interaction notes>"
}
```

5. Print a one-line summary: `FIGMA AGENT DONE — design-spec.json written, N assets saved.`

**Must NOT:** write any TSX or CSS. Its only outputs are `design-spec.json` and
downloaded assets.

---

### Agent 2 — Builder Agent

**Trigger:** `design-spec.json` exists at the project root.

**Responsibilities:**
1. Read `design-spec.json` in full.
2. Map every pixel value to the closest Tailwind v4 utility. Use arbitrary values
   (e.g. `px-[120px]`, `text-[14px]`, `tracking-[-0.28px]`) only when no
   standard utility matches within 2 px / 0.05 rem.
3. For new color roles not yet in `src/index.css @theme`, add them there before
   writing the component. Do not hardcode hex values inline when a token name is
   more expressive.
4. Write the component to `<target_folder>/<ComponentName>.tsx`.
5. Component rules:
   - Functional component with named export as default.
   - Props interface above the component (`interface <Name>Props { … }`).
   - Import SVGs at the top of the file following the existing pattern.
   - Never use inline `style={{ }}` for values that Tailwind can express.
     Use `style={{ }}` only for gradient backgrounds, dynamic values, or
     font-family overrides that Tailwind cannot express as static classes.
   - Add `// BUILDER: <brief rationale>` comments on any non-obvious styling
     decisions (e.g. why a specific arbitrary value was used).
6. Run `npm run lint` via the shell tool. Fix any reported errors before handing off.
7. Print: `BUILDER AGENT DONE — <path> written, lint passed.`

**Must NOT:** call any Figma MCP tools. Read only from `design-spec.json` and
existing source files.

---

### Agent 3 — Reviewer Agent

**Trigger:** Builder Agent has printed its completion line.

**Responsibilities:**
1. Read the generated component file.
2. Read `design-spec.json`.
3. For each token in `design-spec.json`, verify the component uses the correct
   value. Build a checklist table:

   | Token | Spec value | Component value | Status |
   |---|---|---|---|
   | primary color | #007C53 | bg-[#007C53] | PASS |
   | font-size body | 14px | text-[14px] | PASS |
   | border-radius | 30px | rounded-[30px] | PASS |

4. Check structural correctness:
   - All variants listed in `design-spec.json` are implemented.
   - All assets from `design-spec.json` are imported and used.
   - No unused imports.
   - Props interface covers every configurable aspect visible in the spec.
   - Component renders without JSX errors (static analysis — no runtime needed).

5. Output a `review-report.md` in the project root with:
   - The checklist table.
   - A **PASS** or **NEEDS REVISION** verdict.
   - A numbered list of issues (if any), each with the exact line number and
     the required fix.

6. If verdict is NEEDS REVISION, loop back to the Builder Agent with the
   issue list appended to `design-spec.json` under a `"review_feedback"` key.
   The Builder Agent must address every issue and increment
   `"revision": <n>` in the meta block before re-handing off.

7. Print: `REVIEWER AGENT DONE — verdict: PASS | NEEDS REVISION (N issues).`

**Must NOT:** rewrite the component itself. Its only output is `review-report.md`
and optional feedback written back to `design-spec.json`.

---

## Handoff protocol

```
User provides: Figma URL + node ID
       │
       ▼
  [Figma Agent]
  → downloads assets
  → writes design-spec.json
       │
       ▼
  [Builder Agent]
  → reads design-spec.json
  → writes TSX component
  → updates index.css tokens
  → runs lint
       │
       ▼
  [Reviewer Agent]
  → reads component + spec
  → writes review-report.md
       │
    PASS? ──── YES ──→ Done. Component is production-ready.
       │
      NO
       │
       ▼
  append review_feedback to design-spec.json
       │
       ▼
  [Builder Agent] (revision loop)
       │
       ▼
  [Reviewer Agent] (re-check)
       │
    PASS? ──── YES ──→ Done.
```

Maximum revision loops: **3**. If still failing after 3 loops, the Reviewer
Agent writes a `MANUAL REVIEW REQUIRED` section at the top of `review-report.md`
and stops.

---

## Context each agent must read on startup

Every agent run must begin by reading:
1. This file (`CLAUDE.md`).
2. `src/index.css` — current design tokens.
3. One existing component from the target folder to understand code style
   (e.g. `src/components/ui/Button.tsx` for ui targets,
   `src/components/layout/Navbar.tsx` for layout targets).

---

## File inventory after a completed pipeline run

```
project root/
  design-spec.json          ← written by Figma Agent, updated by Reviewer
  review-report.md          ← written by Reviewer Agent
src/
  index.css                 ← may have new @theme tokens (Builder Agent)
  assets/icons/*.svg        ← new SVG assets (Figma Agent)
  assets/images/*.png       ← screenshot reference + any raster assets
  components/<folder>/
    <ComponentName>.tsx     ← final component (Builder Agent)
```

Clean up `design-spec.json` and `review-report.md` after merging the component
into your branch if you do not want them committed.
