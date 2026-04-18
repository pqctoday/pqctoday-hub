// SPDX-License-Identifier: GPL-3.0-only
import { describe, it, expect } from 'vitest'
import {
  KPI_CATALOG,
  KPI_PERSONAS,
  buildDimensions,
  getKpiSet,
  getWeightSum,
  pqcReadinessTier,
} from './kpiCatalog'
import { getKpiTarget } from './kpiTargets'
import type { ExecutiveModuleData } from '@/hooks/useExecutiveModuleData'

// ── pqcReadinessTier ───────────────────────────────────────────────────────

describe('pqcReadinessTier', () => {
  it('returns 1.0 for "Yes (ML-KEM production)" narrative strings', () => {
    expect(pqcReadinessTier('Yes (ML-KEM production)')).toBe(1.0)
    expect(pqcReadinessTier('yes')).toBe(1.0)
  })

  it('returns 0.7 for hybrid/partial strings', () => {
    expect(pqcReadinessTier('Partial (ML-KEM only)')).toBe(0.7)
    expect(pqcReadinessTier('Hybrid X25519+ML-KEM')).toBe(0.7)
  })

  it('returns 0.2 for planned / roadmap / announced', () => {
    expect(pqcReadinessTier('Planned (Dilithium 2026)')).toBe(0.2)
    expect(pqcReadinessTier('Roadmap')).toBe(0.2)
    expect(pqcReadinessTier('Announced')).toBe(0.2)
  })

  it('returns 0 for None / No / empty', () => {
    expect(pqcReadinessTier('None')).toBe(0)
    expect(pqcReadinessTier('No')).toBe(0)
    expect(pqcReadinessTier('')).toBe(0)
    expect(pqcReadinessTier(null)).toBe(0)
    expect(pqcReadinessTier(undefined)).toBe(0)
  })

  it('returns a conservative middle (0.3) for narrative non-match', () => {
    expect(pqcReadinessTier('Credential')).toBe(0.3)
    expect(pqcReadinessTier('Identity')).toBe(0.3)
  })
})

// ── Catalog integrity ─────────────────────────────────────────────────────

describe('KPI_CATALOG integrity', () => {
  it('has unique KPI ids', () => {
    const ids = KPI_CATALOG.map((k) => k.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every personaed weight is a number between 0 and 1', () => {
    for (const k of KPI_CATALOG) {
      for (const p of KPI_PERSONAS) {
        const w = k.weights[p]
        if (w === undefined) continue
        expect(w).toBeGreaterThanOrEqual(0)
        expect(w).toBeLessThanOrEqual(1)
      }
    }
  })

  // Catalog weights encode RELATIVE importance; `buildDimensions` normalises
  // so the scorecard always sees weights summing to 1.0. We only assert that
  // every persona has some coverage on each surface.
  it('each persona has a positive weight budget on governance surface', () => {
    for (const p of KPI_PERSONAS) {
      const kpis = getKpiSet(p, 'governance')
      expect(kpis.length).toBeGreaterThan(0)
      expect(getWeightSum(kpis, p)).toBeGreaterThan(0.5)
    }
  })

  it('each persona has a positive weight budget on migration surface', () => {
    for (const p of KPI_PERSONAS) {
      const kpis = getKpiSet(p, 'migration')
      expect(kpis.length).toBeGreaterThan(0)
      expect(getWeightSum(kpis, p)).toBeGreaterThan(0.5)
    }
  })

  it('buildDimensions normalises weights to sum 1.0 for each persona/surface', () => {
    const mockExec: ExecutiveModuleData = {
      threatsByIndustry: new Map(),
      criticalThreatCount: 0,
      totalThreatCount: 0,
      industryThreats: [],
      vendorsByLayer: new Map(),
      fipsValidatedCount: 0,
      pqcReadyCount: 0,
      vendorReadinessWeighted: 0,
      totalProducts: 1,
      frameworks: [],
      frameworksByIndustry: [],
      countryDeadlines: [],
      userCountryData: null,
      assessmentResult: null,
      riskScore: null,
      industry: '',
      country: '',
      complianceSelections: [],
      preBoostScore: null,
      boosts: [],
      hndlRiskWindow: null,
      hnflRiskWindow: null,
      categoryScores: null,
      categoryDrivers: null,
      migrationEffort: [],
      algorithmMigrations: [],
      keyFindings: [],
      assessmentProfile: null,
      isAssessmentComplete: false,
      migrationDeadlineYear: null,
    }
    for (const p of KPI_PERSONAS) {
      for (const s of ['governance', 'migration'] as const) {
        const dims = buildDimensions(p, s, mockExec)
        const sum = dims.reduce((acc, d) => acc + d.weight, 0)
        expect(sum).toBeGreaterThan(0.99)
        expect(sum).toBeLessThan(1.01)
      }
    }
  })

  it('every surface listed on a KPI is a valid surface', () => {
    for (const k of KPI_CATALOG) {
      for (const s of k.surfaces) {
        expect(['governance', 'migration']).toContain(s)
      }
    }
  })
})

// ── getKpiSet / persona filtering ─────────────────────────────────────────

describe('getKpiSet', () => {
  it('executive governance set includes compliance + threat + HNDL', () => {
    const ids = getKpiSet('executive', 'governance').map((k) => k.id)
    expect(ids).toContain('compliance-gaps')
    expect(ids).toContain('threat-exposure')
    expect(ids).toContain('hndl-horizon')
  })

  it('ops set includes change-failure-rate and canary-coverage on migration', () => {
    const ids = getKpiSet('ops', 'migration').map((k) => k.id)
    expect(ids).toContain('change-failure-rate')
    expect(ids).toContain('canary-coverage')
  })

  it('researcher set includes algorithm-diversity + standards-coverage', () => {
    const ids = getKpiSet('researcher', 'governance').map((k) => k.id)
    expect(ids).toContain('algorithm-diversity')
    expect(ids).toContain('standards-coverage')
  })

  it('developer / curious get an empty set (nav-blocked)', () => {
    // @ts-expect-error — ensure the type rules out these personas
    expect(getKpiSet('developer', 'governance')).toEqual([])
  })
})

// ── Targets ────────────────────────────────────────────────────────────────

describe('getKpiTarget', () => {
  it('returns country-specific target when set', () => {
    expect(getKpiTarget('executive', 'United States', 'algorithms-migrated')).toBe(80)
  })

  it('falls back to persona-wildcard when country has no override', () => {
    expect(getKpiTarget('ops', 'Zimbabwe', 'systems-inventoried')).toBe(95)
  })

  it('falls back to the provided default when neither exists', () => {
    expect(getKpiTarget('researcher', null, 'unknown-kpi', 42)).toBe(42)
  })
})

// ── buildDimensions ────────────────────────────────────────────────────────

function mockData(overrides: Partial<ExecutiveModuleData> = {}): ExecutiveModuleData {
  return {
    threatsByIndustry: new Map(),
    criticalThreatCount: 3,
    totalThreatCount: 10,
    industryThreats: [],
    vendorsByLayer: new Map(),
    fipsValidatedCount: 5,
    pqcReadyCount: 7,
    vendorReadinessWeighted: 0.5,
    totalProducts: 10,
    frameworks: [],
    frameworksByIndustry: [],
    countryDeadlines: [],
    userCountryData: null,
    assessmentResult: null,
    riskScore: null,
    industry: '',
    country: '',
    complianceSelections: [],
    preBoostScore: null,
    boosts: [],
    hndlRiskWindow: null,
    hnflRiskWindow: null,
    categoryScores: null,
    categoryDrivers: null,
    migrationEffort: [],
    algorithmMigrations: [],
    keyFindings: [],
    assessmentProfile: null,
    isAssessmentComplete: false,
    migrationDeadlineYear: null,
    ...overrides,
  }
}

describe('buildDimensions', () => {
  it('marks HNDL horizon disabled when no assessment', () => {
    const dims = buildDimensions('executive', 'governance', mockData())
    const hndl = dims.find((d) => d.id === 'hndl-horizon')
    expect(hndl?.disabled).toBe(true)
    expect(hndl?.disabledReason).toBeDefined()
  })

  it('computes vendor-readiness auto-score from vendorReadinessWeighted', () => {
    const dims = buildDimensions(
      'architect',
      'governance',
      mockData({ vendorReadinessWeighted: 0.5, totalProducts: 10 })
    )
    const vr = dims.find((d) => d.id === 'vendor-readiness')
    expect(vr?.autoScore).toBe(50)
    expect(vr?.disabled).toBe(false)
  })

  it('disables vendor-readiness when totalProducts is zero', () => {
    const dims = buildDimensions('architect', 'governance', mockData({ totalProducts: 0 }))
    const vr = dims.find((d) => d.id === 'vendor-readiness')
    expect(vr?.disabled).toBe(true)
  })

  it('computes compliance-gaps auto-score from selected frameworks', () => {
    const frameworks = [
      {
        id: 'fips-203',
        label: 'FIPS 203',
        description: '',
        industries: [],
        countries: [],
        requiresPQC: true,
        deadline: '2025',
        notes: '',
        enforcementBody: '',
        libraryRefs: [],
        timelineRefs: [],
        bodyType: 'technical_standard' as const,
      },
      {
        id: 'cmmc',
        label: 'CMMC',
        description: '',
        industries: [],
        countries: [],
        requiresPQC: false,
        deadline: '2026',
        notes: '',
        enforcementBody: '',
        libraryRefs: [],
        timelineRefs: [],
        bodyType: 'compliance_framework' as const,
      },
    ]
    const dims = buildDimensions(
      'executive',
      'governance',
      mockData({ frameworks, complianceSelections: ['fips-203', 'cmmc'] })
    )
    const cg = dims.find((d) => d.id === 'compliance-gaps')
    // 1 of 2 frameworks requires PQC → 50%
    expect(cg?.autoScore).toBe(50)
  })

  it('attaches country-specific target to algorithms-migrated for US executive', () => {
    const dims = buildDimensions('executive', 'governance', mockData(), 'United States')
    const am = dims.find((d) => d.id === 'algorithms-migrated')
    expect(am?.target).toBe(80)
    expect(am?.targetLabel).toContain('Target: 80')
  })
})
