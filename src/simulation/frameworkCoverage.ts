// SPDX-License-Identifier: GPL-3.0-only
/**
 * frameworkCoverage — the explicit, source-anchored map of what the Simulation
 * actually teaches for every framework maturity cell, and what it does not.
 *
 * Why this file exists: the runtime trees only materialise a band when an
 * activity happens to be assigned to it, and `achievedTreeLevel` skips absent
 * bands rather than failing them. A phase whose ladder stops at L2 therefore
 * looked "complete" at L2. Coverage has to be stated against the SOURCE ladder,
 * not against whatever the trees happen to contain.
 *
 * Two rules this file enforces:
 *  1. The denominator is the source's, not ours. P1–P7 × L1–L4 = 28 required
 *     cells; including P0 = 32. Verification & Closure and Foundations are real
 *     framework content but are NOT numbered phases — they are tracked in
 *     `EXTENSION_COVERAGE` and must never be folded into that denominator to
 *     inflate a coverage ratio.
 *  2. Criterion text is never re-transcribed here. It resolves from
 *     `PHASE_MATURITY`, which already holds the framework's indicator tables
 *     verbatim. `frameworkCoverage.test.ts` asserts every cell resolves, so a
 *     silent divergence between the ladder and this manifest fails the build.
 *
 * Source: Applied Quantum PQC Migration Framework v2.1 (June 2026), Marin Ivezić.
 * Page numbers are the per-phase "Maturity Indicators" tables in
 * `pqctoday-priv/public/library/AQ-PQC-Migration-Framework-v2.1-2026.pdf`.
 */
import type { PhaseId } from '@/data/frameworkPhases'
import { PHASE_MATURITY, type MaturityLevelId } from '@/data/phaseMaturity'

export const FRAMEWORK_SOURCE_VERSION = 'Applied Quantum PQC Migration Framework v2.1 (June 2026)'

/** The framework's numbered phases. P0 is a real numbered phase (Executive
 *  Mandate); the framework's own "seven phases" wording counts P1–P7. */
export type NumberedPhaseId = 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7'

/** Framework content that is NOT a numbered phase: a terminal section and a
 *  cross-cutting one. Counted separately, always. */
export type ExtensionPhaseId = 'verify-close' | 'foundations'

export const NUMBERED_PHASES: NumberedPhaseId[] = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']

/** Assessed maturity bands. L0 ("no activity") is a baseline, never a target. */
export const ASSESSED_LEVELS = [1, 2, 3, 4] as const
export type AssessedLevel = (typeof ASSESSED_LEVELS)[number]

/** P1–P7 × L1–L4. The denominator the framework's own "seven phases" implies. */
export const REQUIRED_CELLS_P1_P7 = 28
/** Including P0 Executive Mandate. */
export const REQUIRED_CELLS_WITH_P0 = 32

/** PDF page of each phase chapter's "Maturity Indicators" table (1-indexed). */
export const MATURITY_INDICATOR_PAGE: Record<NumberedPhaseId, number> = {
  p0: 38,
  p1: 59,
  p2: 70,
  p3: 81,
  p4: 94,
  p5: 115,
  p6: 128,
  p7: 140,
}

/**
 * How well the simulation lets a learner EARN this cell.
 *  - `unsupported`  — no runtime band exists; the cell cannot be practised at all.
 *  - `proxy`        — a band exists, but it clears on learning/artifact-presence
 *                     proxies rather than on the outcome the criterion describes.
 *  - `outcome`      — clearing the band requires evidence of the criterion's own
 *                     outcome (measurement, recurrence, or a scenario change).
 * Nothing here is a claim about a real organisation; it describes the exercise.
 */
export type CoverageStatus = 'unsupported' | 'proxy' | 'outcome'

export interface FrameworkCoverageCell {
  phase: NumberedPhaseId | ExtensionPhaseId
  level: AssessedLevel
  /** Resolved from PHASE_MATURITY — never duplicated here. */
  criterion: string
  sourcePage: number
  sourceVersion: string
  /** Framework-numbered activities backing this cell in the runtime tree today.
   *  Source ids verbatim ('1.4–1.5' included); empty when unsupported. */
  activityIds: string[]
  /** Simulator-authored task ids that are NOT framework activities. Recurrence
   *  and change-driven work are outcomes of EXISTING activities in the source,
   *  so representing them must never mint activities like "3.5"/"3.6". */
  adaptedTaskIds: string[]
  /** What a learner must actually do/produce for this cell to be earned. */
  evidence: string
  status: CoverageStatus
  /** Why the status is what it is, when that is not self-evident. */
  note?: string
}

const cell = (
  phase: NumberedPhaseId,
  level: AssessedLevel,
  spec: Omit<
    FrameworkCoverageCell,
    'phase' | 'level' | 'criterion' | 'sourcePage' | 'sourceVersion'
  >
): FrameworkCoverageCell => {
  const criterion = PHASE_MATURITY[phase]?.find((m) => m.level === level)?.indicator
  if (!criterion)
    throw new Error(`frameworkCoverage: no PHASE_MATURITY indicator for ${phase}/L${level}`)
  return {
    phase,
    level,
    criterion,
    sourcePage: MATURITY_INDICATOR_PAGE[phase],
    sourceVersion: FRAMEWORK_SOURCE_VERSION,
    ...spec,
  }
}

/** The 32 required numbered-phase cells. Order: phase, then level. */
export const FRAMEWORK_COVERAGE: FrameworkCoverageCell[] = [
  // ── P0 Executive Mandate ────────────────────────────────────────────────
  cell('p0', 1, {
    activityIds: ['0.1'],
    adaptedTaskIds: [],
    evidence:
      'Frame the business case: read the threat and cost material, then commit to a position.',
    status: 'proxy',
    note: 'Clears on learning completion, not on an argued business case.',
  }),
  cell('p0', 2, {
    activityIds: ['0.2', '0.3', '0.4'],
    adaptedTaskIds: [],
    evidence: 'Produce a program charter naming the QRPM and a Year-1 budget structure.',
    status: 'proxy',
    note: 'Artifact presence clears the band; the charter content is not assessed.',
  }),
  cell('p0', 3, {
    activityIds: ['0.5'],
    adaptedTaskIds: [],
    evidence:
      'Complete an initial scoping assessment and commit multi-year funding with a standing SteerCo.',
    status: 'proxy',
  }),
  cell('p0', 4, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Advance a scenario reporting period; reconcile charter/funding with an enterprise-risk entry and a board update, recording owner, review date, decision, and follow-up.',
    status: 'unsupported',
    note: 'Recurring board reporting and enterprise-risk integration have no runtime band.',
  }),

  // ── P1 Discovery & Inventory ────────────────────────────────────────────
  cell('p1', 1, {
    activityIds: ['1.0'],
    adaptedTaskIds: [],
    evidence: 'Decide what to inventory first on a risk-driven basis.',
    status: 'proxy',
  }),
  cell('p1', 2, {
    activityIds: ['1.1', '1.2', '1.3', '1.4–1.5'],
    adaptedTaskIds: [],
    evidence:
      'Stand up the three inventory tracks and layered discovery; produce a queryable inventory covering Priority-A systems.',
    status: 'proxy',
    note: 'The ≥70% Tier-1 coverage figure in the criterion is not measured by the exercise.',
  }),
  cell('p1', 3, {
    activityIds: ['1.6'],
    adaptedTaskIds: [],
    evidence: 'Establish continuous discovery integrated with change management.',
    status: 'proxy',
    note: 'The ≥90% coverage figure in the criterion is not measured by the exercise.',
  }),
  cell('p1', 4, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Inject an asset/configuration change; identify discovery drift, update the inventory, and calculate known coverage and remaining gaps.',
    status: 'unsupported',
    note: 'Real-time posture, drift detection and measured gap reduction have no runtime band.',
  }),

  // ── P2 CBOM ─────────────────────────────────────────────────────────────
  cell('p2', 1, {
    activityIds: ['2.1'],
    adaptedTaskIds: [],
    evidence: 'Select a CBOM format and tooling.',
    status: 'proxy',
  }),
  cell('p2', 2, {
    activityIds: ['2.2'],
    adaptedTaskIds: [],
    evidence: 'Populate a CycloneDX CBOM from inventory data and link it to the SBOM.',
    status: 'proxy',
  }),
  cell('p2', 3, {
    activityIds: ['2.3', '2.4–2.5'],
    adaptedTaskIds: [],
    evidence: 'Integrate the CBOM into operational processes with enforced freshness governance.',
    status: 'proxy',
  }),
  cell('p2', 4, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Inject a deployment/vendor update; update the linked CBOM, report freshness, and flag unresolved supplier evidence.',
    status: 'unsupported',
    note: 'Deployment-driven updates, vendor gap management and compliance reporting have no runtime band.',
  }),

  // ── P3 Risk Scoring ─────────────────────────────────────────────────────
  cell('p3', 1, {
    activityIds: ['3.1'],
    adaptedTaskIds: [],
    evidence: 'Define a risk scoring model across the framework’s four dimensions.',
    status: 'proxy',
  }),
  cell('p3', 2, {
    activityIds: ['3.2', '3.3', '3.4'],
    adaptedTaskIds: [],
    evidence: 'Score and sequence Tier-1 entries and produce the QRA with a prioritised backlog.',
    status: 'proxy',
  }),
  cell('p3', 3, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Refresh the QRA after a quarter using expanded inventory and legal/retention inputs, and explain what changed in the priorities.',
    status: 'unsupported',
    note: 'Recurrence is an OUTCOME of activity 3.4 over time, not a new numbered activity. Do not mint "3.5".',
  }),
  cell('p3', 4, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Inject an event that changes exposure or applicability; rescore affected assets and propagate the change into enterprise risk and review evidence.',
    status: 'unsupported',
    note: 'Event-driven rescoring is an OUTCOME of activities 3.2–3.4. Do not mint "3.6".',
  }),

  // ── P4 Roadmap & Governance ─────────────────────────────────────────────
  cell('p4', 1, {
    activityIds: ['4.1'],
    adaptedTaskIds: [],
    evidence: 'Define the Year-1 starter plan.',
    status: 'proxy',
  }),
  cell('p4', 2, {
    activityIds: ['4.2', '4.3', '4.4'],
    adaptedTaskIds: [],
    evidence: 'Approve a resourced multi-year roadmap with a PMO structure and KPI baseline.',
    status: 'proxy',
  }),
  cell('p4', 3, {
    activityIds: ['4.5–4.6'],
    adaptedTaskIds: [],
    evidence:
      'Run the roadmap as a living instrument with milestone gates and maintained dependencies.',
    status: 'proxy',
  }),
  cell('p4', 4, {
    activityIds: ['4.7'],
    adaptedTaskIds: [],
    evidence:
      'Exercise a roadmap contingency trigger; show changed dependencies, resources, milestones, and approved rationale.',
    status: 'proxy',
    note: 'A band exists but is cleared by pre-drafting the accelerated-execution-profile artifact; the criterion requires triggers DEFINED AND TESTED.',
  }),

  // ── P5 Pilots & Migration ───────────────────────────────────────────────
  cell('p5', 1, {
    activityIds: ['5.1', '5.2'],
    adaptedTaskIds: [],
    evidence: 'Select pilot targets and design hybrid deployments.',
    status: 'proxy',
  }),
  cell('p5', 2, {
    activityIds: ['5.3'],
    adaptedTaskIds: [],
    evidence: 'Execute pilots with measurement and a tested rollback procedure.',
    status: 'proxy',
    note: 'Rollback is described, not exercised.',
  }),
  cell('p5', 3, {
    activityIds: ['5.4', '5.5–5.6'],
    adaptedTaskIds: [],
    evidence: 'Scale through waves with defense-in-depth and a data-at-rest strategy.',
    status: 'proxy',
  }),
  cell('p5', 4, {
    activityIds: ['5.7'],
    adaptedTaskIds: [],
    evidence:
      'Use measured pilot/rollout fixtures and an algorithm-swap exercise; evaluate rollback, interoperability, and coverage rather than document creation.',
    status: 'proxy',
    note: 'A band exists but is cleared by the AI-assisted-migration activity; the criterion requires estate-wide deployment and a demonstrated algorithm-swap drill.',
  }),

  // ── P6 Infrastructure & Performance ─────────────────────────────────────
  cell('p6', 1, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Identify affected PKI/HSM/network components and explain their infrastructure constraints before entering advanced work.',
    status: 'unsupported',
    note: 'The tree opens at L2, so a learner cannot practise initial infrastructure awareness.',
  }),
  cell('p6', 2, {
    activityIds: ['6.1', '6.2', '6.3'],
    adaptedTaskIds: [],
    evidence:
      'Inventory HSMs with PQC status, draft PKI modernization, and assess the network path.',
    status: 'proxy',
  }),
  cell('p6', 3, {
    activityIds: ['6.4', '6.5'],
    adaptedTaskIds: [],
    evidence:
      'Establish a performance-testing methodology and capacity plan with Tier-1 baselines.',
    status: 'proxy',
  }),
  cell('p6', 4, {
    activityIds: [],
    adaptedTaskIds: [],
    evidence:
      'Compare load/capacity evidence against thresholds; inject monitoring drift and require a corrective action and remeasurement.',
    status: 'unsupported',
    note: 'Production-scale capacity validation and continuous monitoring have no runtime band.',
  }),

  // ── P7 Vendor & Supply Chain ────────────────────────────────────────────
  cell('p7', 1, {
    activityIds: ['7.1'],
    adaptedTaskIds: [],
    evidence: 'Classify the vendor portfolio by PQC impact.',
    status: 'proxy',
  }),
  cell('p7', 2, {
    activityIds: ['7.2'],
    adaptedTaskIds: [],
    evidence: 'Execute vendor engagement and track responses against a criticality classification.',
    status: 'proxy',
  }),
  cell('p7', 3, {
    activityIds: ['7.3', '7.4', '7.5', '7.6'],
    adaptedTaskIds: [],
    evidence:
      'Insert PQC procurement requirements, deploy bridging patterns for blocked systems, and report a vendor scorecard.',
    status: 'proxy',
  }),
  cell('p7', 4, {
    activityIds: ['7.7'],
    adaptedTaskIds: [],
    evidence:
      'Evaluate supplier delivery evidence, unresolved bridges, open-source dependencies, and the next recurring governance review.',
    status: 'proxy',
    note: 'A band exists but is cleared by the cloud shared-responsibility activity; the criterion requires VERIFIED delivery and bridges eliminated.',
  }),
]

/**
 * Framework content outside the numbered ladder. Real, taught, and gated — but
 * deliberately kept out of `FRAMEWORK_COVERAGE` so it can never pad the 28/32
 * denominator. Neither section has a per-phase L0–L4 indicator table in the
 * source, so their L1–L4 bands are simulator adaptations built on the section's
 * own prose (closure criteria + Outputs table for verify-close; the five
 * spanning capabilities for foundations).
 */
export interface ExtensionCoverage {
  phase: ExtensionPhaseId
  /** Pages of the source section this is built from. */
  sourcePages: number[]
  /** Why this is not a numbered-phase cell. */
  basis: string
  evidence: string
  status: CoverageStatus
  note?: string
}

export const EXTENSION_COVERAGE: ExtensionCoverage[] = [
  {
    phase: 'verify-close',
    sourcePages: [141, 142, 143, 144, 145],
    basis:
      'Section "Migration Verification & Program Closure". No L0–L4 indicator table in the source; VC.1–VC.4 are simulator bands derived from the closure criteria and the Outputs quality criteria.',
    evidence:
      'Assemble traceable verification results and unresolved exceptions; require review and closure conditions that are distinct from possessing a dossier.',
    status: 'proxy',
    note: 'The source’s own Common Failure is "Declared done" — closing on milestone completion rather than verification evidence. Artifact presence currently clears the band, which is that failure mode.',
  },
  {
    phase: 'foundations',
    sourcePages: [146, 147],
    basis:
      'Section "Program Foundations: Capabilities That Span Every Phase" — five capabilities (maturity model, metrics/KPIs, crypto-agility, regulatory/standards alignment, skills/team). Page 147 carries the ORG-WIDE 0–5 maturity scale and seven-domain assessment, which is a different scale from the per-phase L0–L4 indicators and must not be conflated with them.',
    evidence:
      'Apply agility, skills, KPIs, and regulatory mapping across scenario changes rather than treating them as one-time reading.',
    status: 'proxy',
  },
]

/** Cells a learner cannot practise at all today. */
export const unsupportedCells = (): FrameworkCoverageCell[] =>
  FRAMEWORK_COVERAGE.filter((c) => c.status === 'unsupported')

/** Look up one cell. */
export const coverageFor = (
  phase: NumberedPhaseId,
  level: AssessedLevel
): FrameworkCoverageCell | undefined =>
  FRAMEWORK_COVERAGE.find((c) => c.phase === phase && c.level === level)

/** Coverage counted honestly: supported / total, never padded with extensions. */
export const coverageSummary = () => {
  const numbered = FRAMEWORK_COVERAGE
  const p1p7 = numbered.filter((c) => c.phase !== 'p0')
  const count = (cells: FrameworkCoverageCell[], s: CoverageStatus) =>
    cells.filter((c) => c.status === s).length
  return {
    requiredWithP0: REQUIRED_CELLS_WITH_P0,
    requiredP1P7: REQUIRED_CELLS_P1_P7,
    presentWithP0: numbered.length - count(numbered, 'unsupported'),
    presentP1P7: p1p7.length - count(p1p7, 'unsupported'),
    outcomeBacked: count(numbered, 'outcome'),
    proxyBacked: count(numbered, 'proxy'),
    unsupported: count(numbered, 'unsupported'),
  }
}

/** True while any required cell lacks an outcome-backed evidence path. Full
 *  framework maturity must not be advertised while this is true. */
export const hasCompleteCoverage = (): boolean =>
  FRAMEWORK_COVERAGE.every((c) => c.status === 'outcome')

export type { PhaseId, MaturityLevelId }
