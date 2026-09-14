import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import {
  CHOKE_OPTIONS,
  CHOKE_PATH_OPTIONS,
  FM_OPTIONS,
  MANIFOLD_OPTIONS,
  RETURNS_OPTIONS,
  SIZE_OPTIONS,
  YES_NA_OPTIONS,
  applyPreset,
  buildEnvelope,
  computeSurfacePl,
  sampleInputs,
  type PresetName,
  type SurfaceInputs,
  type LineInput,
} from './calc'

function Field({
  label,
  unit,
  children,
}: {
  label: string
  unit?: string
  children: React.ReactNode
}) {
  return (
    <label>
      <span>
        {label}
        {unit ? (
          <>
            {' '}
            <span className="unit">({unit})</span>
          </>
        ) : null}
      </span>
      {children}
    </label>
  )
}

function numOr0(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function App() {
  const [inputs, setInputs] = useState<SurfaceInputs>(() => sampleInputs())
  const [pendingPreset, setPendingPreset] = useState<PresetName | null>(null)

  const result = useMemo(() => computeSurfacePl(inputs), [inputs])
  const envelope = useMemo(() => buildEnvelope(inputs), [inputs])

  const r = inputs.rheologyLive

  function patch(p: Partial<SurfaceInputs>) {
    setInputs((prev) => ({ ...prev, ...p }))
  }

  function patchRheology(key: keyof typeof r, value: number) {
    const next = { ...r, [key]: value }
    patch({
      rheologyLive: next,
      rheologyAverage: next,
      rheologyMax: next,
      rheologyMin: next,
    })
  }

  function patchLine(idx: number, p: Partial<LineInput>) {
    const lines = [...inputs.lines] as SurfaceInputs['lines']
    lines[idx] = { ...lines[idx], ...p }
    patch({ lines })
  }

  function confirmPreset() {
    if (!pendingPreset) return
    setInputs(applyPreset(pendingPreset, inputs))
    setPendingPreset(null)
  }

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '—')

  return (
    <>
      <div className="scope-banner" role="status">
        Surface circuit only —{' '}
        <span>
          NOT ECD · NOT annular SBP · NOT kick tolerance · NOT volumes/strokes · NOT choke Cv/bean
          control
        </span>
      </div>

      <div className="app">
        <header className="app-header">
          <div>
            <h1>SurfacePL</h1>
            <p>
              Wellhead backpressure from the surface circuit — flowline, manifold, choke (wide-open
              eq-L), FM, and RCD elevation hydro.
            </p>
          </div>
          <div className="preset-row" style={{ marginBottom: 0 }}>
            {(['Land', 'Offshore', 'Deepwater'] as PresetName[]).map((name) => (
              <button key={name} type="button" onClick={() => setPendingPreset(name)}>
                {name}
              </button>
            ))}
          </div>
        </header>

        {pendingPreset ? (
          <div className="panel">
            <div className="preset-row">
              <strong>Load {pendingPreset} package defaults?</strong>
              <button type="button" className="primary" onClick={confirmPreset}>
                Confirm
              </button>
              <button type="button" onClick={() => setPendingPreset(null)}>
                Cancel
              </button>
              <span className="hint">Package heights blank in FIXED stay as sample 30/10 ft when labeled sample.</span>
            </div>
          </div>
        ) : null}

        <div className="kpi-row">
          <div className={`kpi${inputs.returns === 'Shale Shakers' ? ' active' : ''}`}>
            <div className="label">WH BP · SS path</div>
            <div className="value">
              {fmt(result.bpWhSs)}
              <span>psi</span>
            </div>
          </div>
          <div className={`kpi${inputs.returns === 'MGS' ? ' active' : ''}`}>
            <div className="label">WH BP · MGS path</div>
            <div className="value">
              {fmt(result.bpWhMgs)}
              <span>psi</span>
            </div>
          </div>
        </div>

        <div className="assumptions">
          Assumptions: P&amp;T neglected · one flow meter · max two chokes · fittings as equivalent
          length · pipe size is <strong>pipe ID</strong> basis · choke = wide-open body eq-L only ·
          workbook G=Ba/Bx (x=1.0678; ~1% vs pure-pipe G=Ba)
        </div>

        <div className="grid-2">
          <div className="panel">
            <h2>Mud &amp; rates</h2>
            <div className="fields">
              <Field label="MW" unit="ppg">
                <input
                  type="number"
                  step="0.1"
                  value={r.mwPpg}
                  onChange={(e) => patchRheology('mwPpg', numOr0(e.target.value))}
                />
              </Field>
              <Field label="θ600" unit="dial">
                <input
                  type="number"
                  value={r.theta600}
                  onChange={(e) => patchRheology('theta600', numOr0(e.target.value))}
                />
              </Field>
              <Field label="θ300" unit="dial">
                <input
                  type="number"
                  value={r.theta300}
                  onChange={(e) => patchRheology('theta300', numOr0(e.target.value))}
                />
              </Field>
              <Field label="θ6" unit="dial">
                <input
                  type="number"
                  value={r.theta6}
                  onChange={(e) => patchRheology('theta6', numOr0(e.target.value))}
                />
              </Field>
              <Field label="θ3" unit="dial">
                <input
                  type="number"
                  value={r.theta3}
                  onChange={(e) => patchRheology('theta3', numOr0(e.target.value))}
                />
              </Field>
              <Field label="Pump rate" unit="gpm">
                <input
                  type="number"
                  value={inputs.pumpGpm}
                  onChange={(e) => patch({ pumpGpm: numOr0(e.target.value) })}
                />
              </Field>
              <Field label="Riser booster" unit="gpm">
                <input
                  type="number"
                  value={inputs.boosterGpm}
                  onChange={(e) => patch({ boosterGpm: numOr0(e.target.value) })}
                />
              </Field>
              <Field label="MODP (envelope)" unit="psi">
                <input
                  type="number"
                  value={inputs.modpPsi ?? ''}
                  placeholder="optional"
                  onChange={(e) =>
                    patch({
                      modpPsi: e.target.value === '' ? null : numOr0(e.target.value),
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="panel">
            <h2>Path &amp; equipment</h2>
            <div className="fields">
              <Field label="RCD → SS height" unit="ft">
                <input
                  type="number"
                  value={inputs.heightRcdToSsFt}
                  onChange={(e) => patch({ heightRcdToSsFt: numOr0(e.target.value) })}
                />
              </Field>
              <Field label="RCD → MGS height" unit="ft">
                <input
                  type="number"
                  value={inputs.heightRcdToMgsFt}
                  onChange={(e) => patch({ heightRcdToMgsFt: numOr0(e.target.value) })}
                />
              </Field>
              <Field label="Manifold size">
                <select
                  value={inputs.manifold}
                  onChange={(e) =>
                    patch({ manifold: e.target.value as SurfaceInputs['manifold'] })
                  }
                >
                  {MANIFOLD_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Choke size (wide-open eq-L)">
                <select
                  value={inputs.chokeSize}
                  onChange={(e) =>
                    patch({ chokeSize: e.target.value as SurfaceInputs['chokeSize'] })
                  }
                >
                  {CHOKE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Flow path">
                <select
                  value={inputs.chokePath}
                  onChange={(e) =>
                    patch({ chokePath: e.target.value as SurfaceInputs['chokePath'] })
                  }
                >
                  {CHOKE_PATH_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Flow meter size" unit="ID">
                <select
                  value={inputs.flowMeter}
                  onChange={(e) =>
                    patch({ flowMeter: e.target.value as SurfaceInputs['flowMeter'] })
                  }
                >
                  {FM_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Returns to">
                <select
                  value={inputs.returns}
                  onChange={(e) =>
                    patch({ returns: e.target.value as SurfaceInputs['returns'] })
                  }
                >
                  {RETURNS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="FM manifold">
                <select
                  value={inputs.fmManifold}
                  onChange={(e) =>
                    patch({ fmManifold: e.target.value as SurfaceInputs['fmManifold'] })
                  }
                >
                  {YES_NA_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Misc equipment">
                <select
                  value={inputs.misc}
                  onChange={(e) => patch({ misc: e.target.value as SurfaceInputs['misc'] })}
                >
                  {YES_NA_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Dist. manifold">
                <select
                  value={inputs.distManifold}
                  onChange={(e) =>
                    patch({ distManifold: e.target.value as SurfaceInputs['distManifold'] })
                  }
                >
                  {YES_NA_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Lines L1–L4 (pipe ID)</h2>
          <div className="lines-wrap">
          <table className="lines-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>Size (ID)</th>
                <th>Pipe (ft)</th>
                <th>Hose (ft)</th>
                <th>Tees line</th>
                <th>Tees branch</th>
                <th>Elbows</th>
                <th>Butterfly</th>
                <th>Kuka</th>
              </tr>
            </thead>
            <tbody>
              {(['L1', 'L2', 'L3', 'L4'] as const).map((name, idx) => {
                const line = inputs.lines[idx]
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>
                      <select
                        value={line.size}
                        onChange={(e) =>
                          patchLine(idx, {
                            size: e.target.value as LineInput['size'],
                          })
                        }
                      >
                        <option value="">—</option>
                        {SIZE_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </td>
                    {(
                      [
                        ['pipeFt', line.pipeFt],
                        ['hoseFt', line.hoseFt],
                        ['teeLine', line.teeLine],
                        ['teeBranch', line.teeBranch],
                        ['elbow', line.elbow],
                        ['butterfly', line.butterfly],
                        ['kuka', line.kuka],
                      ] as const
                    ).map(([key, val]) => (
                      <td key={key}>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => patchLine(idx, { [key]: numOr0(e.target.value) })}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
          <p className="note">
            SS path = L1+L2+L3 + hydro SS · MGS path = L1+L2+L4 + hydro MGS · Two Chokes halves
            manifold/choke Q only · Choke 3″→18 ft@ID3 · 6″→37 ft@ID6
          </p>
        </div>

        <div className="grid-2">
          <div className="panel breakdown">
            <h2>PL breakdown (psi)</h2>
            <table>
              <tbody>
                <tr>
                  <td>Line 1</td>
                  <td className="num">{fmt(result.line1)}</td>
                </tr>
                <tr>
                  <td>Line 2</td>
                  <td className="num">{fmt(result.line2)}</td>
                </tr>
                <tr>
                  <td>Line 3</td>
                  <td className="num">{fmt(result.line3)}</td>
                </tr>
                <tr>
                  <td>Line 4</td>
                  <td className="num">{fmt(result.line4)}</td>
                </tr>
                <tr>
                  <td>Manifold + choke (eq-L)</td>
                  <td className="num">{fmt(result.manifold)}</td>
                </tr>
                <tr>
                  <td>Flow meter</td>
                  <td className="num">{fmt(result.flowMeter)}</td>
                </tr>
                <tr>
                  <td>FM manifold</td>
                  <td className="num">{fmt(result.fmManifold)}</td>
                </tr>
                <tr>
                  <td>Dist. manifold</td>
                  <td className="num">{fmt(result.distManifold)}</td>
                </tr>
                <tr>
                  <td>Misc</td>
                  <td className="num">{fmt(result.misc)}</td>
                </tr>
                <tr>
                  <td>Hydro SS</td>
                  <td className="num">{fmt(result.hydroSs)}</td>
                </tr>
                <tr>
                  <td>Hydro MGS</td>
                  <td className="num">{fmt(result.hydroMgs)}</td>
                </tr>
                <tr>
                  <td>BP wellhead SS</td>
                  <td className="num">{fmt(result.bpWhSs)}</td>
                </tr>
                <tr>
                  <td>BP wellhead MGS</td>
                  <td className="num">{fmt(result.bpWhMgs)}</td>
                </tr>
                <tr className="total">
                  <td>Active BP ({inputs.returns})</td>
                  <td className="num">{fmt(result.bpWhActive)} psi</td>
                </tr>
              </tbody>
            </table>
            <p className="note">
              ΔP/1000 ft @ ref ID: {fmt(result.hb?.dPpsiPer1000ft ?? 0)} psi (workbook G) · pure Ba{' '}
              {fmt(result.hb?.dPpsiPer1000ftPureBa ?? 0)} · Q manifold/choke{' '}
              {fmt(result.manifoldChokeQGpm)} gpm
            </p>
          </div>

          <div className="panel">
            <h2>Flow sweep envelope</h2>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={envelope} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#2a333c" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="qGpm"
                    stroke="#93a09a"
                    label={{ value: 'Q (gpm)', position: 'insideBottom', offset: -2, fill: '#93a09a' }}
                  />
                  <YAxis
                    stroke="#93a09a"
                    label={{ value: 'BP (psi)', angle: -90, position: 'insideLeft', fill: '#93a09a' }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #2a333c' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="bpMin" name="Min rheology" stroke="#6aa882" dot={false} />
                  <Line type="monotone" dataKey="bpAvg" name="Avg rheology" stroke="#4d8f8a" dot={false} />
                  <Line type="monotone" dataKey="bpMax" name="Max rheology" stroke="#c45c4a" dot={false} />
                  {inputs.modpPsi != null ? (
                    <ReferenceLine
                      y={inputs.modpPsi}
                      stroke="#e9c31e"
                      strokeDasharray="4 4"
                      label="MODP"
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="note">
              Envelope uses Min / Average / Max rheology sets (sample workbook has identical θ’s).
            </p>
          </div>
        </div>
      <p className="app-footer">
          SurfacePL · Stasis surface circuit · MPGenie signs numbers before field use
        </p>
      </div>
    </>
  )
}

