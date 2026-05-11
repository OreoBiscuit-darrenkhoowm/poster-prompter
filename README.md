# Poster Prompter

Local web app that turns event details into a polished poster prompt for **Gemini**. No API keys, no image generation server-side — you fill in the form, copy the prompt, paste it into your Gemini chat, and let the model render the poster where your style is already calibrated.

## Quick start

This repo ships with a portable Node 24 LTS in `tools/node/`. From any shell:

```powershell
$env:Path = "$PWD\tools\node;$env:Path"
npm install
npm run dev
```

Or use Node from PATH if installed. Open <http://localhost:3000>.

## Workflow

1. Fill in Title, Date, Time, Venue (Price + T&C optional).
2. Pick a Style preset, or write a custom style fragment.
3. Pick a canvas size (A4 / A3 / A5 + portrait/landscape, roll-up, X-stand) — the dimensions go into the prompt.
4. Adjust how many logo slots + whether a QR square should be reserved.
5. Click **Copy prompt**. Open Gemini, paste, attach any style reference images alongside.

The right pane updates live. There is no Generate button — the prompt is the product.

## Architecture

```
app/
├── page.tsx                       two-pane: form on left, prompt on right
└── layout.tsx                     root layout + Inter font

components/
├── ControlPanel/ControlPanel.tsx  event details + style + size form
└── PromptOutput/PromptOutput.tsx  live prompt textarea + copy + Gemini link

lib/
├── ai/
│   ├── promptBuilder.ts           details + style + size → prompt string
│   └── types.ts                   StylePreset, PromptInput, STYLE_PRESETS
├── canvas/sizes.ts                A4/A3/A5/signage @ 300 DPI + aspect bucketing
├── state/posterStore.ts           zustand store
└── utils.ts                       cn() classname helper
```

## Build commands

```powershell
npm run dev       # http://localhost:3000
npm run build     # production build (verifies types)
npm run start     # run production build
npm run lint
```
