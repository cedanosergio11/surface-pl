import type { LineInput, Rheology, SurfaceInputs } from './types'

export function emptyLine(size: LineInput['size'] = ''): LineInput {
  return {
    size,
    pipeFt: 0,
    hoseFt: 0,
    teeLine: 0,
    teeBranch: 0,
    elbow: 0,
    butterfly: 0,
    kuka: 0,
    customIdIn: 5,
  }
}

const sampleRheology: Rheology = {
  mwPpg: 10.5,
  theta600: 19,
  theta300: 13,
  theta6: 2,
  theta3: 1,
}

/** Sample `1. Input Data` from sample-inputs.json (null → 0 / N/A). */
export function sampleInputs(): SurfaceInputs {
  return {
    wellName: '',
    heightRcdToSsFt: 30,
    heightRcdToMgsFt: 10,
    manifold: '4 in L-shaped',
    chokeSize: '3 in',
    chokePath: 'One Choke',
    flowMeter: '4 in',
    returns: 'MGS',
    fmManifold: 'N/A',
    misc: 'N/A',
    distManifold: 'N/A',
    lines: [
      {
        size: '4 in',
        pipeFt: 120,
        hoseFt: 0,
        teeLine: 5,
        teeBranch: 0,
        elbow: 1,
        butterfly: 0,
        kuka: 0,
        customIdIn: 5,
      },
      {
        size: '4 in',
        pipeFt: 120,
        hoseFt: 0,
        teeLine: 5,
        teeBranch: 0,
        elbow: 1,
        butterfly: 0,
        kuka: 0,
        customIdIn: 5,
      },
      emptyLine(''), // L3 empty in sample
      {
        size: '4 in',
        pipeFt: 30,
        hoseFt: 20,
        teeLine: 5,
        teeBranch: 0,
        elbow: 1,
        butterfly: 0,
        kuka: 0,
        customIdIn: 5,
      },
    ],
    rheologyLive: { ...sampleRheology },
    rheologyMax: { ...sampleRheology },
    rheologyAverage: { ...sampleRheology },
    rheologyMin: { ...sampleRheology },
    activeRheology: 'live',
    pumpGpm: 600,
    boosterGpm: 0,
    modpPsi: null,
    customManifoldIdIn: 6,
  }
}
