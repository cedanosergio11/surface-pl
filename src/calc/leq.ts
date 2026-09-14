import {
  CHOKE_EQ,
  DIST_MANIFOLD,
  FITTING_FACTORS,
  FLOW_METER_GEOMETRY,
  FM_MANIFOLD,
  MANIFOLD_GEOMETRY,
  PIPE_IDS,
  type FittingFactors,
} from './parameters'
import type { ChokeSize, FlowMeterKey, LineInput, ManifoldKey, PipeSizeKey } from './types'
import { normalizePipeSize } from './normalize'

export function leqFromCounts(
  factors: FittingFactors,
  pipeFt: number,
  hoseFt: number,
  teeLine: number,
  teeBranch: number,
  elbow: number,
  butterfly: number,
  kuka: number,
): number {
  return (
    factors.pipe * (pipeFt || 0) +
    factors.hose * (hoseFt || 0) +
    factors.teeLine * (teeLine || 0) +
    factors.teeBranch * (teeBranch || 0) +
    factors.elbow * (elbow || 0) +
    factors.butterfly * (butterfly || 0) +
    factors.kuka * (kuka || 0)
  )
}

export function lineLeq(line: LineInput): { leqFt: number; idIn: number; size: PipeSizeKey | '' } {
  const size = normalizePipeSize(line.size)
  if (!size) return { leqFt: 0, idIn: 0, size: '' }
  const factors = FITTING_FACTORS[size]
  const idIn = size === 'Custom' ? (line.customIdIn || PIPE_IDS.Custom) : PIPE_IDS[size]
  const leqFt = leqFromCounts(
    factors,
    line.pipeFt,
    line.hoseFt,
    line.teeLine,
    line.teeBranch,
    line.elbow,
    line.butterfly,
    line.kuka,
  )
  return { leqFt, idIn, size }
}

export function manifoldLeq(key: ManifoldKey, customIdIn?: number): { leqFt: number; idIn: number } {
  const g = MANIFOLD_GEOMETRY[key]
  const factors = FITTING_FACTORS[g.factorKey]
  const leqFt = leqFromCounts(
    factors,
    g.pipeFt,
    g.hoseFt,
    g.teeLine,
    g.teeBranch,
    g.elbow,
    g.butterfly,
    g.kuka,
  )
  const idIn = key === 'Custom' ? (customIdIn ?? g.idIn) : g.idIn
  return { leqFt, idIn }
}

export function chokeLeq(size: ChokeSize): { leqFt: number; idIn: number } {
  const c = CHOKE_EQ[size]
  return { leqFt: c.eqLft, idIn: c.idIn }
}

export function flowMeterLeq(key: FlowMeterKey): { leqFt: number; idIn: number } {
  if (key === 'N/A') return { leqFt: 0, idIn: 0 }
  const g = FLOW_METER_GEOMETRY[key]
  const factors = FITTING_FACTORS[g.factorKey]
  const leqFt = leqFromCounts(
    factors,
    g.pipeFt,
    g.hoseFt,
    g.teeLine,
    g.teeBranch,
    g.elbow,
    g.butterfly,
    g.kuka,
  )
  return { leqFt, idIn: g.idIn }
}

export function distManifoldLeq(): { leqFt: number; idIn: number } {
  const g = DIST_MANIFOLD
  const leqFt = leqFromCounts(
    g.factors,
    g.pipeFt,
    g.hoseFt,
    g.teeLine,
    g.teeBranch,
    g.elbow,
    g.butterfly,
    g.kuka,
  )
  return { leqFt, idIn: g.idIn }
}

export function fmManifoldLeq(): { leqFt: number; idIn: number } {
  const g = FM_MANIFOLD
  const leqFt = leqFromCounts(
    g.factors,
    g.pipeFt,
    g.hoseFt,
    g.teeLine,
    g.teeBranch,
    g.elbow,
    g.butterfly,
    g.kuka,
  )
  return { leqFt, idIn: g.idIn }
}
