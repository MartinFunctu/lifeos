/// <reference types="vite/client" />
/// <reference types="vitest" />
interface ImportMetaEnv {
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface XR {
  isSessionSupported: (sessionType: string) => Promise<boolean>
}

interface Navigator {
  xr: XR
}
