# Smokeless Tobacco BI Dashboard — Claude Code Bundle

## Files in This Bundle

| File | Purpose |
|---|---|
| `CLAUDE.md` | **Auto-read by Claude Code on session start.** Sets constraints, import limits, design non-negotiables, and quality gates. |
| `claude-code-prompt-bi-dashboard.md` | **The main prompt.** Paste this into Claude Code after it reads CLAUDE.md. Contains full layout spec, section descriptions, and the design system. |
| `DATA_REFERENCE.md` | **Exact mock data.** Every number, SKU name, regional breakdown, and sparkline array. Keeps the output consistent across iterations. |
| `DESIGN_TOKENS.md` | **Copy-paste code snippets.** Tailwind classes, Recharts axis config, tooltip components, sparkline SVG, card patterns. Claude Code will pull from this to stay on-brand. |

## How to Use

### Step 1: Create the project folder
```bash
mkdir revenue-dashboard && cd revenue-dashboard
```

### Step 2: Drop in CLAUDE.md
Copy `CLAUDE.md` into the project root. Claude Code reads this automatically when it starts a session in this directory.

```
revenue-dashboard/
  CLAUDE.md          ← auto-read
  DATA_REFERENCE.md  ← reference
  DESIGN_TOKENS.md   ← reference
```

### Step 3: Start Claude Code and feed the prompt
Open Claude Code in the `revenue-dashboard/` directory, then paste the contents of `claude-code-prompt-bi-dashboard.md` as your first message.

Claude Code will:
1. Read `CLAUDE.md` automatically (constraints + quality gates)
2. Reference `DATA_REFERENCE.md` and `DESIGN_TOKENS.md` if you tell it to (or it will discover them)
3. Output a single `dashboard.jsx` file

### Step 4: Run it
Copy `dashboard.jsx` into any Claude.ai conversation as an artifact, or drop it into a React project with Recharts + Lucide installed.

## Tips

- **If the waterfall chart looks wrong:** Tell Claude Code "The waterfall bars aren't offset correctly — use invisible base segments to stack the bars at the right starting position."
- **If tooltips are white:** Say "Custom tooltips must use bg-[#1a2234] with border-white/10, not the default Recharts tooltip."
- **If it splits into multiple files:** Remind it: "Single file only. Inline everything per CLAUDE.md."
- **To iterate on a section:** Say "Rebuild just the Regional Revenue table — make the micro-bars wider and add a hover highlight row."
