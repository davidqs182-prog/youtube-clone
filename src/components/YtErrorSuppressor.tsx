"use client";

import { useEffect } from "react";

/**
 * Suppresses the unhandledRejection that react-youtube / YouTube IFrame API
 * emits internally when playVideo() is called before the player's internal
 * object is fully bootstrapped. This is a known library-level bug — our code
 * already guards against it but the rejection still bubbles up inside the lib.
 */
export default function YtErrorSuppressor() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message ?? "";
      if (
        msg.includes("playVideo") ||
        msg.includes("pauseVideo") ||
        msg.includes("Cannot read properties of null")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return null;
}
