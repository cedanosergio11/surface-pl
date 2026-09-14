# SurfacePL V1 — Engineering Spec

**Working title:** SurfacePL (Stasis Surface Pressure Loss)  
**Pattern:** PillView twin — static SPA, GitHub Pages, client-only calc  
**Status:** V1 build kickoff  
**Owners:** MPGenie (spec + number sign-off) · Code Ninja (engine + repo + Pages) · Cate (UI) · Compadre (FYI / supervisor)

---

## 1. Purpose

Port Sergio’s **surface MPD flowline / manifold / choke / FM pressure-loss** calculator to a browser app. Output is **wellhead backpressure from the surface circuit only** (friction + RCD elevation hydro), plus a pump-rate PL envelope.

**Hard scope banner (always visible):**  
Surface circuit only — **NOT** ECD, annular SBP, kick tolerance, volumes/strokes, or choke Cv/bean control.

---

## 2. Source of truth

| Artifact | Path |
|----------|------|
| Fixed workbook | `stasis/calculators/Surface_MPD_PressureLoss_FIXED.xlsm` |
| Audit | `stasis/calculator-review/REVIEW.md` |
| Fix notes | `stasis/calculators/FIX_NOTES.md` |

Physics: API RP 13D–style Herschel–Bulkley **pipe** friction + equivalent-length fittings + hydro `H_ft × MW_ppg × 0.052`. Engine must reproduce FIXED workbook logic (including workbook `G = Ba/Bx` with `x = 1.0678`); document ~1% vs pure-pipe `G = Ba` as known deviation.

---

## 3. V1 MUST

### 3.1 Inputs

- **Mud:** MW (ppg); θ600 / θ300 / θ6 / θ3 — live set **or** Min / Average / Max rheology sets  
- **Rates:** pump (gpm); optional riser booster (gpm, default 0); optional max operating design pressure (psi) for envelope line  
- **Heights:** RCD→SS (ft), RCD→MGS (ft)  
- **Path / equipment flags:** returns to SS vs MGS; manifold size; choke size (3/6 in); One / Two Chokes; FM size (N/A/4/6/8); FM manifold / misc / dist. manifold (N/A/Yes)  
- **Lines L1–L4:** size selector + pipe/hose lengths (ft) + fitting counts (tees/elbows/valves) → Leq via Paramaters table  
- **Presets:** Land / Offshore / Deepwater (load package defaults; do not stomp calc engine)

**Units:** every field labeled. Line size labeled **pipe ID basis** (not OD). No silent EXACT/dropdown bugs — trim/normalize all selects; never zero PL on valid selection.

### 3.2 Outputs

- PL breakdown: lines L1–L4, manifold, choke (eq-L), FM (+ FM manifold / dist.), misc, hydro SS/MGS  
- **Total wellhead BP** for SS path vs MGS path  
- **Flow sweep envelope** chart (Min / Avg / Max rheology vs Q, optional MODP line)

### 3.3 Deploy

GitHub Pages twin to PillView / `maintenance-kpi`: Vite SPA, `base: '/<repo>/'`, Actions deploy, `404.html` = `index.html` SPA fallback. Client-only; no backend, no SharePoint writeback.

### 3.4 Acceptance (spot-check)

Match FIXED xlsm within **~1–2%**:

| Check | Expect |
|-------|--------|
| 600 gpm, 4 in ID, 10.5 ppg, θ 19/13/2/1 | ~**85 psi / 1000 ft** (workbook G/Bx) |
| Hydro 30 ft × 10.5 ppg | **16.38 psi** (`× 0.052`) |

MPGenie signs off numbers before field use.

---

## 4. Out of scope (V1)

Annular ECD / SBP · kick tolerance · pills / connection schedules · variable choke Cv/bean · SharePoint writeback · P–T rheology · true annular segments.

---

## 5. Engine notes (implementers)

```
PV = θ600 − θ300;  YP = θ300 − PV;  LSYP = 2·θ3 − θ6
Vp = 24.51 · Q_gpm / ID_in²          // ft/min
n, k, Ba, Bx, G, γw, τf, τw, N′Re, f → ΔP per FIXED / REVIEW
ΔP_line = Leq × (ΔP / 1000 ft)
Hydro = H × MW × 0.052
BP_WH = hydro_path + Σ selected surface PL
Two Chokes → halve manifold/choke flow (/2) when engaged
SS path: L1+L2+L3 + hydro SS;  MGS path: L1+L2+L4 + hydro MGS
```

Choke = **wide-open eq-length only** (3″→18 ft @ ID 3; 6″→37 ft @ ID 6). Label UI accordingly.

---

## 6. UX / quality bar

- Persistent scope banner; assumptions strip (P&T neglected, one FM, max two chokes, eq-L fittings)  
- Explicit units; ID-basis pipe size; no leading-space select traps  
- Preset loaders confirm before overwrite  
- Twin visual language to PillView (Cate)

---

## 7. Roles & exit

| Role | Deliverable |
|------|-------------|
| MPGenie | This spec; acceptance sign-off on spot-checks |
| Code Ninja | Pure calc module + Vitest vs FIXED refs; repo; Pages CI |
| Cate | Input/breakdown/envelope UI + banner |
| Compadre | Aware only |

**Done when:** Pages live, spot-checks pass ≤2%, banner + ID labels present, no silent zero-PL on valid selects.
