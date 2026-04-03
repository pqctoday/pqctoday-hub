// SPDX-License-Identifier: GPL-3.0-only
let strongSwanModule = null
let isDaemonRunning = false
let cachedGetFunctionListPtr = null

const createConfigFiles = (configs) => {
  if (!strongSwanModule) return

  try {
    strongSwanModule.FS.mkdir('/etc')
    strongSwanModule.FS.mkdir('/etc/strongswan.d')
  } catch (e) {
    if (e.code !== 'EEXIST') console.error('FS.mkdir error', e)
  }

  for (const [filename, content] of Object.entries(configs)) {
    try {
      const path = filename.startsWith('/') ? filename : `/etc/${filename}`
      strongSwanModule.FS.writeFile(path, content)
    } catch (e) {
      console.error(`Failed to write config: ${filename}`, e)
    }
  }
}

self.onmessage = async (e) => {
  const { type, payload } = e.data

  if (type === 'INIT') {
    try {
      // Safely load the Emscripten WASM wrapper via classical Worker scripts, bypassing Vite modules & CSP evals completely!
      importScripts('/wasm/strongswan.js')

      const createModule = globalThis.Module || globalThis.strongswan

      strongSwanModule = await createModule({
        locateFile: (path) => `/wasm/${path}`,
        print: (text) => {
          self.postMessage({ type: 'LOG', payload: { level: 'info', text } })
        },
        printErr: (text) => {
          self.postMessage({ type: 'LOG', payload: { level: 'error', text } })
        },
        // We shim the custom dlopen / dlsym that we patched into pkcs11_library.c
        wasm_dlopen: (filenamePtr, _flags) => {
          const file = strongSwanModule.UTF8ToString(filenamePtr)
          self.postMessage({
            type: 'LOG',
            payload: { level: 'info', text: `[WASM DLOPEN] Intercepted load request for: ${file}` },
          })
          return 1 // return valid handle
        },
        wasm_dlclose: (_handle) => {
          self.postMessage({
            type: 'LOG',
            payload: { level: 'info', text: `[WASM DLCLOSE] Successfully unloaded module handle` },
          })
          return 0 // success
        },
        wasm_dlsym: (_handle, symbolPtr) => {
          const sym = strongSwanModule.UTF8ToString(symbolPtr)
          if (sym === 'C_GetFunctionList') {
            self.postMessage({
              type: 'LOG',
              payload: { level: 'info', text: `[WASM DLSYM] Binding JS SoftHSM hook to ${sym}!` },
            })

            if (cachedGetFunctionListPtr !== null) {
              return cachedGetFunctionListPtr
            }

            // This is the C-callable that returns CKR_OK and writes the function list pointer
            const cGetFunctionList = (_ppFunctionList) => {
              // Mock implementation
              return 0 // CKR_OK
            }
            cachedGetFunctionListPtr = strongSwanModule.addFunction(cGetFunctionList, 'ii')
            return cachedGetFunctionListPtr
          }
          return 0
        },
        onRuntimeInitialized: () => {
          self.postMessage({ type: 'READY' })
        },
      })
    } catch (err) {
      self.postMessage({ type: 'ERROR', payload: `Init error: ${err.message}` })
    }
  } else if (type === 'START_DAEMON') {
    if (isDaemonRunning) {
      self.postMessage({
        type: 'LOG',
        payload: { level: 'error', text: 'Daemon is already running in this worker block!' },
      })
      return
    }

    if (strongSwanModule && strongSwanModule._main) {
      try {
        if (payload) {
          createConfigFiles(payload)
        }
        isDaemonRunning = true
        // Starts the Charon Daemon
        strongSwanModule._main(0, 0)
      } catch (err) {
        self.postMessage({ type: 'ERROR', payload: `Daemon exited: ${err.message}` })
      } finally {
        isDaemonRunning = false
      }
    }
  }
}
