/**
 * Full surface-circuit pressure-loss assembly matching FIXED workbook path logic.
 * Manifold + choke see Q/2 when Two Chokes; lines always see full pump+booster.
 */

import { MISC_CURVE } from './parameters'
import { herschelBulkleyPipe, hydroPsi } from './hb'
import {
  chokeLeq,
  distManifoldLeq,
  flowMeterLeq,
  fmManifoldLeq,
  lineLeq,
  manifoldLeq,
} from './leq'
import type {
  EnvelopePoint,
  PlBreakdown,
  Rheology,
  SurfaceInputs,
} from './types'

function nz(n: number | null | undefined): number {
  return n == null || Number.isNaN(n) ? 0 : n
}

function activeRheology(inputs: SurfaceInputs): Rheology {
  switch (inputs.activeRheology) {
    case 'max':
      return inputs.rheologyMax
    case 'min':
      return inputs.rheologyMin
    case 'average':
      return inputs.rheologyAverage
    case 'live':
    default:
      return inputs.rheologyLive
  }
}

function miscPl(qGpm: number, mwPpg: number): number {
  const { q1, dp1, q2, dp2, mwRef } = MISC_CURVE
  const slope = (dp2 - dp1) / (q2 - q1)
  // Calculations!Z15
  return (mwPpg / mwRef) * slope * qGpm + (dp1 - slope * q1)
}

function dPForSegment(
  leqFt: number,
  idIn: number,
  qGpm: number,
  rheology: Rheology,
): number {
  if (!(leqFt > 0) || !(idIn > 0) || !(qGpm >= 0)) return 0
  const hb = herschelBulkleyPipe(qGpm, idIn, rheology)
  return leqFt * (hb.dPpsiPer1000ft / 1000)
}

export function computeSurfacePl(inputs: SurfaceInputs): PlBreakdown {
  const rheology = activeRheology(inputs)
  const totalQ = nz(inputs.pumpGpm) + nz(inputs.boosterGpm)
  const twoChokes = inputs.chokePath === 'Two Chokes'
  const manifoldChokeQ = twoChokes ? totalQ / 2 : totalQ

  const l1 = lineLeq(inputs.lines[0])
  const l2 = lineLeq(inputs.lines[1])
  const l3 = lineLeq(inputs.lines[2])
  const l4 = lineLeq(inputs.lines[3])

  const line1 = dPForSegment(l1.leqFt, l1.idIn, totalQ, rheology)
  const line2 = dPForSegment(l2.leqFt, l2.idIn, totalQ, rheology)
  const line3 = dPForSegment(l3.leqFt, l3.idIn, totalQ, rheology)
  const line4 = dPForSegment(l4.leqFt, l4.idIn, totalQ, rheology)

  const man = manifoldLeq(inputs.manifold, inputs.customManifoldIdIn)
  const choke = chokeLeq(inputs.chokeSize)
  const fm = flowMeterLeq(inputs.flowMeter)
  const fmMan = fmManifoldLeq()
  const dist = distManifoldLeq()

  const manifoldPl = dPForSegment(man.leqFt, man.idIn, manifoldChokeQ, rheology)
  const chokePl = dPForSegment(choke.leqFt, choke.idIn, manifoldChokeQ, rheology)

  // Workbook M29 = SUM(K15:V15) includes both selected manifold AND selected choke columns
  const manifoldAndChoke = manifoldPl + chokePl

  const flowMeterPl =
    inputs.flowMeter === 'N/A' ? 0 : dPForSegment(fm.leqFt, fm.idIn, totalQ, rheology)

  const fmManifoldPl =
    inputs.fmManifold === 'Yes' && inputs.flowMeter !== 'N/A'
      ? dPForSegment(fmMan.leqFt, fmMan.idIn, totalQ, rheology)
      : 0

  const distManifoldPl =
    inputs.distManifold === 'Yes'
      ? dPForSegment(dist.leqFt, dist.idIn, totalQ, rheology)
      : 0

  const misc = inputs.misc === 'Yes' ? miscPl(totalQ, rheology.mwPpg) : 0

  const equipment =
    manifoldAndChoke + flowMeterPl + fmManifoldPl + distManifoldPl + misc

  const linesSs = line1 + line2 + line3
  const linesMgs = line4 > 0 ? line1 + line2 + line4 : 0

  const hydroSs = hydroPsi(nz(inputs.heightRcdToSsFt), rheology.mwPpg)
  // Workbook: hydro_MGS only if M38>0 i.e. system PL MGS path active (L4 present)
  const systemPlMgs = linesMgs > 0 ? equipment + linesMgs : 0
  const hydroMgs =
    systemPlMgs > 0 ? hydroPsi(nz(inputs.heightRcdToMgsFt), rheology.mwPpg) : 0

  const systemPlSs = equipment + linesSs
  const bpWhSs = hydroSs + systemPlSs
  const bpWhMgs = hydroMgs + systemPlMgs
  const bpWhActive = inputs.returns === 'MGS' ? bpWhMgs : bpWhSs

  // Representative HB at line size of L1 (or 4 in) for UI diagnostics
  const refId = l1.idIn > 0 ? l1.idIn : 4
  const hb = herschelBulkleyPipe(totalQ, refId, rheology)

  return {
    line1,
    line2,
    line3,
    line4,
    linesSs,
    linesMgs,
    manifold: manifoldAndChoke, // matches workbook M29 (manifold + choke gated sum)
    choke: chokePl,
    flowMeter: flowMeterPl,
    fmManifold: fmManifoldPl,
    distManifold: distManifoldPl,
    misc,
    hydroSs,
    hydroMgs,
    systemPlSs,
    systemPlMgs,
    bpWhSs,
    bpWhMgs,
    bpWhActive,
    totalQGpm: totalQ,
    manifoldChokeQGpm: manifoldChokeQ,
    hb,
    leq: {
      line1: l1.leqFt,
      line2: l2.leqFt,
      line3: l3.leqFt,
      line4: l4.leqFt,
      manifold: man.leqFt,
      choke: choke.leqFt,
      flowMeter: fm.leqFt,
      fmManifold: fmMan.leqFt,
      distManifold: dist.leqFt,
    },
  }
}

export function buildEnvelope(
  inputs: SurfaceInputs,
  qMin = 0,
  qMax = 1200,
  step = 50,
): EnvelopePoint[] {
  const points: EnvelopePoint[] = []
  for (let q = qMin; q <= qMax; q += step) {
    const base = { ...inputs, pumpGpm: q, boosterGpm: 0 }
    const minPl = computeSurfacePl({
      ...base,
      activeRheology: 'min',
      rheologyLive: inputs.rheologyMin,
    })
    const avgPl = computeSurfacePl({
      ...base,
      activeRheology: 'average',
      rheologyLive: inputs.rheologyAverage,
    })
    const maxPl = computeSurfacePl({
      ...base,
      activeRheology: 'max',
      rheologyLive: inputs.rheologyMax,
    })
    points.push({
      qGpm: q,
      bpMin: minPl.bpWhActive,
      bpAvg: avgPl.bpWhActive,
      bpMax: maxPl.bpWhActive,
      modp: inputs.modpPsi,
    })
  }
  return points
}

export { activeRheology }
