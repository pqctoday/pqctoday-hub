// SPDX-License-Identifier: GPL-3.0-only
import { useState, useMemo, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { HardDrive, Zap, Network, Download, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CERT_CAPACITY_DEFAULTS, BASELINE_ALGO } from '@/data/certCapacityDefaults'
import { generateCsv, downloadCsv, csvFilename } from '@/utils/csvExport'

const DISPLAYED_ALGOS = ['RSA-2048', 'ECDSA P-256', 'ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87']

interface CalcInputs {
  certCount: number
  renewalDays: number
  handshakesPerSec: number
}

interface CalcOutputRow {
  algo: string
  storageMB: number
  renewalsPerYear: number
  tlsBandwidthKBPerHandshake: number
  signaturesPerSecCapacity: number
  sizeSource: string
  perfSource: string
}

function computeOutputs(inputs: CalcInputs): CalcOutputRow[] {
  const { certCount, renewalDays, handshakesPerSec } = inputs
  const renewalsPerYear = Math.round(365 / renewalDays)

  return CERT_CAPACITY_DEFAULTS.filter((a) => DISPLAYED_ALGOS.includes(a.name)).map((algo) => {
    // Storage = certs × cert size (public key + sig) × renewals/yr
    const certSizeBytes = algo.publicKeyBytes + algo.signatureBytes + 512 // +512 for ASN.1 overhead
    const storageMB = (certCount * certSizeBytes * renewalsPerYear) / (1024 * 1024)

    // Bandwidth = TLS cert message size per handshake (KB)
    const tlsBandwidthKBPerHandshake =
      (BASELINE_ALGO.publicKeyBytes + BASELINE_ALGO.signatureBytes + algo.tlsCertOverheadBytes + 512) / 1024

    // CPU capacity: how many sign ops per second at given throughput
    const maxSignOpsPerSec = 1e6 / algo.signCpuMicros
    // At the requested handshake rate, what fraction of one CPU core is consumed?
    const signaturesPerSecCapacity = Math.round(maxSignOpsPerSec)

    return {
      algo: algo.name,
      storageMB: Math.round(storageMB * 10) / 10,
      renewalsPerYear,
      tlsBandwidthKBPerHandshake: Math.round(tlsBandwidthKBPerHandshake * 10) / 10,
      signaturesPerSecCapacity,
      sizeSource: algo.sizeSource,
      perfSource: algo.perfSource,
    }
  })
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  tooltip,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  tooltip: string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground flex items-center gap-1">
          {label}
          <span
            title={tooltip}
            className="text-muted-foreground cursor-help"
            aria-label={tooltip}
          >
            <Info size={11} />
          </span>
        </label>
        <span className="text-xs font-mono text-primary">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={label}
      />
    </div>
  )
}

export function CertCapacityCalculator() {
  const [inputs, setInputs] = useState<CalcInputs>({
    certCount: 1_000_000,
    renewalDays: 90,
    handshakesPerSec: 1000,
  })

  const results = useMemo(() => computeOutputs(inputs), [inputs])

  const set = useCallback((key: keyof CalcInputs) => (v: number) => {
    setInputs((prev) => ({ ...prev, [key]: v }))
  }, [])

  const storageData = results.map((r) => ({ name: r.algo, 'Storage (MB)': r.storageMB }))
  const bandwidthData = results.map((r) => ({
    name: r.algo,
    'TLS Cert (KB)': r.tlsBandwidthKBPerHandshake,
  }))
  const cpuData = results.map((r) => ({ name: r.algo, 'Sign ops/sec': r.signaturesPerSecCapacity }))

  const handleExport = useCallback(() => {
    const rows = results.map((r) => ({
      Algorithm: r.algo,
      'Storage MB (annual)': r.storageMB,
      'Renewals per year': r.renewalsPerYear,
      'TLS Cert KB per handshake': r.tlsBandwidthKBPerHandshake,
      'Max sign ops/sec': r.signaturesPerSecCapacity,
      'Size source': r.sizeSource,
      'Perf source': r.perfSource,
    }))
    downloadCsv(generateCsv(rows), csvFilename('cert-capacity'))
  }, [results])

  return (
    <div className="space-y-6">
      {/* Educational disclaimer */}
      <div className="rounded-lg border border-status-warning/40 bg-status-warning/5 px-4 py-3">
        <p className="text-xs text-status-warning leading-relaxed">
          Educational model — values are based on reference benchmarks and may differ from your production environment. Always benchmark with your actual hardware and workload.
        </p>
      </div>

      {/* Inputs */}
      <div className="glass-panel p-4 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Parameters</p>
        <SliderRow
          label="Certificate count"
          value={inputs.certCount}
          min={10_000}
          max={10_000_000}
          step={10_000}
          format={(v) => v.toLocaleString()}
          tooltip="Total number of certificates in your PKI (leaf certs)"
          onChange={set('certCount')}
        />
        <SliderRow
          label="Renewal cadence (days)"
          value={inputs.renewalDays}
          min={30}
          max={365}
          step={30}
          format={(v) => `${v}d`}
          tooltip="How often each certificate is renewed. 90 days is the Let's Encrypt standard."
          onChange={set('renewalDays')}
        />
        <SliderRow
          label="TLS handshakes / sec"
          value={inputs.handshakesPerSec}
          min={100}
          max={100_000}
          step={100}
          format={(v) => v.toLocaleString()}
          tooltip="Peak TLS handshake rate your servers handle. Used for bandwidth estimation."
          onChange={set('handshakesPerSec')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={14} className="text-primary" aria-hidden="true" />
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Storage (MB/yr)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={storageData} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: 11 }}
              />
              <Bar dataKey="Storage (MB)" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Network size={14} className="text-secondary" aria-hidden="true" />
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              TLS Cert KB / handshake
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bandwidthData} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: 11 }}
              />
              <Bar dataKey="TLS Cert (KB)" fill="var(--color-secondary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-accent" aria-hidden="true" />
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Max sign ops/sec
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cpuData} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: 11 }}
              />
              <Bar dataKey="Sign ops/sec" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data table */}
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Algorithm</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Storage MB/yr</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">TLS cert KB</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">Sign ops/sec</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium hidden md:table-cell">Sources</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.algo} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-3 py-2 font-mono text-foreground">{r.algo}</td>
                <td className="px-3 py-2 text-right font-mono">{r.storageMB.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono">{r.tlsBandwidthKBPerHandshake}</td>
                <td className="px-3 py-2 text-right font-mono">{r.signaturesPerSecCapacity.toLocaleString()}</td>
                <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                  {r.sizeSource}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download size={14} />
          Export CSV
        </Button>
      </div>
    </div>
  )
}
