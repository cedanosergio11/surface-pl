# Surface MPD Pressure-Loss — Engine Notes (FIXED workbook extract)

**Source:** `Surface_MPD_PressureLoss_FIXED.xlsm`  
**Refs:** `REVIEW.md` §Critical formulas, `FIX_NOTES.md`, `Surface_MPD_PL_App_V1_SPEC.md`  
**Extract date:** 2026-09-14  

Implement the FIXED workbook logic (including `G = Ba/Bx`). Do **not** invent constants — values below are from sheets / REVIEW spot-check.

---

## Scope

Surface circuit only: flowline / manifold / choke (wide-open eq-L) / flow meter / specialty + RCD elevation hydro → **wellhead BP contribution**.  
**Not:** ECD, annular SBP, kick tolerance, volumes/strokes, choke Cv/bean control.

---

## Critical formulas (REVIEW §Critical formulas + Calculations sheet)

### Rheology (Average path; live calc uses `Average!BK*` → Input `L5:L10`)

```
PV   = θ600 − θ300
YP   = θ300 − PV          // = 2·θ300 − θ600
LSYP = 2·θ3 − θ6
```

Workbook cells (`Calculations` col B):  
`B39 = Average!BK16 − Average!BK17`  
`B40 = Average!BK17 − B39`  
`B41 = Average!BK19*2 − Average!BK18`

### Pipe velocity (V in **ft/min**)

```
Vp = 24.51 * Q_gpm / ID_in^2
```

`Calculations!B38 = 24.51*B37/B36^2`  
`B37 = Input!M14 + Input!M15` (blank booster → treat as 0)

### Herschel–Bulkley pipe friction (API RP 13D–style)

```
n   = 3.32 * LOG10((2·PV + YP − LSYP) / (PV + YP − LSYP))
k   = (PV + YP − LSYP) / 511^n
np  = 3.32 * LOG10((2·PV + YP) / (PV + YP))     // Calculations!B44 (power-law n for Bx)
Ba  = (3n + 1) / (4n)
x   = 1.0678                                      // Calculations!B47 (hardcoded)
Bx  = (x^(2/np)) / (np * x^2) * (x^2 − 1) / (x^(2/np) − 1)
G   = Ba / Bx
γw  = 1.6 * G * Vp / ID
τf  = (4/3)^n * LSYP + k * γw^n
τw  = τf * 1.066
N′Re = ρ * Vp^2 / (19.36 * τw)                    // ρ = MW_ppg
NcRe = 3470 − 1370*n
flam = 16 / N′Re
a    = (LOG10(np) + 3.93) / 50
b    = (1.75 − LOG10(np)) / 7
fturb = a / N′Re^b
f    = fturb if N′Re > NcRe else flam
ΔP   = 1.076 * ρ * Vp^2 * f * L / (ID * 10^5)     // psi; L = Calculations!B60 = 1000
Ploss_per_ft = ΔP / 1000
```

### Line ΔP

```
Leq = pipe_ft + hose_ft
    + n_tees_line     * eq.tees_line(ID)
    + n_tees_branched * eq.tees_branched(ID)
    + n_elbows        * eq.elbows(ID)
    + n_butterfly     * eq.butterfly(ID)
    + n_kuka          * eq.kuka(ID)
ΔP_line = Leq * Ploss_per_ft
```

Blank fitting/length cells count as **0**. Eq-length table: `4. Model Paramaters` D7:J11 — see `parameters.json`.

### Hydrostatic (oilfield)

```
hydro_SS  = H_SS_ft  * MW_ppg * 0.052     // Input!M34 = C14 * L5 * 0.052
hydro_MGS = H_MGS_ft * MW_ppg * 0.052     // Input!M37 = IF(M38>0, C15*L5*0.052, 0)
```

Classic **0.052** psi/(ppg·ft) — not 0.051948. Sample: **30 ft × 10.5 ppg → 16.38 psi**.

### BP on wellhead

```
BP_SS  = hydro_SS  + PL_system_SS
BP_MGS = hydro_MGS + PL_system_MGS
```

`Input!J20` selects MGS vs SS via `EXACT(TRIM(C20), TRIM("MGS"))`.

---

## Bx / G caveat

Pure API RP 13D **pipe** uses `G = Ba`. Workbook uses annular-style `Bx(x=1.0678)` so `G = Ba/Bx`.

| Method | ΔP / 1000 ft @ 600 gpm, 4″ ID, 10.5 ppg, θ 19/13/2/1 |
|--------|------------------------------------------------------|
| Workbook `G=Ba/Bx` | **~85.3 psi** (`Calculations!B61` cached = 85.314…) |
| Pure `G=Ba` | **~86.0 psi** (~1% higher) |

**V1 engine must reproduce workbook G/Bx.** Document the ~1% deviation vs pure pipe.

---

## Choke = equivalent length only (not bean/Cv)

From `4. Model Paramaters` U30:W31:

| Choke size | Eq length (ft) | ID (in) |
|------------|----------------|---------|
| **3 in**   | **18**         | **3**   |
| **6 in**   | **37**         | **6**   |

Valid for **wide-open** body loss only. Invalid for variable choke SBP / Cv curves. Label UI accordingly.

---

## Two Chokes → halves manifold/choke flow

When `Input!C18 = "Two Chokes"`, manifold and choke columns use **Q/2**:

```
Calculations!L37 / N37 / P37 / R37 / T37 / V37
  = ('1. Input Data'!$M$14 + '1. Input Data'!$M$15) / 2
```

One-Choke siblings (K/M/O/Q/S/U37) use full `M14+M15`.  
Line friction (cols B–F) always uses full pump+booster rate.  
Only **manifold + choke** friction sees the halved flow when Two Chokes is engaged.

---

## Path selection: SS vs MGS

| Path | Line stack | Hydro |
|------|------------|-------|
| **Shale Shakers (SS)** | **L1 + L2 + L3** | **hydro_SS** (`C14 × MW × 0.052`) |
| **MGS** | **L1 + L2 + L4** | **hydro_MGS** (`C15 × MW × 0.052`) |

Workbook:

```
M27 = M23+M24+M25          // RCD→SS line PL = L1+L2+L3
M28 = IF(M26>0, M23+M24+M26, 0)  // RCD→MGS = L1+L2+L4
M35 = SUM(M29:M33)+M27     // equipment + SS lines
M36 = M34+M35              // BP SS
M38 = IF(M26>0, SUM(M29:M33)+M28, 0)
M39 = M37+M38              // BP MGS
```

Equipment PL (manifold, choke via manifold sum K15:V15, FM, FM manifold, dist., misc) is shared; path gates **lines + hydro**.

---

## Equipment PL selection (Calculations)

- **Manifold / choke:** size + One/Two Chokes flags (`K14:V14`) gate `K19:V19` ΔP → summed into `Input!M29`.
- **FM:** `C19` ∈ {4 in, 6 in, 8 in} → `AA14:AC14`; N/A → 0.
- **FM manifold:** on only if `C22="Yes"` **and** FM ≠ N/A (`X14`).
- **Dist. manifold:** `C24="Yes"` (`W14`).
- **Misc:** `C23="Yes"` × linear curve `Z15` (`Z19`).
- All `EXACT` comparisons are **TRIM-safe** in FIXED workbook.

---

## Acceptance checks (must match within ~1–2%)

| Check | Inputs | Expect |
|-------|--------|--------|
| Pipe friction | 600 gpm, 4 in ID, 10.5 ppg, θ 19/13/2/1, workbook G/Bx | **~85 psi / 1000 ft** (exact cached **85.314…**) |
| Hydro | 30 ft × 10.5 ppg × 0.052 | **16.38 psi** |
| Rheology | θ 19/13/2/1 | PV=6, YP=7, LSYP=0 |
| Velocity | 600 gpm / 4 in | Vp = **919.125 ft/min** |
| Sample L1 | 120 ft + 5×7 + 1×10 | Leq=**165 ft** → ~**14.08 psi** |
| Two Chokes | Q=600 | manifold/choke Q=**300** |

See `acceptance.json` for machine-readable cases.

---

## Magic constants (do not change without audit)

| Constant | Value | Role |
|----------|-------|------|
| Velocity | 24.51 | Vp (ft/min) from gpm & ID |
| n factor | 3.32 | LOG10 HB / power-law n |
| k denom | 511^n | consistency index |
| τw factor | 1.066 | wall stress |
| N′Re denom | 19.36 | generalized Reynolds |
| NcRe | 3470 − 1370·n | laminar/turbulent cutoff |
| ΔP factor | 1.076 / 10^5 | friction ΔP (psi) |
| Length basis | 1000 | Ploss per 1000 ft |
| Bx x | 1.0678 | geometry factor |
| Hydro | 0.052 | psi/(ppg·ft) |

---

## Related extract files

| File | Contents |
|------|----------|
| `parameters.json` | Pipe IDs, eq-L factors, package defaults, choke eq-L, specialty |
| `sample-inputs.json` | Sample `1. Input Data` + cached outputs |
| `acceptance.json` | Named expect cases for Vitest / cloud agent |

### Missing cells (do not invent)

- Package heights **P3/R3/T3** and **P4/R4/T4** are blank on `4. Model Paramaters`.
- Package FM manifold / misc / dist. flags not on Paramaters sheet.
- Many package L1/L4 length/fitting cells blank (see `parameters.json`).
- Sample Line 3 (`F29:F36`) empty; `M15` booster and `M16` MODP blank; advanced flags C22–C24 blank.
