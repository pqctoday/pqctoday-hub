// SPDX-License-Identifier: GPL-3.0-only
/**
 * Canonical persona identity — dependency-free so it can be imported from
 * scripts and persistence validators without pulling in the full learning
 * catalog (`learningPersonas.ts` imports the quiz category type and defines
 * ~1200 lines of path data; scripts and store migrations only need the id set).
 *
 * `grc` sits immediately after `executive` — the 2026-09-07 Executive/GRC
 * split kept Executive as the existing identifier and added GRC as a new,
 * distinct persona rather than replacing or renaming anything. Every consumer
 * that previously assumed six personas must treat this as the source of truth
 * instead of re-declaring the union.
 */
export const PERSONA_IDS = [
  'executive',
  'grc',
  'developer',
  'architect',
  'researcher',
  'ops',
  'curious',
] as const

export type PersonaId = (typeof PERSONA_IDS)[number]

export function isPersonaId(value: unknown): value is PersonaId {
  return typeof value === 'string' && (PERSONA_IDS as readonly string[]).includes(value)
}
