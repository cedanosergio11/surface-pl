/**
 * SurfacePL pure calc module.
 *
 * Geometry factor: workbook uses G = Ba/Bx with x = 1.0678 on pipe.
 * Pure API RP 13D pipe uses G = Ba (~1% higher ΔP in turbulent spot-check).
 * V1 matches FIXED workbook G=Ba/Bx. See docs/engine-notes.md.
 */

export * from './types'
export {
  PIPE_IDS,
  FITTING_FACTORS,
  MANIFOLD_GEOMETRY,
  CHOKE_EQ,
  FLOW_METER_GEOMETRY,
  DIST_MANIFOLD,
  FM_MANIFOLD,
  MISC_CURVE,
  BX_X,
  HYDRO_FACTOR,
  SIZE_OPTIONS,
  MANIFOLD_OPTIONS,
  CHOKE_OPTIONS,
  CHOKE_PATH_OPTIONS,
  FM_OPTIONS,
  RETURNS_OPTIONS,
  YES_NA_OPTIONS,
} from './parameters'
export type { FittingFactors } from './parameters'
export * from './normalize'
export * from './hb'
export * from './leq'
export * from './system'
export * from './presets'
export * from './defaults'
