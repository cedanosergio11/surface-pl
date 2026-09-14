/**
 * Land / Offshore / Deepwater package defaults from parameters.json.
 * Blank workbook cells stay null → treated as 0 in calc; heights are null
 * in Paramaters (P3/R3/T3, P4/R4/T4) — presets leave sample heights alone
 * unless caller opts in, matching "do not invent missing nulls".
 */

import type { LineInput, PresetName, SurfaceInputs } from './types'
import { emptyLine, sampleInputs } from './defaults'

type NullableNum = number | null

interface PackageLine {
  size: string
  pipe_ft: NullableNum
  hose_ft: NullableNum
  tees_line: NullableNum
  tees_branched: NullableNum
  elbows: NullableNum
  butterfly: NullableNum
  kuka: NullableNum
}

function n0(v: NullableNum): number {
  return v == null ? 0 : v
}

function toLine(p: PackageLine): LineInput {
  const size = (p.size || '') as LineInput['size']
  return {
    size: size || '',
    pipeFt: n0(p.pipe_ft),
    hoseFt: n0(p.hose_ft),
    teeLine: n0(p.tees_line),
    teeBranch: n0(p.tees_branched),
    elbow: n0(p.elbows),
    butterfly: n0(p.butterfly),
    kuka: n0(p.kuka),
    customIdIn: 5,
  }
}

/** Raw package tables (nulls preserved from FIXED Paramaters). */
export const PACKAGE_RAW = {
  Offshore: {
    manifold_size: '4 in L-shaped',
    choke_size: '3 in',
    flow_path: 'Two Chokes',
    flow_meter_size: '6 in',
    returns_to: 'Shale Shakers',
    height_rcd_to_ss_ft: null as NullableNum,
    height_rcd_to_mgs_ft: null as NullableNum,
    fm_manifold: null as NullableNum,
    misc: null as NullableNum,
    dist_manifold: null as NullableNum,
    lines: {
      L1: {
        size: '6 in',
        pipe_ft: null,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: null,
        butterfly: null,
        kuka: null,
      },
      L2: {
        size: '6 in',
        pipe_ft: 45.5,
        hose_ft: 50,
        tees_line: 4,
        tees_branched: null,
        elbows: 5,
        butterfly: 1,
        kuka: 2,
      },
      L3: {
        size: '6 in',
        pipe_ft: 47,
        hose_ft: 70,
        tees_line: 2,
        tees_branched: 0,
        elbows: 3,
        butterfly: 1,
        kuka: 0,
      },
      L4: {
        size: '6 in',
        pipe_ft: null,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: null,
        butterfly: null,
        kuka: null,
      },
    },
  },
  Land: {
    manifold_size: '4 in L-shaped',
    choke_size: '3 in',
    flow_path: 'Two Chokes',
    flow_meter_size: '6 in',
    returns_to: 'Shale Shakers',
    height_rcd_to_ss_ft: null as NullableNum,
    height_rcd_to_mgs_ft: null as NullableNum,
    fm_manifold: null as NullableNum,
    misc: null as NullableNum,
    dist_manifold: null as NullableNum,
    lines: {
      L1: {
        size: '4 in',
        pipe_ft: null,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: null,
        butterfly: null,
        kuka: null,
      },
      L2: {
        size: '4 in',
        pipe_ft: 30,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: 5,
        butterfly: null,
        kuka: null,
      },
      L3: {
        size: '4 in',
        pipe_ft: 20,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: 3,
        butterfly: null,
        kuka: null,
      },
      L4: {
        size: '4 in',
        pipe_ft: null,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: null,
        butterfly: null,
        kuka: null,
      },
    },
  },
  Deepwater: {
    manifold_size: '7-1/16 in L-Shaped',
    choke_size: '6 in',
    flow_path: 'Two Chokes',
    flow_meter_size: '6 in',
    returns_to: 'Shale Shakers',
    height_rcd_to_ss_ft: null as NullableNum,
    height_rcd_to_mgs_ft: null as NullableNum,
    fm_manifold: null as NullableNum,
    misc: null as NullableNum,
    dist_manifold: null as NullableNum,
    lines: {
      L1: {
        size: '6 in',
        pipe_ft: null,
        hose_ft: 200,
        tees_line: null,
        tees_branched: null,
        elbows: null,
        butterfly: null,
        kuka: null,
      },
      L2: {
        size: '6 in',
        pipe_ft: 62,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: 6,
        butterfly: 3,
        kuka: 2,
      },
      L3: {
        size: '6 in',
        pipe_ft: 25,
        hose_ft: null,
        tees_line: null,
        tees_branched: 2,
        elbows: 2,
        butterfly: 4,
        kuka: 1,
      },
      L4: {
        size: '6 in',
        pipe_ft: null,
        hose_ft: null,
        tees_line: null,
        tees_branched: null,
        elbows: null,
        butterfly: null,
        kuka: null,
      },
    },
  },
} as const

/**
 * Apply package equipment + lines onto a base SurfaceInputs.
 * Heights / FM-manifold / misc / dist flags are null in workbook packages —
 * we leave existing base heights and set those flags to N/A (blank ≡ off).
 */
export function applyPreset(name: PresetName, base?: SurfaceInputs): SurfaceInputs {
  const pkg = PACKAGE_RAW[name]
  const src = base ?? sampleInputs()
  return {
    ...src,
    wellName: `${name} package`,
    // heights null in Paramaters — keep current sample heights (do not invent package heights)
    manifold: pkg.manifold_size as SurfaceInputs['manifold'],
    chokeSize: pkg.choke_size as SurfaceInputs['chokeSize'],
    chokePath: pkg.flow_path as SurfaceInputs['chokePath'],
    flowMeter: pkg.flow_meter_size as SurfaceInputs['flowMeter'],
    returns: pkg.returns_to as SurfaceInputs['returns'],
    fmManifold: 'N/A',
    misc: 'N/A',
    distManifold: 'N/A',
    lines: [
      toLine(pkg.lines.L1),
      toLine(pkg.lines.L2),
      toLine(pkg.lines.L3),
      toLine(pkg.lines.L4),
    ],
  }
}

export { emptyLine }
