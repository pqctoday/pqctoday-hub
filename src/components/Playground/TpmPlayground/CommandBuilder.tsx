import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { serializeDemoCommand, toHex } from '../../../wasm/tpmSerializer'
import { executeTpmCommand } from '../../../wasm/tpmBridge'
import type { TpmLogEntry, TpmObjectEntry } from './TpmPlayground'

interface CommandBuilderProps {
  disabled: boolean
  onLogUpdate: (log: TpmLogEntry) => void
  onObjectUpdate: (obj: TpmObjectEntry) => void
}

export function CommandBuilder({ disabled, onLogUpdate, onObjectUpdate }: CommandBuilderProps) {
  const [commandType, setCommandType] = useState('TPM2_Startup')
  const [algorithm, setAlgorithm] = useState('MLKEM-768')
  const [isExecuting, setIsExecuting] = useState(false)

  const serializedBytes = useMemo(() => {
    return serializeDemoCommand(commandType, algorithm)
  }, [commandType, algorithm])

  const handleExecute = async () => {
    setIsExecuting(true)

    const req = new Uint8Array(serializedBytes)
    const logEntry: TpmLogEntry = {
      commandType,
      algorithm,
      request: req,
      response: null,
    }

    try {
      const response = await executeTpmCommand(req)
      logEntry.response = response
      onLogUpdate(logEntry)

      // If we create a primary or load something, add to the mock object table
      if (commandType === 'TPM2_CreatePrimary') {
        // Mock parsing out the handle (e.g., 0x80000001)
        onObjectUpdate({
          handle: '0x80000001',
          description: 'Primary Storage Key (SRK)',
          algorithm: algorithm,
        })
      }
    } catch (err) {
      logEntry.error = String(err)
      onLogUpdate(logEntry)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="cmd-type"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block"
          >
            Command
          </label>
          <select
            id="cmd-type"
            value={commandType}
            onChange={(e) => setCommandType(e.target.value)}
            disabled={disabled || isExecuting}
            className="w-full bg-background border border-border rounded p-2 text-sm text-foreground focus:ring-primary focus:border-primary"
          >
            <option value="TPM2_Startup">TPM2_Startup</option>
            <option value="TPM2_CreatePrimary">TPM2_CreatePrimary</option>
            <option value="TPM2_Load">TPM2_Load</option>
            <option value="TPM2_Encapsulate">TPM2_Encapsulate</option>
            <option value="TPM2_Decapsulate">TPM2_Decapsulate</option>
            <option value="TPM2_SignDigest">TPM2_SignDigest</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="cmd-alg"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block"
          >
            Algorithm (TCG V1.85)
          </label>
          <select
            id="cmd-alg"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={disabled || isExecuting}
            className="w-full bg-background border border-border rounded p-2 text-sm text-foreground focus:ring-primary focus:border-primary"
          >
            <option value="MLKEM-512">MLKEM-512 (0x00A0)</option>
            <option value="MLKEM-768">MLKEM-768 (0x00A0)</option>
            <option value="MLKEM-1024">MLKEM-1024 (0x00A0)</option>
            <option value="MLDSA-44">MLDSA-44 (0x00A1)</option>
            <option value="MLDSA-65">MLDSA-65 (0x00A1)</option>
            <option value="MLDSA-87">MLDSA-87 (0x00A1)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Serialized Command Stream (Hex)
        </p>
        <div className="bg-muted/30 border border-border p-3 rounded font-mono text-xs text-muted-foreground break-all h-24 overflow-y-auto">
          {toHex(serializedBytes)}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Read-only. Bytes are strictly synchronized with the semantic builder.
        </p>
      </div>

      <Button
        onClick={handleExecute}
        disabled={disabled || isExecuting}
        variant="gradient"
        className="w-full"
      >
        {isExecuting ? 'Executing...' : 'Send Command'}
      </Button>
    </div>
  )
}
