import { describe, expect, it } from 'vitest'
import acceptance from './fixtures/acceptance.json'
import { herschelBulkleyPipe, hydroPsi, rheologyParams } from './hb'
import { leqFromCounts } from './leq'
import { FITTING_FACTORS } from './parameters'
import { computeSurfacePl } from './system'
import { sampleInputs } from './defaults'

type Case = {
  name: string
  inputs: Record<string, unknown>
  expect: Record<string, unknown>
}

const cases = acceptance as Case[]

function byName(name: string) {
  const row = cases.find((c) => c.name === name)
  if (!row) throw new Error(`missing acceptance case: ${name}`)
  return row
}

function withinPct(actual: number, expected: number, pct: number) {
  const tol = (Math.abs(expected) * pct) / 100
  expect(actual).toBeGreaterThanOrEqual(expected - tol)
  expect(actual).toBeLessThanOrEqual(expected + tol)
}

describe('acceptance.json (FIXED workbook)', () => {
  it('pipe_friction_dP_per_1000ft_workbook_G_Bx ≈ 85.314 (±2%)', () => {
    const c = byName('pipe_friction_dP_per_1000ft_workbook_G_Bx')
    const i = c.inputs as {
      Q_gpm: number
      ID_in: number
      MW_ppg: number
      theta600: number
      theta300: number
      theta6: number
      theta3: number
    }
    const hb = herschelBulkleyPipe(i.Q_gpm, i.ID_in, {
      mwPpg: i.MW_ppg,
      theta600: i.theta600,
      theta300: i.theta300,
      theta6: i.theta6,
      theta3: i.theta3,
    })
    const expected = c.expect.dP_psi_per_1000ft as number
    const tolPct = (c.expect.tolerance_pct as number) ?? 2
    withinPct(hb.dPpsiPer1000ft, expected, tolPct)
    expect(hb.dPpsiPer1000ft).toBeCloseTo(85.31434615398504, 4)
  })

  it('hydrostatic_rcd_to_ss = 16.38 psi', () => {
    const c = byName('hydrostatic_rcd_to_ss')
    const i = c.inputs as { height_ft: number; MW_ppg: number }
    const h = hydroPsi(i.height_ft, i.MW_ppg)
    expect(h).toBeCloseTo(c.expect.hydro_psi as number, 10)
    expect(h).toBe(16.38)
  })

  it('rheology_PV_YP_LSYP', () => {
    const c = byName('rheology_PV_YP_LSYP')
    const i = c.inputs as {
      theta600: number
      theta300: number
      theta6: number
      theta3: number
    }
    const r = rheologyParams({
      mwPpg: 10.5,
      theta600: i.theta600,
      theta300: i.theta300,
      theta6: i.theta6,
      theta3: i.theta3,
    })
    expect(r.pv).toBe(c.expect.PV)
    expect(r.yp).toBe(c.expect.YP)
    expect(r.lsyp).toBe(c.expect.LSYP)
  })

  it('pipe_velocity Vp = 919.125 ft/min', () => {
    const c = byName('pipe_velocity')
    const i = c.inputs as { Q_gpm: number; ID_in: number }
    const vp = (24.51 * i.Q_gpm) / (i.ID_in * i.ID_in)
    expect(vp).toBeCloseTo(c.expect.Vp_ft_per_min as number, 10)
  })

  it('sample_L1_Leq_and_line_PL', () => {
    const c = byName('sample_L1_Leq_and_line_PL')
    const i = c.inputs as {
      pipe_ft: number
      tees_line: number
      elbows: number
      dP_per_1000ft: number
    }
    const leq = leqFromCounts(
      FITTING_FACTORS['4 in'],
      i.pipe_ft,
      0,
      i.tees_line,
      0,
      i.elbows,
      0,
      0,
    )
    expect(leq).toBe(c.expect.Leq_ft)
    const linePl = leq * (i.dP_per_1000ft / 1000)
    expect(linePl).toBeCloseTo(c.expect.line_PL_psi as number, 8)
  })

  it('two_chokes_halves_flow → manifold/choke Q = 300', () => {
    const c = byName('two_chokes_halves_flow')
    const inputs = sampleInputs()
    inputs.chokePath = 'Two Chokes'
    inputs.pumpGpm = c.inputs.Q_gpm as number
    inputs.boosterGpm = 0
    const pl = computeSurfacePl(inputs)
    expect(pl.manifoldChokeQGpm).toBe(c.expect.manifold_choke_Q_gpm)
  })

  it('pure_Ba_reference_deviation ~86 psi (document only; engine keeps G=Ba/Bx)', () => {
    const c = byName('pure_Ba_reference_deviation')
    const base = byName('pipe_friction_dP_per_1000ft_workbook_G_Bx')
    const i = base.inputs as {
      Q_gpm: number
      ID_in: number
      MW_ppg: number
      theta600: number
      theta300: number
      theta6: number
      theta3: number
    }
    const hb = herschelBulkleyPipe(i.Q_gpm, i.ID_in, {
      mwPpg: i.MW_ppg,
      theta600: i.theta600,
      theta300: i.theta300,
      theta6: i.theta6,
      theta3: i.theta3,
    })
    expect(hb.dPpsiPer1000ftPureBa).toBeCloseTo(
      c.expect.dP_psi_per_1000ft_approx as number,
      0,
    )
    expect(hb.dPpsiPer1000ft).toBeCloseTo(85.3, 0)
  })
})

describe('sample system vs cached workbook outputs', () => {
  it('sample L1 PL ≈ 14.077 psi; hydro SS 16.38', () => {
    const pl = computeSurfacePl(sampleInputs())
    expect(pl.leq.line1).toBe(165)
    expect(pl.line1).toBeCloseTo(14.076867115407532, 4)
    expect(pl.hydroSs).toBe(16.38)
    expect(pl.hb?.dPpsiPer1000ft).toBeCloseTo(85.31434615398504, 4)
  })
})
