import React from 'react'
import { ArrowRight, ArrowLeft, Copy, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TpmLogEntry } from './TpmPlayground'
import { toHex } from '../../../wasm/tpmSerializer'

interface ExecutionLogProps {
  logs: TpmLogEntry[]
}

export function ExecutionLog({ logs }: ExecutionLogProps) {
  const latestLog = logs[logs.length - 1]

  const handleCopy = (hexString: string) => {
    navigator.clipboard.writeText(hexString)
  }

  // Parse TPM return code from response buffer (offset 6, 4 bytes, big-endian)
  let tpmRc = 0
  if (latestLog?.response && latestLog.response.length >= 10) {
    const dv = new DataView(
      latestLog.response.buffer,
      latestLog.response.byteOffset,
      latestLog.response.byteLength
    )
    tpmRc = dv.getUint32(6, false)
  }

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex-1 bg-background border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="bg-muted/30 px-4 py-2 border-b border-border text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Request (Command)
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px]">
              Size: {latestLog ? latestLog.request.length : 0} bytes
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => latestLog && handleCopy(toHex(latestLog.request))}
              disabled={!latestLog}
              className="h-6 w-6 hover:text-primary"
              title="Copy Request Hex"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <pre className="font-mono text-xs text-muted-foreground break-all whitespace-pre-wrap">
            {latestLog ? toHex(latestLog.request) : 'No command executed yet.'}
          </pre>
        </div>
      </div>

      <div className="flex-1 bg-background border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="bg-muted/30 px-4 py-2 border-b border-border text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-secondary" />
            Response
          </div>
          <div className="flex items-center gap-4">
            {tpmRc !== 0 && (
              <span className="flex items-center gap-1 bg-destructive/10 text-destructive border border-destructive/30 px-2 py-0.5 rounded font-mono text-[10px]">
                <AlertTriangle className="h-3 w-3" />
                RC: 0x{tpmRc.toString(16).toUpperCase().padStart(4, '0')}
              </span>
            )}
            <span className="font-mono text-[10px]">
              Size: {latestLog?.response ? latestLog.response.length : 0} bytes
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => latestLog?.response && handleCopy(toHex(latestLog.response))}
              disabled={!latestLog?.response}
              className="h-6 w-6 hover:text-secondary"
              title="Copy Response Hex"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {latestLog?.error ? (
            <pre className="font-mono text-xs text-destructive break-all whitespace-pre-wrap">
              [TPM ERROR] {latestLog.error}
            </pre>
          ) : (
            <pre
              className={`font-mono text-xs break-all whitespace-pre-wrap ${tpmRc !== 0 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {latestLog?.response ? toHex(latestLog.response) : 'Awaiting response...'}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
