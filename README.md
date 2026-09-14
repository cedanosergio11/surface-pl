# SurfacePL V1

**Surface MPD flowline / manifold / choke / FM pressure-loss** calculator (client-only SPA).

Outputs **wellhead backpressure from the surface circuit only** (Herschel–Bulkley pipe friction + equivalent-length fittings + RCD elevation hydro) and a pump-rate PL envelope.

**Live URL:** https://cedanosergio11.github.io/surface-pl/

## Purpose

Port of Sergio’s FIXED workbook (`Surface_MPD_PressureLoss_FIXED.xlsm`) to a browser app — PillView twin pattern (Vite + React + TypeScript, GitHub Pages).

## Out of scope (V1)

- Annular ECD / SBP  
- Kick tolerance  
- Volumes / strokes / pills / connection schedules  
- Variable choke Cv / bean control  
- SharePoint writeback  
- P–T rheology / true annular segments  

Sticky banner in the UI restates this.

## Engine notes

- Physics: API RP 13D–style HB **pipe** friction matching FIXED workbook, including **`G = Ba/Bx` with `x = 1.0678`**.  
- Pure-pipe API uses `G = Ba` (~1% higher ΔP in the 600 gpm / 4″ spot-check). V1 keeps workbook `G`. See `docs/engine-notes.md`.  
- Choke = wide-open eq-length only (3″ → 18 ft @ ID 3; 6″ → 37 ft @ ID 6).  
- Two Chokes → halves **manifold/choke** flow only.  
- SS path: L1+L2+L3 + hydro SS; MGS: L1+L2+L4 + hydro MGS.  
- All selects trimmed/normalized; line size labeled **pipe ID basis**.

## Run locally

```bash
npm install
npm test
npm run dev          # http://localhost:5173/surface-pl/
npm run build:pages  # dist/client + 404.html SPA fallback
```

## Deploy

Push to GitHub (`cedanosergio11/surface-pl`). Actions workflow `.github/workflows/pages.yml` builds `dist/client` and deploys Pages (`base: '/surface-pl/'`).

Do not need to clone here — this tree is ready to upload.

## Acceptance (Vitest)

| Check | Expect |
|-------|--------|
| 600 gpm, 4 in ID, 10.5 ppg, θ 19/13/2/1 | ~**85.314 psi / 1000 ft** (±2%, workbook G/Bx) |
| Hydro 30 ft × 10.5 ppg | **16.38 psi** |

Cases live in `src/calc/fixtures/acceptance.json` (from FIXED extract).

## Docs

- `docs/SPEC.md` — engineering spec  
- `docs/engine-notes.md` — formula extract  
- `src/calc/fixtures/` — parameters / sample inputs / acceptance JSON  

## Stack

Vite · React · TypeScript · Recharts · Vitest · GitHub Pages
