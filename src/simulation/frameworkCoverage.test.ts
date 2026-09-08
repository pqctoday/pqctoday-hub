// SPDX-License-Identifier: GPL-3.0-only
/**
 * W0 acceptance — the coverage manifest is complete, source-anchored, and
 * counted honestly.
 *
 * The defect this guards: coverage used to be implied by whatever bands the
 * generator happened to emit, so a phase whose ladder stopped early looked
 * complete. These tests assert the manifest states the SOURCE's ladder, that
 * every cell carries provenance, and that the extensions can never be folded
 * into the numbered-phase denominator to inflate a ratio.
 */
import { describe, it, expect } from 'vitest'
import {
  FRAMEWORK_COVERAGE,
  EXTENSION_COVERAGE,
  NUMBERED_PHASES,
  ASSESSED_LEVELS,
  REQUIRED_CELLS_P1_P7,
  REQUIRED_CELLS_WITH_P0,
  MATURITY_INDICATOR_PAGE,
  FRAMEWORK_SOURCE_VERSION,
  coverageFor,
  coverageSummary,
  unsupportedCells,
  hasCompleteCoverage,
} from './frameworkCoverage'
import { PHASE_MATURITY } from '@/data/phaseMaturity'
import { SIM_TREES } from './index'

describe('frameworkCoverage — the manifest', () => {
  it('has exactly the 32 required numbered-phase cells, one per phase × level', () => {
    expect(FRAMEWORK_COVERAGE).toHaveLength(REQUIRED_CELLS_WITH_P0)
    expect(REQUIRED_CELLS_WITH_P0).toBe(32)
    expect(REQUIRED_CELLS_P1_P7).toBe(28)

    for (const phase of NUMBERED_PHASES) {
      for (const level of ASSESSED_LEVELS) {
        expect(coverageFor(phase, level), `missing cell ${phase}/L${level}`).toBeDefined()
      }
    }
    // no duplicates
    const keys = FRAMEWORK_COVERAGE.map((c) => `${c.phase}/L${c.level}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('every cell carries a source version, a real page, and a coverage state', () => {
    for (const c of FRAMEWORK_COVERAGE) {
      const where = `${c.phase}/L${c.level}`
      expect(c.sourceVersion, where).toBe(FRAMEWORK_SOURCE_VERSION)
      expect(c.sourcePage, where).toBe(
        MATURITY_INDICATOR_PAGE[c.phase as keyof typeof MATURITY_INDICATOR_PAGE]
      )
      expect(c.sourcePage, where).toBeGreaterThan(0)
      expect(['unsupported', 'proxy', 'outcome'], where).toContain(c.status)
      expect(c.evidence.length, `${where} has no evidence requirement`).toBeGreaterThan(20)
    }
  })

  it('criterion text resolves from the framework ladder, never re-transcribed', () => {
    for (const c of FRAMEWORK_COVERAGE) {
      const fromLadder = PHASE_MATURITY[c.phase as keyof typeof PHASE_MATURITY]?.find(
        (m) => m.level === c.level
      )?.indicator
      expect(fromLadder, `${c.phase}/L${c.level} not in PHASE_MATURITY`).toBeDefined()
      expect(c.criterion).toBe(fromLadder)
    }
  })

  it('declared status matches what the runtime trees actually ship', () => {
    // The manifest must not claim a cell is practisable when no band exists,
    // nor claim one is missing when the generator emits it. This is what makes
    // the manifest fail loudly if a band is added without updating coverage.
    for (const c of FRAMEWORK_COVERAGE) {
      const tree = SIM_TREES[c.phase as keyof typeof SIM_TREES]
      const bandExists = !!tree?.levels.some((b) => b.level === c.level)
      const where = `${c.phase}/L${c.level}`
      if (c.status === 'unsupported') {
        expect(bandExists, `${where} is marked unsupported but a runtime band exists`).toBe(false)
        expect(c.activityIds, where).toHaveLength(0)
      } else {
        expect(bandExists, `${where} is marked ${c.status} but no runtime band exists`).toBe(true)
      }
    }
  })

  it('activity ids on supported cells match the runtime band, verbatim', () => {
    for (const c of FRAMEWORK_COVERAGE) {
      if (c.status === 'unsupported') continue
      const tree = SIM_TREES[c.phase as keyof typeof SIM_TREES]
      const band = tree?.levels.find((b) => b.level === c.level)
      expect(band, `${c.phase}/L${c.level}`).toBeDefined()
      expect(band!.activities.map((a) => a.id)).toEqual(c.activityIds)
    }
  })

  it('never mints a framework activity id that the source does not define', () => {
    // The framework defines 3.1-3.4 and 6.1-6.5 only. Representing recurrence
    // must use adaptedTaskIds, never a fabricated "3.5"/"3.6"/"6.6".
    const forbidden = ['3.5', '3.6', '6.6', '0.6', '1.7', '2.6']
    for (const c of FRAMEWORK_COVERAGE) {
      for (const id of c.activityIds) {
        expect(forbidden, `${c.phase}/L${c.level} mints ${id}`).not.toContain(id)
      }
      // adaptations must be visibly distinct from source numbering
      for (const id of c.adaptedTaskIds) {
        expect(id, `adaptation ${id} looks like a framework activity id`).not.toMatch(/^\d+\.\d+$/)
      }
    }
  })

  it('extensions are tracked separately and can never pad the denominator', () => {
    const extPhases = EXTENSION_COVERAGE.map((e) => e.phase).sort()
    expect(extPhases).toEqual(['foundations', 'verify-close'])
    // the numbered manifest must contain neither
    for (const c of FRAMEWORK_COVERAGE) {
      expect(['verify-close', 'foundations']).not.toContain(c.phase)
    }
    // and both carry their basis + source pages
    for (const e of EXTENSION_COVERAGE) {
      expect(e.sourcePages.length).toBeGreaterThan(0)
      expect(e.basis.length).toBeGreaterThan(40)
    }
  })

  it('reports the seven audited gaps as unsupported', () => {
    const gaps = unsupportedCells()
      .map((c) => `${c.phase}/L${c.level}`)
      .sort()
    expect(gaps).toEqual(['p0/L4', 'p1/L4', 'p2/L4', 'p3/L3', 'p3/L4', 'p6/L1', 'p6/L4'])
  })

  it('counts coverage against the source denominator, not its own ladder', () => {
    const s = coverageSummary()
    expect(s.requiredWithP0).toBe(32)
    expect(s.requiredP1P7).toBe(28)
    expect(s.presentWithP0).toBe(25)
    expect(s.presentP1P7).toBe(22)
    expect(s.unsupported).toBe(7)
    expect(s.proxyBacked + s.outcomeBacked + s.unsupported).toBe(32)
  })

  it('does not advertise full coverage while any cell lacks an outcome path', () => {
    expect(hasCompleteCoverage()).toBe(false)
  })
})
