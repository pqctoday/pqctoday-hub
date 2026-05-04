// TPM 2.0 Command Tags
export const TPM_ST_NO_SESSIONS = 0x8001
export const TPM_ST_SESSIONS = 0x8002

// TPM 2.0 Command Codes
export const TPM_CC_Startup = 0x00000144
export const TPM_CC_CreatePrimary = 0x00000131
export const TPM_CC_Load = 0x00000157
export const TPM_CC_SignDigest = 0x000001a6
export const TPM_CC_Encapsulate = 0x000001a7
export const TPM_CC_Decapsulate = 0x000001a8

export function buildCommand(
  tag: number,
  cc: number,
  payload: Uint8Array = new Uint8Array(0)
): Uint8Array {
  const size = 2 + 4 + 4 + payload.length
  const buffer = new Uint8Array(size)
  const view = new DataView(buffer.buffer)

  view.setUint16(0, tag, false) // false = Big Endian
  view.setUint32(2, size, false)
  view.setUint32(6, cc, false)

  if (payload.length > 0) {
    buffer.set(payload, 10)
  }

  return buffer
}

export function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')
}

// Pre-constructed command generators for demo UI
export function serializeDemoCommand(type: string, _algorithm: string): Uint8Array {
  let payload: number[] = []

  switch (type) {
    case 'TPM2_Startup':
      // Startup(TPM_SU_CLEAR = 0x0000)
      payload = [0x00, 0x00]
      return buildCommand(TPM_ST_NO_SESSIONS, TPM_CC_Startup, new Uint8Array(payload))

    case 'TPM2_CreatePrimary':
      // Simplified mock payload for CreatePrimary (PrimaryHandle, InPublic, etc.)
      payload = [
        0x40,
        0x00,
        0x00,
        0x01, // primaryHandle (Owner hierarchy)
        0x00,
        0x00,
        0x00,
        0x00, // auth size
        // ... (this would be a complex TPMT_PUBLIC struct in reality)
        0x00,
        0x00, // simplified
      ]
      return buildCommand(TPM_ST_SESSIONS, TPM_CC_CreatePrimary, new Uint8Array(payload))

    case 'TPM2_Encapsulate':
      // Mock payload
      payload = [
        0x80,
        0x00,
        0x00,
        0x01, // keyHandle
        0x00,
        0x00, // auth
      ]
      return buildCommand(TPM_ST_SESSIONS, TPM_CC_Encapsulate, new Uint8Array(payload))

    case 'TPM2_Decapsulate':
      payload = [
        0x80,
        0x00,
        0x00,
        0x01, // keyHandle
        0x00,
        0x00, // auth
        // encapsulation block
        0x00,
        0x20, // size 32
        ...Array(32).fill(0xaa),
      ]
      return buildCommand(TPM_ST_SESSIONS, TPM_CC_Decapsulate, new Uint8Array(payload))

    case 'TPM2_SignDigest':
      payload = [
        0x80,
        0x00,
        0x00,
        0x01, // keyHandle
        0x00,
        0x20, // digest size 32
        ...Array(32).fill(0xbb),
      ]
      return buildCommand(TPM_ST_SESSIONS, TPM_CC_SignDigest, new Uint8Array(payload))

    default:
      return buildCommand(TPM_ST_NO_SESSIONS, 0x00000000)
  }
}
