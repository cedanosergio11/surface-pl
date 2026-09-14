/**
 * Tables from Surface_MPD_PressureLoss_FIXED.xlsm → sheet `4. Model Paramaters`.
 * Extracted with openpyxl (formulas resolved to static values where cells held constants).
 * Null cells in the workbook are treated as 0 at calc time — do not invent package heights.
 */

import type { FlowMeterKey, ManifoldKey, PipeSizeKey } from './types'

export interface FittingFactors {
  /** eq-L multiplier per unit length of pipe (always 1 in workbook) */
  pipe: number
  hose: number
  teeLine: number
  teeBranch: number
  elbow: number
  butterfly: number
  kuka: number
}

/** Nominal ID (in) used by the model for each size selector (ID basis, not OD). */
export const PIPE_IDS: Record<PipeSizeKey, number> = {
  '4 in': 4,
  '6 in': 6,
  '8 in': 8,
  '10 in': 10,
  Custom: 5, // Paramaters!H4
}

/** Equivalent-length factors by size column (Paramaters D7:J11 + pipe/hose row). */
export const FITTING_FACTORS: Record<PipeSizeKey | '7-1/16' | 'customManifold', FittingFactors> = {
  '4 in': { pipe: 1, hose: 1, teeLine: 7, teeBranch: 22, elbow: 10, butterfly: 15, kuka: 110 },
  '6 in': { pipe: 1, hose: 1, teeLine: 10, teeBranch: 31, elbow: 15, butterfly: 23, kuka: 160 },
  '8 in': { pipe: 1, hose: 1, teeLine: 13.5, teeBranch: 40, elbow: 20, butterfly: 30, kuka: 220 },
  '10 in': { pipe: 1, hose: 1, teeLine: 17, teeBranch: 50, elbow: 25, butterfly: 30, kuka: 284 },
  Custom: { pipe: 1, hose: 1, teeLine: 10, teeBranch: 31, elbow: 15, butterfly: 23, kuka: 160 },
  '7-1/16': { pipe: 1, hose: 1, teeLine: 10, teeBranch: 31, elbow: 15, butterfly: 23, kuka: 160 },
  customManifold: { pipe: 1, hose: 1, teeLine: 10, teeBranch: 31, elbow: 15, butterfly: 23, kuka: 160 },
}

/** Built-in manifold body: pipe/hose lengths + fitting counts (Paramaters D20:G26). Missing = 0. */
export const MANIFOLD_GEOMETRY: Record<
  ManifoldKey,
  {
    idIn: number
    pipeFt: number
    hoseFt: number
    teeLine: number
    teeBranch: number
    elbow: number
    butterfly: number
    kuka: number
    /** which fitting-factor column to use */
    factorKey: keyof typeof FITTING_FACTORS
  }
> = {
  '4 in L-shaped': {
    idIn: 4,
    pipeFt: 10,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 2,
    elbow: 1,
    butterfly: 2,
    kuka: 0,
    factorKey: '4 in',
  },
  '4 in Flat': {
    idIn: 4,
    pipeFt: 10,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 2,
    elbow: 1,
    butterfly: 4,
    kuka: 0,
    factorKey: '4 in',
  },
  '7-1/16 in L-Shaped': {
    idIn: 7.0625,
    pipeFt: 10,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 2,
    elbow: 1,
    butterfly: 2,
    kuka: 0,
    factorKey: '7-1/16',
  },
  Custom: {
    idIn: 6, // Paramaters!I4 custom manifold ID
    pipeFt: 10,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 2,
    elbow: 1,
    butterfly: 2,
    kuka: 0,
    factorKey: 'customManifold',
  },
}

/** Wide-open choke eq-length only (Paramaters U30:W31). */
export const CHOKE_EQ: Record<'3 in' | '6 in', { eqLft: number; idIn: number }> = {
  '3 in': { eqLft: 18, idIn: 3 },
  '6 in': { eqLft: 37, idIn: 6 },
}

/** Flow-meter body geometry (Paramaters H20:J26) — elbows only populated in FIXED sample. */
export const FLOW_METER_GEOMETRY: Record<
  Exclude<FlowMeterKey, 'N/A'>,
  {
    idIn: number
    pipeFt: number
    hoseFt: number
    teeLine: number
    teeBranch: number
    elbow: number
    butterfly: number
    kuka: number
    factorKey: PipeSizeKey
  }
> = {
  '4 in': {
    idIn: 4,
    pipeFt: 0,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 0,
    elbow: 4,
    butterfly: 0,
    kuka: 0,
    factorKey: '4 in',
  },
  '6 in': {
    idIn: 6,
    pipeFt: 0,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 0,
    elbow: 4,
    butterfly: 0,
    kuka: 0,
    factorKey: '6 in',
  },
  '8 in': {
    idIn: 8,
    pipeFt: 0,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 0,
    elbow: 4,
    butterfly: 0,
    kuka: 0,
    factorKey: '8 in',
  },
}

/** Distribution manifold (Paramaters D32:E39) — Actual column + eq-L factors. */
export const DIST_MANIFOLD = {
  idIn: 5,
  pipeFt: 12,
  hoseFt: 0,
  teeLine: 0,
  teeBranch: 0,
  elbow: 1,
  butterfly: 3,
  kuka: 0,
  /** factors from E column (eq-length column of Dist Manifold) */
  factors: { pipe: 1, hose: 1, teeLine: 10, teeBranch: 31, elbow: 15, butterfly: 23, kuka: 160 },
}

/** FM manifold (Paramaters F32:G39). */
export const FM_MANIFOLD = {
  idIn: 6,
  pipeFt: 10,
  hoseFt: 0,
  teeLine: 0,
  teeBranch: 2,
  elbow: 1,
  butterfly: 2,
  kuka: 0,
  factors: { pipe: 1, hose: 1, teeLine: 10, teeBranch: 31, elbow: 15, butterfly: 23, kuka: 160 },
}

/**
 * Misc linear PL curve (Paramaters I32:J34):
 *   ΔP = (MW / MW_ref) * slope * Q + intercept
 * Workbook Z15:
 *   (MW/I34)*((J33-J32)/(I33-I32))*Q + (J32 - ((J33-J32)/(I33-I32))*I32)
 */
export const MISC_CURVE = {
  q1: 100,
  dp1: 10,
  q2: 300,
  dp2: 12,
  mwRef: 12,
}

/** Geometry factor x used in Bx (workbook B47). Documented deviation vs pure-pipe G=Ba. */
export const BX_X = 1.0678

export const HYDRO_FACTOR = 0.052

export const SIZE_OPTIONS: PipeSizeKey[] = ['4 in', '6 in', '8 in', '10 in', 'Custom']
export const MANIFOLD_OPTIONS: ManifoldKey[] = [
  '4 in L-shaped',
  '4 in Flat',
  '7-1/16 in L-Shaped',
  'Custom',
]
export const CHOKE_OPTIONS = ['3 in', '6 in'] as const
export const CHOKE_PATH_OPTIONS = ['One Choke', 'Two Chokes'] as const
export const FM_OPTIONS: FlowMeterKey[] = ['N/A', '4 in', '6 in', '8 in']
export const RETURNS_OPTIONS = ['Shale Shakers', 'MGS'] as const
export const YES_NA_OPTIONS = ['N/A', 'Yes'] as const
