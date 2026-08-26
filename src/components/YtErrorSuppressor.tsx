"use client";

import { useEffect } from "react";

/**
 * Suppresses internal YouTube IFrame API bootstrap errors & promise rejections
 * (e.g. Cannot read properties of null (reading 'playVideo')) so Next.js Turbopack
 * dev overlay never triggers.
 */
export default function YtErrorSuppressor() {
  useEffect(() => {
    const isYtError = (msg: string) => {
      return (
        msg.includes("playVideo") ||
        msg.includes("pauseVideo") ||
        msg.includes("Cannot read properties of null") ||
        msg.includes("reading 'playVideo'") ||
        msg.includes("reading 'src'") ||
        msg.includes("AbortError") ||
        msg.includes("interrupted")
      );
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event?.reason?.message || event?.reason || "");
      if (isYtError(msg)) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const msg = String(event?.message || event?.error?.message || "");
      if (isYtError(msg)) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
