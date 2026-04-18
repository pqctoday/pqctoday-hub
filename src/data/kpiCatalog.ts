// SPDX-License-Identifier: GPL-3.0-only
/**
 * KPI catalog — the single source of truth for every KPI surfaced by the
 * Command Center (Governance Dashboard + Migration Tracker).
 *
 * Each definition declares:
 *   - metadata (id, label, description, category)
 *   - which personas it applies to and the default weight per persona
 *   - how (if at all) it is auto-scored from live data (threats, catalog,
 *     assessment, compliance selections, country deadline)
 *   - optional control-framework mappings for executive exports
 *
 * Components read this catalog via `getKpiSet(persona, surface)` and render
 * whatever subset applies. Weights per persona are kept here so all role
 * tuning lives in one file.
 */
import type { PersonaId } from './learningPersonas'
import type { ExecutiveModuleData } from '@/hooks/useExecutiveModuleData'
import type { ScorecardDimension } from '@/components/PKILearning/common/executive'
import { getKpiTarget } from './kpiTargets'

// ── Persona scope ────────────────────────────────────────────────────────
// Only personas who can reach the Business Center get a KPI variant.
// (developer / curious are nav-blocked from /business — see personaConfig.ts)
export type KpiPersonaId = Extract<PersonaId, 'executive' | 'architect' | 'ops' | 'researcher'>

export const KPI_PERSONAS: readonly KpiPersonaId[] = [
  'executive',
  'architect',
  'ops',
  'researcher',
] as const

// ── KPI surfaces ─────────────────────────────────────────────────────────
// Two distinct tools render from this catalog.
export type KpiSurface = 'governance' | 'migration'

// ── KPI categories (for future grouping in UI) ───────────────────────────
export type KpiCategory =
  | 'coverage'
  | 'progress'
  | 'vendor'
  | 'compliance'
  | 'risk'
  | 'operational'
  | 'research'
  | 'financial'

// ── Auto-score result ────────────────────────────────────────────────────
/**
 * An auto-scoring function returns a 0–100 value, or null when the required
 * data is not yet available (e.g. assessment not completed). A null value
 * causes the dimension to render in a "disabled / unlock" state.
 */
export type KpiAutoScoreFn = (data: ExecutiveModuleData) => number | null

// ── KPI definition ───────────────────────────────────────────────────────
export interface KpiDefinition {
  id: string
  label: string
  description: string
  category: KpiCategory
  /** Which surfaces this KPI appears on. */
  surfaces: readonly KpiSurface[]
  /** Default weight per persona (0–1). Undefined = KPI not shown to that persona. */
  weights: Partial<Record<KpiPersonaId, number>>
  /** Auto-scoring function, if any. Returning null marks the KPI disabled. */
  autoScore?: KpiAutoScoreFn
  /** If the KPI is auto-scored, can the user still override the value? */
  userOverride?: boolean
  /** Message shown when `autoScore` returns null. */
  disabledReason?: string
  /** Control-framework cross-references (rendered in executive exports). */
  mappings?: {
    csf2?: string
    iso27001?: string
    soc2?: string
  }
  /** Optional "on-track" target hint surfaced as a tick on the slider. */
  defaultTarget?: number
}

// ── PQC readiness tiers (for weighted vendor readiness) ──────────────────
/**
 * Maps free-form `pqcSupport` strings in the product catalog to a readiness
 * weight in [0,1]. The catalog CSV uses narrative values like
 *   "Yes (ML-KEM production)" → Full
 *   "Partial (ML-KEM planned)" → Hybrid
 *   "Planned (ML-DSA 2026)" → Roadmap
 *   "None" / "No" → None
 * Keyword heuristics below keep the mapping resilient to narrative drift.
 */
export function pqcReadinessTier(pqcSupport: string | undefined | null): number {
  if (!pqcSupport) return 0
  const s = pqcSupport.toLowerCase().trim()
  if (s === 'none' || s === 'no' || s.startsWith('no ')) return 0
  if (s.startsWith('yes')) return 1.0
  if (s.includes('partial') || s.includes('hybrid')) return 0.7
  if (s.includes('pilot') || s.includes('beta')) return 0.4
  if (s.includes('planned') || s.includes('roadmap') || s.includes('announce')) return 0.2
  // Conservative middle for narrative values like "Credential", "Identity" —
  // mentions a product feature but no explicit PQC status.
  return 0.3
}

// ── Shared auto-score helpers ────────────────────────────────────────────
function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v))
}

// Vendor readiness (tiered, industry-aware).
const vendorReadinessAuto: KpiAutoScoreFn = (data) => {
  if (data.totalProducts === 0) return null
  // Tiered: sum readiness weights ÷ products (in %).
  // Falls back to binary `pqcReadyCount` when the hook hasn't been updated.
  if (typeof data.vendorReadinessWeighted === 'number') {
    return Math.round(data.vendorReadinessWeighted * 100)
  }
  return Math.round((data.pqcReadyCount / data.totalProducts) * 100)
}

// FIPS-validated deployment %.
const fipsValidatedAuto: KpiAutoScoreFn = (data) => {
  if (data.totalProducts === 0) return null
  return Math.round((data.fipsValidatedCount / data.totalProducts) * 100)
}

// Threat exposure (industry-scoped critical+high threats; lower = better).
const threatExposureAuto: KpiAutoScoreFn = (data) => {
  const industryCritical = data.industryThreats.filter(
    (t) => t.criticality === 'Critical' || t.criticality === 'High'
  ).length
  // No industry selected → fall back to global critical count, capped gently.
  const n = industryCritical || Math.min(data.criticalThreatCount, 20)
  return clamp(100 - n * 10)
}

// Compliance gaps closed (proxy: share of selected frameworks that require PQC
// AND have a mapped industry). Keep userOverride=true so CISOs can refine.
const complianceGapsAuto: KpiAutoScoreFn = (data) => {
  if (!data.complianceSelections || data.complianceSelections.length === 0) return null
  const selected = data.frameworks.filter((f) => data.complianceSelections.includes(f.id))
  if (selected.length === 0) return null
  const closed = selected.filter((f) => f.requiresPQC).length
  return Math.round((closed / selected.length) * 100)
}

// Pace-to-deadline. Needs `migrationDeadlineYear` + an `algorithmsMigrated`
// user input — so we read the current stored value from the KPI state at
// render time via a thin caller. Here we only return null unless a baseline
// year exists; the component blends this with the user's slider.
const paceToDeadlineAuto: KpiAutoScoreFn = (data) => {
  if (!data.migrationDeadlineYear) return null
  const now = new Date().getFullYear()
  const totalYears = data.migrationDeadlineYear - now
  if (totalYears <= 0) return 100 // deadline reached → assume on-track pressure
  // Without an algorithmsMigrated signal this is indicative only.
  // Component overlays the real "progress vs expected" view.
  return clamp(50)
}

// HNDL time-horizon — higher score = more headroom before HNDL risk peaks.
const hndlHorizonAuto: KpiAutoScoreFn = (data) => {
  const w = data.hndlRiskWindow
  if (!w || typeof w.estimatedQuantumThreatYear !== 'number') return null
  const yearsUntilThreat =
    w.estimatedQuantumThreatYear - (w.currentYear ?? new Date().getFullYear())
  if (yearsUntilThreat <= 0) return 0
  if (yearsUntilThreat >= 15) return 100
  return Math.round((yearsUntilThreat / 15) * 100)
}

// Risk posture (inverted assessment score). Returns null if no assessment.
const riskPostureAuto: KpiAutoScoreFn = (data) => {
  if (data.riskScore === null) return null
  return clamp(100 - data.riskScore)
}

// Hybrid deployment coverage — % of catalog products reporting hybrid PQC.
const hybridCoverageAuto: KpiAutoScoreFn = (data) => {
  if (data.totalProducts === 0) return null
  const hybrid = data.vendorsByLayer ? Array.from(data.vendorsByLayer.values()).flat() : []
  const seen = new Set<string>()
  let hybridCount = 0
  for (const p of hybrid) {
    if (seen.has(p.productId)) continue
    seen.add(p.productId)
    const s = (p.pqcSupport || '').toLowerCase()
    if (s.includes('hybrid')) hybridCount++
  }
  return Math.round((hybridCount / data.totalProducts) * 100)
}

// ── Catalog ──────────────────────────────────────────────────────────────
/**
 * Weight conventions (rationale in plan file):
 *  - Executive: compliance + threat + pace > 50% — board/regulator lens
 *  - Architect: algorithms + vendor/layer readiness > 55% — delivery lens
 *  - Ops:      inventory + vendor + operational KPIs — run-the-system lens
 *  - Researcher: diversity + standards coverage — academic lens
 */
export const KPI_CATALOG: readonly KpiDefinition[] = [
  // ── Coverage / Inventory ──────────────────────────────────────────────
  {
    id: 'systems-inventoried',
    label: 'Systems Inventoried',
    description: 'Percentage of systems scanned for cryptographic usage (CBOM coverage).',
    category: 'coverage',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.1, architect: 0.15, ops: 0.25, researcher: 0.1 },
    userOverride: true,
    mappings: { csf2: 'ID.AM-2', iso27001: 'A.8.1', soc2: 'CC3.2' },
    defaultTarget: 90,
  },
  {
    id: 'cbom-completeness',
    label: 'CBOM Completeness',
    description:
      'Percentage of inventoried systems with a merged SBOM+CBOM (algorithms, key lengths, protocols).',
    category: 'coverage',
    surfaces: ['governance', 'migration'],
    weights: { architect: 0.1, ops: 0.1 },
    userOverride: true,
    mappings: { csf2: 'ID.AM-3', iso27001: 'A.8.8' },
    defaultTarget: 80,
  },

  // ── Progress / Algorithm Migration ────────────────────────────────────
  {
    id: 'algorithms-migrated',
    label: 'Algorithms Migrated',
    description:
      'Percentage of quantum-vulnerable algorithms replaced with PQC or hybrid alternatives.',
    category: 'progress',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.15, architect: 0.3, ops: 0.2, researcher: 0.2 },
    userOverride: true,
    mappings: { csf2: 'PR.DS-2', iso27001: 'A.10.1', soc2: 'CC6.1' },
    defaultTarget: 70,
  },
  {
    id: 'hybrid-deployment',
    label: 'Hybrid Deployment Coverage',
    description:
      'Percentage of catalog products / endpoints running hybrid PQC (e.g. X25519 + ML-KEM).',
    category: 'progress',
    surfaces: ['governance', 'migration'],
    weights: { architect: 0.1, researcher: 0.1 },
    autoScore: hybridCoverageAuto,
    userOverride: true,
    mappings: { csf2: 'PR.DS-2' },
    defaultTarget: 40,
  },

  // ── Vendor / Layer Readiness ──────────────────────────────────────────
  {
    id: 'vendor-readiness',
    label: 'Vendor Readiness',
    description:
      'Tiered PQC-ready share of the product catalog (Full=1.0, Hybrid=0.7, Pilot=0.4, Roadmap=0.2, None=0).',
    category: 'vendor',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.1, architect: 0.2, ops: 0.2, researcher: 0.05 },
    autoScore: vendorReadinessAuto,
    userOverride: true,
    mappings: { csf2: 'ID.SC-1', iso27001: 'A.5.19', soc2: 'CC9.2' },
    defaultTarget: 60,
  },
  {
    id: 'fips-validated',
    label: 'FIPS-Validated Deployment',
    description: 'Percentage of catalog products with FIPS 140-2/3 validation certificates.',
    category: 'vendor',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.05, architect: 0.05, ops: 0.1, researcher: 0.05 },
    autoScore: fipsValidatedAuto,
    userOverride: true,
    mappings: { csf2: 'PR.DS-1', iso27001: 'A.10.1' },
    defaultTarget: 50,
  },

  // ── Compliance ────────────────────────────────────────────────────────
  {
    id: 'compliance-gaps',
    label: 'Compliance Gaps Closed',
    description:
      'Percentage of selected frameworks (FIPS / CMMC / ANSSI / BSI …) whose PQC requirements have been addressed.',
    category: 'compliance',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.2, architect: 0.1, ops: 0.1, researcher: 0.05 },
    autoScore: complianceGapsAuto,
    userOverride: true,
    disabledReason: 'Select compliance frameworks in the assessment to enable auto-scoring.',
    mappings: { csf2: 'GV.OC-3', iso27001: 'A.5.36', soc2: 'CC2.2' },
    defaultTarget: 75,
  },
  {
    id: 'pace-to-deadline',
    label: 'Pace-to-Deadline',
    description:
      'Are you on track to meet your country/industry PQC migration deadline? (50 = on track, >50 = ahead)',
    category: 'compliance',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.15, architect: 0.1, ops: 0.05 },
    autoScore: paceToDeadlineAuto,
    userOverride: true,
    disabledReason:
      'Select a country with a mandatory PQC deadline in the assessment to enable pacing.',
    mappings: { csf2: 'GV.OC-5' },
    defaultTarget: 50,
  },

  // ── Risk / Threat ─────────────────────────────────────────────────────
  {
    id: 'threat-exposure',
    label: 'Threat Exposure',
    description: 'Inverse of critical + high industry-scoped threats (higher = lower exposure).',
    category: 'risk',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.15, architect: 0.05, ops: 0.05 },
    autoScore: threatExposureAuto,
    userOverride: true,
    mappings: { csf2: 'ID.RA-1', iso27001: 'A.5.7' },
    defaultTarget: 60,
  },
  {
    id: 'hndl-horizon',
    label: 'HNDL Time Horizon',
    description:
      'Years of headroom before CRQC-era harvest-now-decrypt-later risk peaks (higher = more headroom).',
    category: 'risk',
    surfaces: ['governance'],
    weights: { executive: 0.1 },
    autoScore: hndlHorizonAuto,
    userOverride: false,
    disabledReason: 'Complete the risk assessment to compute HNDL horizon.',
    mappings: { csf2: 'ID.RA-5' },
    defaultTarget: 50,
  },
  {
    id: 'risk-posture',
    label: 'Risk Posture',
    description: 'Inverse of your assessment risk score (higher = lower risk).',
    category: 'risk',
    surfaces: ['migration'],
    weights: { executive: 0.05, architect: 0.05, ops: 0.05, researcher: 0.05 },
    autoScore: riskPostureAuto,
    userOverride: true,
    disabledReason: 'Complete the risk assessment at /assess to unlock this KPI.',
    mappings: { csf2: 'ID.RA-4' },
    defaultTarget: 60,
  },

  // ── Operational (ops-facing) ──────────────────────────────────────────
  {
    id: 'change-failure-rate',
    label: 'Change Failure Rate',
    description:
      'Percentage of PQC-related deployments that required rollback or hotfix (lower raw number = higher KPI).',
    category: 'operational',
    surfaces: ['migration'],
    weights: { ops: 0.1 },
    userOverride: true,
    mappings: { csf2: 'PR.IP-3', iso27001: 'A.8.32' },
    defaultTarget: 90,
  },
  {
    id: 'canary-coverage',
    label: 'Canary / Phased Rollout Coverage',
    description: 'Percentage of PQC rollouts using canary or blue-green deployment.',
    category: 'operational',
    surfaces: ['migration'],
    weights: { ops: 0.05 },
    userOverride: true,
    mappings: { csf2: 'PR.IP-3' },
    defaultTarget: 70,
  },

  // ── Training & Financial ──────────────────────────────────────────────
  {
    id: 'training-completion',
    label: 'Training Completion',
    description:
      'Percentage of relevant staff who have completed PQC awareness and technical training.',
    category: 'operational',
    surfaces: ['governance'],
    weights: { executive: 0.05, architect: 0.05, ops: 0.05 },
    userOverride: true,
    mappings: { csf2: 'PR.AT-1', iso27001: 'A.6.3', soc2: 'CC1.4' },
    defaultTarget: 80,
  },
  {
    id: 'budget-utilization',
    label: 'Budget Utilization',
    description:
      'Percentage of allocated PQC migration budget spent on plan (healthy range: 70–90%).',
    category: 'financial',
    surfaces: ['governance', 'migration'],
    weights: { executive: 0.1, architect: 0.05, ops: 0.05 },
    userOverride: true,
    mappings: { soc2: 'CC9.1' },
    defaultTarget: 80,
  },

  // ── Research-facing ───────────────────────────────────────────────────
  {
    id: 'algorithm-diversity',
    label: 'Algorithm Diversity',
    description:
      'Breadth of PQC algorithms exercised (ML-KEM, ML-DSA, SLH-DSA, Falcon, HQC, LMS …).',
    category: 'research',
    surfaces: ['governance', 'migration'],
    weights: { researcher: 0.2 },
    userOverride: true,
    defaultTarget: 60,
  },
  {
    id: 'standards-coverage',
    label: 'Standards Coverage',
    description:
      'Percentage of NIST FIPS 203/204/205 (and ratified drafts) exercised or implemented.',
    category: 'research',
    surfaces: ['governance', 'migration'],
    weights: { researcher: 0.2 },
    userOverride: true,
    defaultTarget: 75,
  },
] as const

// ── Selectors ────────────────────────────────────────────────────────────

/**
 * Return the KPIs that apply to a given persona on a given surface, in the
 * order they appear in the catalog.
 */
export function getKpiSet(persona: KpiPersonaId, surface: KpiSurface): KpiDefinition[] {
  return KPI_CATALOG.filter((k) => k.surfaces.includes(surface) && k.weights[persona] !== undefined)
}

/**
 * Sum of weights for a (persona, surface) set. Used for informational display
 * and to normalise when the user edits weights.
 */
export function getWeightSum(kpis: KpiDefinition[], persona: KpiPersonaId): number {
  let s = 0
  for (const k of kpis) s += k.weights[persona] ?? 0
  return s
}

/**
 * Build ready-to-render `ScorecardDimension[]` for a (persona, surface) pair,
 * invoking every `autoScore` function against the provided execData and
 * looking up per-persona × per-country targets.
 *
 * Returned rows are shaped for `DataDrivenScorecard`.
 */
export function buildDimensions(
  persona: KpiPersonaId,
  surface: KpiSurface,
  data: ExecutiveModuleData,
  country?: string | null
): ScorecardDimension[] {
  const kpis = getKpiSet(persona, surface)
  // Normalise raw weights so the scorecard sees weights summing to 1.0 even
  // when per-persona catalog weights were tuned for clarity over perfect
  // normalisation. Relative importance between KPIs is preserved.
  const rawSum = getWeightSum(kpis, persona) || 1
  return kpis.map((k) => {
    const rawWeight = k.weights[persona] ?? 0
    const weight = rawWeight / rawSum
    const auto = k.autoScore ? k.autoScore(data) : undefined
    const disabled = k.autoScore !== undefined && auto === null
    const target = getKpiTarget(persona, country, k.id, k.defaultTarget)
    return {
      id: k.id,
      label: k.label,
      description: k.description,
      weight,
      autoScore: auto ?? 0,
      userOverride: k.userOverride ?? true,
      disabled,
      disabledReason: disabled ? k.disabledReason : undefined,
      target,
      targetLabel: target !== undefined ? `Target: ${target}` : undefined,
      disabledActionHref: disabled && k.id.startsWith('risk') ? '/assess' : undefined,
      disabledActionLabel: disabled ? 'Complete assessment →' : undefined,
    }
  })
}
