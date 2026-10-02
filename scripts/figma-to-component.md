# figma-to-component — pipeline kick-off prompt

Copy the entire block below, fill in the two placeholders, and paste it as your
first message when opening a new Claude Code session inside the `earthapp`
project directory.

---

## How to use

1. Open Claude Code in `/Users/ucheekezie/myworks/web2work/earthapp`
2. Make sure the Figma MCP plugin is active (`plugin:figma:figma` in your MCP
   config — you should see Figma tools available)
3. Copy the **Prompt template** section below
4. Replace `<FIGMA_URL>` and `<NODE_ID>` with real values
5. Optionally fill in `<COMPONENT_NAME>`, `<TARGET_FOLDER>`, and `<NOTES>`
6. Paste into Claude Code and press Enter

---

## Prompt template

```
I want to run the earthapp Figma-to-component pipeline.

Before doing anything else, read CLAUDE.md at the project root so you
understand the project conventions, agent roles, and handoff protocol.
Also read src/index.css and src/components/ui/Button.tsx for code style context.

---

INPUTS:
  Figma URL : <FIGMA_URL>
  Node ID   : <NODE_ID>

  Component name  : <COMPONENT_NAME>          (PascalCase — e.g. HeroSection)
  Target folder   : <TARGET_FOLDER>           (ui | layout | common)
  Notes           : <NOTES>                   (optional — any behaviour detail)

---

Run the three agents in sequence as defined in CLAUDE.md:

### AGENT 1 — Figma Agent

You are acting as the Figma Agent.

1. Call get_design_context with the Figma URL and node ID above.
2. Call get_screenshot for the same node and save the image to
   src/assets/images/<component-name-lowercase>-spec.png.
3. Call download_assets for every icon or image referenced in the node.
   Save SVGs to src/assets/icons/ and rasters to src/assets/images/.
   Use the original Figma name, lowercased and hyphenated.
4. Extract all colors, typography, spacing, border-radius, shadows, and
   border values from the design context.
5. Write design-spec.json to the project root following the exact schema
   in CLAUDE.md. Populate every field you can determine from the design
   context. Use null for values that are genuinely absent.
6. Print: FIGMA AGENT DONE — design-spec.json written, N assets saved.

Do NOT write any TSX or modify any source file other than saving assets.

---

### AGENT 2 — Builder Agent

You are now acting as the Builder Agent.

1. Read design-spec.json in full.
2. Read src/index.css. Add any new color or font tokens needed by this
   component to the @theme block — use expressive token names, not raw hex.
3. Read the existing component in the target folder that is most similar
   to what you are about to build (ask me if you are unsure which one).
4. Write the TSX component to src/components/<target_folder>/<ComponentName>.tsx.
   Follow every rule in the Builder Agent section of CLAUDE.md exactly:
   - Map pixel values to Tailwind utilities; use arbitrary values only when needed.
   - No inline style for values Tailwind can express.
   - Add // BUILDER: comments on non-obvious decisions.
   - Props interface above the component function.
   - Named default export.
5. Run: npm run lint
   Fix every reported error. Do not hand off with lint errors.
6. Print: BUILDER AGENT DONE — <path> written, lint passed.

Do NOT call any Figma MCP tools.

---

### AGENT 3 — Reviewer Agent

You are now acting as the Reviewer Agent.

1. Read the component just written by the Builder Agent.
2. Read design-spec.json.
3. Build the token checklist table (spec value vs component value, PASS/FAIL).
4. Verify:
   - All variants from the spec are implemented.
   - All assets from the spec are imported and used.
   - No unused imports.
   - Props interface covers every configurable aspect in the spec.
5. Write review-report.md to the project root with:
   - The checklist table.
   - PASS or NEEDS REVISION verdict.
   - If NEEDS REVISION: numbered issue list with line numbers and required fixes.
6. If NEEDS REVISION, append a "review_feedback" array to design-spec.json
   and increment "revision" in the meta block, then ask the Builder Agent
   to fix the issues (loop back to Agent 2, max 3 total loops).
7. Print: REVIEWER AGENT DONE — verdict: PASS | NEEDS REVISION (N issues).

Do NOT rewrite the component yourself.

---

Start now with Agent 1.
```

---

## Finding the Figma node ID

The node ID lives in the Figma URL after `?node-id=`.

Example URL:
```
https://www.figma.com/design/AbCdEf123456/earthapp?node-id=42-100&t=xyz
```
Node ID: `42-100`

When using the Figma MCP `get_design_context` tool, pass both the full URL and
the node ID separately. The tool accepts them as `fileUrl` and `nodeId`.

---

## Typical run time and what to expect

| Step | What Claude does | Output |
|---|---|---|
| Figma Agent | Calls 2–3 Figma MCP tools, may ask to confirm asset downloads | `design-spec.json`, SVGs in `src/assets/` |
| Builder Agent | Writes TSX, updates `index.css`, runs lint | `src/components/<folder>/<Name>.tsx` |
| Reviewer Agent | Reads files only, no MCP calls | `review-report.md` |

If the Figma MCP returns an authentication prompt, complete it before the agent
can continue. The plugin requires a Figma account session.

---

## After the pipeline completes

- Open `review-report.md` to see the full verdict and token checklist.
- The component is in `src/components/<folder>/<ComponentName>.tsx`.
- New design tokens (if any) were added to `src/index.css`.
- Commit `design-spec.json` and `review-report.md` alongside the component if
  you want a paper trail; delete them if you prefer a clean commit.

---

## Running a single agent in isolation

If you already have a `design-spec.json` and only want to regenerate the
component, paste only the Agent 2 + Agent 3 blocks (skip Agent 1).

If you only want a re-review of an existing component, paste only the Agent 3
block and point it at the component path explicitly.
