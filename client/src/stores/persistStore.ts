import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface persistStore {
  cookiesAccepted: boolean
  setCookiesAccepted: (cookiesAccepted: boolean) => void
  cookiesDisplay: boolean
  setCookiesDisplay: (cookiesDisplay: boolean) => void
  selectedIncludedTagsIds: string[]
  setSelectedIncludedTagsIds: (selectedIncludedTagsIds: string[]) => void
  selectedExcludedTagsIds: string[]
  setSelectedExcludedTagsIds: (selectedExcludedTagsIds: string[]) => void
  timerSeconds: number
  setTimerSeconds: (timerSeconds: number) => void
  lastEmailUsed?: string
  setLastEmailUsed: (lastEmailUsed: string) => void
}

export const persistStore = create<persistStore>()(
  persist(
    (set, get) => ({
      cookiesAccepted: false,
      setCookiesAccepted: (cookiesAccepted: boolean) =>
        set({ cookiesAccepted }),
      cookiesDisplay: false,
      setCookiesDisplay: (cookiesDisplay: boolean) => set({ cookiesDisplay }),
      selectedIncludedTagsIds: [],
      setSelectedIncludedTagsIds: (selectedIncludedTagsIds: string[]) =>
        set({ selectedIncludedTagsIds }),
      selectedExcludedTagsIds: [],
      setSelectedExcludedTagsIds: (selectedExcludedTagsIds: string[]) =>
        set({ selectedExcludedTagsIds }),
      timerSeconds: 7200,
      setTimerSeconds: (timerSeconds: number) => set({ timerSeconds }),
      lastEmailUsed: undefined,
      setLastEmailUsed: (lastEmailUsed: string) => set({ lastEmailUsed }),
    }),
    {
      name: 'persist-storage-3'
    }
  )
)
