import type {
  ChokePathOption,
  ChokeSize,
  FlowMeterKey,
  ManifoldKey,
  PipeSizeKey,
  ReturnsOption,
  YesNa,
} from './types'

/** Trim + collapse internal whitespace; never leave leading spaces that break EXACT-style matches. */
export function normalizeSelect(raw: string | null | undefined): string {
  if (raw == null) return ''
  return String(raw).trim().replace(/\s+/g, ' ')
}

const PIPE_ALIASES: Record<string, PipeSizeKey> = {
  '4 in': '4 in',
  '4"': '4 in',
  '4': '4 in',
  '6 in': '6 in',
  '6"': '6 in',
  '6': '6 in',
  '8 in': '8 in',
  '8"': '8 in',
  '8': '8 in',
  '10 in': '10 in',
  '10"': '10 in',
  '10': '10 in',
  custom: 'Custom',
}

const MANIFOLD_ALIASES: Record<string, ManifoldKey> = {
  '4 in l-shaped': '4 in L-shaped',
  '4 in flat': '4 in Flat',
  '7-1/16 in l-shaped': '7-1/16 in L-Shaped',
  custom: 'Custom',
}

export function normalizePipeSize(raw: string | null | undefined): PipeSizeKey | '' {
  const t = normalizeSelect(raw).toLowerCase()
  if (!t) return ''
  return PIPE_ALIASES[t] ?? (t === 'custom' ? 'Custom' : '')
}

export function normalizeManifold(raw: string | null | undefined): ManifoldKey {
  const t = normalizeSelect(raw).toLowerCase()
  return MANIFOLD_ALIASES[t] ?? '4 in L-shaped'
}

export function normalizeChokeSize(raw: string | null | undefined): ChokeSize {
  const t = normalizeSelect(raw).toLowerCase()
  return t.startsWith('6') ? '6 in' : '3 in'
}

export function normalizeChokePath(raw: string | null | undefined): ChokePathOption {
  const t = normalizeSelect(raw).toLowerCase()
  return t.includes('two') ? 'Two Chokes' : 'One Choke'
}

export function normalizeFlowMeter(raw: string | null | undefined): FlowMeterKey {
  const t = normalizeSelect(raw).toLowerCase()
  if (!t || t === 'n/a' || t === 'na') return 'N/A'
  if (t.startsWith('8')) return '8 in'
  if (t.startsWith('6')) return '6 in'
  if (t.startsWith('4')) return '4 in'
  return 'N/A'
}

export function normalizeReturns(raw: string | null | undefined): ReturnsOption {
  const t = normalizeSelect(raw).toLowerCase()
  return t.includes('mgs') ? 'MGS' : 'Shale Shakers'
}

export function normalizeYesNa(raw: string | null | undefined): YesNa {
  const t = normalizeSelect(raw).toLowerCase()
  return t === 'yes' ? 'Yes' : 'N/A'
}

export function num(v: unknown, fallback = 0): number {
  if (v == null || v === '') return fallback
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}
