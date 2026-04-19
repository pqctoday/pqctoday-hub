// SPDX-License-Identifier: GPL-3.0-only
//
// Thin TypeScript binding around the v2 strongSwan WASM build from
// pqctoday-hsm/strongswan-wasm-v2-shims/. Provides stepwise ML-DSA + ML-KEM
// primitives through softhsmv3 PKCS#11 inside the browser.
//
// Does NOT replace the legacy StrongSwanEngine bridge (still at
// src/wasm/strongswan/bridge.ts) — the two coexist. Gate this binding
// behind VITE_WASM_VPN_V2=1 in VpnSimulationPanel until the full IKE
// transport layer (Phase 3e) lands.

export interface V2Event {
  type: string
  payload: string
}

interface StrongswanV2Module {
  ccall: (fn: string, ret: string | null, argTypes: string[], args: unknown[]) => number
  HEAPU8: Uint8Array
  _malloc: (n: number) => number
  _free: (p: number) => void
}

type V2Factory = (opts: {
  onVpnEvent?: (type: string, payload: string) => void
  locateFile?: (file: string) => string
}) => Promise<StrongswanV2Module>

let cached: Promise<StrongswanV2Module> | null = null

async function loadV2(onEvent: (e: V2Event) => void): Promise<StrongswanV2Module> {
  if (cached) return cached
  // Vite serves public/wasm/ at /wasm/. Use a dynamic import so the module
  // is only fetched when the v2 flag is actually on.
  cached = (async () => {
    // Emscripten's MODULARIZE-wrapped .js is a UMD-ish factory; fetch as text
    // and eval into a factory reference. Import() on a path inside /public is
    // unreliable across Vite builds, so use fetch + Function-wrap for safety.
    const res = await fetch('/wasm/strongswan-v2.js')
    if (!res.ok) throw new Error(`fetch strongswan-v2.js: ${res.status}`)
    const src = await res.text()
    // eslint-disable-next-line security/detect-eval-with-expression
    const factory = new Function(`${src}; return StrongswanV2;`)() as V2Factory
    return factory({
      onVpnEvent: (type, payload) => onEvent({ type, payload }),
      locateFile: (f) => `/wasm/${f}`,
    })
  })()
  return cached
}

export interface V2SelftestResult {
  mlDsaSigLen: number
  mlKemPub: number
  mlKemCt: number
  mlKemSecret: number
  mlKemMatch: boolean
  events: V2Event[]
}

/** Run ML-DSA-65 sign/verify + ML-KEM-768 loopback round-trip inside a
 *  single WASM instance. Used by the panel's "v2 selftest" action. */
export async function runV2Selftest(
  onEvent: (e: V2Event) => void = () => {}
): Promise<V2SelftestResult> {
  const events: V2Event[] = []
  const capture = (e: V2Event) => {
    events.push(e)
    onEvent(e)
  }

  const mod = await loadV2(capture)
  mod.ccall('wasm_vpn_boot', 'number', [], [])

  const sigLen = mod.ccall('wasm_vpn_ml_dsa_selftest', 'number', [], [])

  const match = mod.ccall('wasm_vpn_ml_kem_selftest', 'number', [], [])
  // Derive sizes from the last ml_kem_selftest event string
  const kemLine = events.findLast((e) => e.type === 'ml_kem_selftest')?.payload ?? ''
  const parseInt10 = (label: string): number => {
    const m = kemLine.match(new RegExp(`${label}=(\\d+)`))
    return m ? Number(m[1]) : 0
  }

  return {
    mlDsaSigLen: sigLen,
    mlKemPub: parseInt10('pub'),
    mlKemCt: parseInt10('ct'),
    mlKemSecret: parseInt10('secret'),
    mlKemMatch: match === 1,
    events,
  }
}
