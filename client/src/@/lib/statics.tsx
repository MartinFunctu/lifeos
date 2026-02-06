
import { useEffect } from "react";
import { DEVICES } from "./env";


type StaticsT = {
  forceDevice: string | null
}

export const statics: StaticsT = {
  forceDevice: null
}

export function StaticsInitialzer() {

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.has('device')) {

      const targetDevice = searchParams.get('device') || ""
      if (Object.values(DEVICES).includes(targetDevice)) {
        statics.forceDevice = targetDevice
      }
    }
  }, [])
  return null
}