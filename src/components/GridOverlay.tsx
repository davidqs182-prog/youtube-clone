"use client";

import { useEffect, useState } from "react";

export default function GridOverlay() {
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl + G or Cmd + G or KeyG to toggle grid overlay
      if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === "g" || e.code === "KeyG")) {
        e.preventDefault();
        setShowGrid((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!showGrid) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] w-screen h-screen select-none overflow-hidden px-4 xl:px-6">
      {/* 12-Column Responsive Full-Width Grid (Edge-to-Edge) */}
      <div className="w-full h-full grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-12 gap-4 xl:gap-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="h-full bg-cyan-500/10 border-x border-cyan-500/30 flex flex-col justify-between p-1"
          >
            <span className="text-[9px] font-mono text-cyan-300 font-bold bg-black/80 px-1 py-0.5 rounded text-center self-center mt-3">
              C{idx + 1}
            </span>
            <span className="text-[9px] font-mono text-cyan-300 font-bold bg-black/80 px-1 py-0.5 rounded text-center self-center mb-16">
              C{idx + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal 16px Baseline Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(244, 63, 94, 0.2) 1px, transparent 1px)",
          backgroundSize: "100% 16px"
        }}
      />
    </div>
  );
}
