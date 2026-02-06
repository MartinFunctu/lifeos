import { create } from 'zustand'

interface userStore {
  colorMode: string
  setColorMode: (colorMode: string) => void
}

export const userStore = create<userStore>()((set) => ({
  colorMode: 'dark',
  setColorMode: (colorMode: string) => set({ colorMode })
}))

initColorMode()

function initColorMode() {
  const className = 'dark'
  const bodyClass = window.document.body.classList
  bodyClass.add(className)
}
