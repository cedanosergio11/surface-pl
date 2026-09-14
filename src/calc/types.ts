export type PipeSizeKey = '4 in' | '6 in' | '8 in' | '10 in' | 'Custom'
export type ManifoldKey = '4 in L-shaped' | '4 in Flat' | '7-1/16 in L-Shaped' | 'Custom'
export type FlowMeterKey = 'N/A' | '4 in' | '6 in' | '8 in'
export type ChokeSize = '3 in' | '6 in'
export type ChokePathOption = 'One Choke' | 'Two Chokes'
export type ReturnsOption = 'Shale Shakers' | 'MGS'
export type YesNa = 'N/A' | 'Yes'
export type RheologySet = 'live' | 'max' | 'average' | 'min'
export type PresetName = 'Land' | 'Offshore' | 'Deepwater'

export interface Rheology {
  mwPpg: number
  theta600: number
  theta300: number
  theta6: number
  theta3: number
}

export interface LineInput {
  size: PipeSizeKey | ''
  pipeFt: number
  hoseFt: number
  teeLine: number
  teeBranch: number
  elbow: number
  butterfly: number
  kuka: number
  customIdIn: number
}

export interface SurfaceInputs {
  wellName: string
  heightRcdToSsFt: number
  heightRcdToMgsFt: number
  manifold: ManifoldKey
  chokeSize: ChokeSize
  chokePath: ChokePathOption
  flowMeter: FlowMeterKey
  returns: ReturnsOption
  fmManifold: YesNa
  misc: YesNa
  distManifold: YesNa
  lines: [LineInput, LineInput, LineInput, LineInput]
  rheologyLive: Rheology
  rheologyMax: Rheology
  rheologyAverage: Rheology
  rheologyMin: Rheology
  activeRheology: RheologySet
  pumpGpm: number
  boosterGpm: number
  modpPsi: number | null
  customManifoldIdIn: number
}

export interface HbPipeResult {
  pv: number
  yp: number
  lsyp: number
  vpFtPerMin: number
  n: number
  k: number
  np: number
  ba: number
  bx: number
  g: number
  gammaW: number
  tauF: number
  tauW: number
  nRe: number
  ncRe: number
  f: number
  regime: 'laminar' | 'turbulent'
  dPpsiPer1000ft: number
  dPpsiPer1000ftPureBa: number
}

export interface PlBreakdown {
  line1: number
  line2: number
  line3: number
  line4: number
  linesSs: number
  linesMgs: number
  manifold: number
  choke: number
  flowMeter: number
  fmManifold: number
  distManifold: number
  misc: number
  hydroSs: number
  hydroMgs: number
  systemPlSs: number
  systemPlMgs: number
  bpWhSs: number
  bpWhMgs: number
  bpWhActive: number
  totalQGpm: number
  manifoldChokeQGpm: number
  hb: HbPipeResult | null
  leq: {
    line1: number
    line2: number
    line3: number
    line4: number
    manifold: number
    choke: number
    flowMeter: number
    fmManifold: number
    distManifold: number
  }
}

export interface EnvelopePoint {
  qGpm: number
  bpMin: number
  bpAvg: number
  bpMax: number
  modp: number | null
}
