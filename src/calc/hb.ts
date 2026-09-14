/**
 * API RP 13D–style Herschel–Bulkley **pipe** friction matching
 * Surface_MPD_PressureLoss_FIXED.xlsm `Calculations` B38:B61.
 *
 * Known deviation: workbook uses G = Ba/Bx with x = 1.0678 (annular-style Bx)
 * on pipe geometry. Pure RP 13D pipe uses G = Ba. Spot-check @ 600 gpm / 4 in /
 * 10.5 ppg / θ 19/13/2/1 → ~85.3 psi/1000 ft (workbook) vs ~86.0 (pure Ba) ≈ 1%.
 */

import { BX_X } from './parameters'
import type { HbPipeResult, Rheology } from './types'

function log10(x: number): number {
  return Math.log(x) / Math.LN10
}

export function rheologyParams(r: Rheology): { pv: number; yp: number; lsyp: number } {
  const pv = r.theta600 - r.theta300
  const yp = r.theta300 - pv // = 2·θ300 − θ600
  const lsyp = 2 * r.theta3 - r.theta6
  return { pv, yp, lsyp }
}

/**
 * ΔP for Length = 1000 ft (workbook B60/B61 → Ploss per ft = B61/B60).
 * Q in gpm, ID in inches, MW in ppg. Velocity Vp in ft/min.
 */
export function herschelBulkleyPipe(
  qGpm: number,
  idIn: number,
  rheology: Rheology,
  x: number = BX_X,
): HbPipeResult {
  const { pv, yp, lsyp } = rheologyParams(rheology)
  const mw = rheology.mwPpg

  if (!(idIn > 0) || !(qGpm >= 0) || !(mw > 0)) {
    return emptyHb()
  }

  const vp = (24.51 * qGpm) / (idIn * idIn)

  const numN = 2 * pv + yp - lsyp
  const denN = pv + yp - lsyp
  if (!(denN > 0) || !(numN > 0)) {
    return emptyHb({ pv, yp, lsyp, vpFtPerMin: vp })
  }

  const n = 3.32 * log10(numN / denN)
  const k = (pv + yp - lsyp) / 511 ** n
  const np = 3.32 * log10((2 * pv + yp) / (pv + yp))
  const ba = (3 * n + 1) / (4 * n)

  // Bx(x, np) = (x^(2/np) / (np * x^2)) * (x^2 - 1) / (x^(2/np) - 1)
  const xPow = x ** (2 / np)
  const bx = (xPow / (np * x * x)) * ((x * x - 1) / (xPow - 1))
  const g = ba / bx

  const gammaW = (1.6 * g * vp) / idIn
  const tauF = (4 / 3) ** n * lsyp + k * gammaW ** n
  const tauW = tauF * 1.066

  const nRe = (mw * vp * vp) / (19.36 * tauW)
  const ncRe = 3470 - 1370 * n
  const flam = 16 / nRe
  const a = (log10(np) + 3.93) / 50
  const b = (1.75 - log10(np)) / 7
  const fturb = a / nRe ** b
  const turbulent = nRe > ncRe
  const f = turbulent ? fturb : flam

  const length = 1000
  const dP =
    (1.076 * mw * vp * vp * f * length) / (idIn * 1e5)

  // Pure Ba comparison
  const gBa = ba
  const gammaBa = (1.6 * gBa * vp) / idIn
  const tauFBa = (4 / 3) ** n * lsyp + k * gammaBa ** n
  const tauWBa = tauFBa * 1.066
  const nReBa = (mw * vp * vp) / (19.36 * tauWBa)
  const fBa = nReBa > ncRe ? a / nReBa ** b : 16 / nReBa
  const dPBa =
    (1.076 * mw * vp * vp * fBa * length) / (idIn * 1e5)

  return {
    pv,
    yp,
    lsyp,
    vpFtPerMin: vp,
    n,
    k,
    np,
    ba,
    bx,
    g,
    gammaW,
    tauF,
    tauW,
    nRe,
    ncRe,
    f,
    regime: turbulent ? 'turbulent' : 'laminar',
    dPpsiPer1000ft: dP,
    dPpsiPer1000ftPureBa: dPBa,
  }
}

function emptyHb(partial?: Partial<HbPipeResult>): HbPipeResult {
  return {
    pv: 0,
    yp: 0,
    lsyp: 0,
    vpFtPerMin: 0,
    n: 0,
    k: 0,
    np: 0,
    ba: 0,
    bx: 0,
    g: 0,
    gammaW: 0,
    tauF: 0,
    tauW: 0,
    nRe: 0,
    ncRe: 0,
    f: 0,
    regime: 'laminar',
    dPpsiPer1000ft: 0,
    dPpsiPer1000ftPureBa: 0,
    ...partial,
  }
}

export function hydroPsi(heightFt: number, mwPpg: number): number {
  return heightFt * mwPpg * 0.052
}
