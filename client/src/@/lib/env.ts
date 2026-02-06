// import { LocalAuthStore } from "pocketbase" // Removed PB
import { statics } from "./statics"
// import PocketBase from "pocketbase" // Removed PB


export const DEVICES = {
  HEADSET_AR: "HeadsetAR",
  VR: "VR",
  MOBILE_AR: "MobileAR",
  MOBILE: "Mobile",
  DESKTOP: "Desktop"
}

let $detectedDevice: string | null = null
export function detectDevice() {
  if (statics.forceDevice) {
    return statics.forceDevice
  }

  return $detectedDevice
}
async function $detectDevice() {
  $detectedDevice = await (async () => {
    if (navigator.xr?.isSessionSupported &&
      await navigator.xr.isSessionSupported('immersive-ar') &&
      /Quest|OculusBrowser/i.test(navigator.userAgent)) {
      return 'HeadsetAR';
    }

    if (navigator.xr?.isSessionSupported &&
      await navigator.xr.isSessionSupported('immersive-vr')) {
      return 'VR';
    }

    if (navigator.xr?.isSessionSupported &&
      await navigator.xr.isSessionSupported('immersive-ar')) {
      return 'MobileAR';
    }

    return /Mobi|Android|iPhone|iPod|IEMobile|BlackBerry|Opera Mini/i
      .test(navigator.userAgent) ? 'Mobile' : 'Desktop';
  })()
}
; (() => $detectDevice())()