"use client";

import React, { useEffect, useState, useRef } from "react";
import { useCursor } from "@/context/CursorContext";

export default function CustomCursor() {
  const { isHovered, cursorText } = useCursor();
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Target mouse position
  const mousePos = useRef({ x: -100, y: -100 });
  
  // Smooth LERP positions for outer trailing circle
  const ringPos = useRef({ x: -100, y: -100 });

  // Scroll stretch state (velocity & direction: +1 down, -1 up)
  const scrollVelocity = useRef(0);
  const scrollDir = useRef<1 | -1 | 0>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // DOM element refs for direct 60/120 FPS rAF updates
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Detect fine pointer (mouse vs touch)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouchDevice(!mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    if (!mediaQuery.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    const onMouseDown = () => {
      setIsMouseDown(true);
    };

    const onMouseUp = () => {
      setIsMouseDown(false);
    };

    // Scroll directional stretch listener
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 2) {
        scrollDir.current = e.deltaY > 0 ? 1 : -1;
        scrollVelocity.current = Math.min(Math.abs(e.deltaY) * 0.05, 0.4);

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          scrollDir.current = 0;
        }, 200);
      }
    };

    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        scrollDir.current = 0;
      }, 200);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Animation loop using requestAnimationFrame
    const updatePosition = () => {
      // Instant follow for central white dot
      if (dotRef.current) {
        const dotScale = isMouseDown ? 1.75 : isHovered ? 1.3 : 1;
        dotRef.current.style.transform = `translate3d(${mousePos.current.x - 16}px, ${mousePos.current.y - 16}px, 0) scale(${dotScale})`;
      }

      // Smooth LERP follow for trailing ring (factor 0.15 for fluid trail)
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      // Smooth decay of scroll stretch velocity
      scrollVelocity.current += (0 - scrollVelocity.current) * 0.1;

      if (ringRef.current) {
        const hoverScale = isMouseDown ? 1.1 : isHovered ? 1.25 : 1;
        const stretchY = 1 + scrollVelocity.current * 0.8;
        const stretchX = 1 - scrollVelocity.current * 0.3;

        // Directional origin:
        // Scroll DOWN (deltaY > 0) -> stretch from bottom to top (origin bottom center)
        // Scroll UP   (deltaY < 0) -> stretch from top to bottom (origin top center)
        const origin = scrollDir.current === 1 ? "center bottom" : scrollDir.current === -1 ? "center top" : "center center";
        ringRef.current.style.transformOrigin = origin;
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - 48}px, ${ringPos.current.y - 48}px, 0) scale(${hoverScale}) scale(${stretchX}, ${stretchY})`;
      }

      animFrameId.current = requestAnimationFrame(updatePosition);
    };

    animFrameId.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      mediaQuery.removeEventListener("change", handleMediaChange);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible, isHovered, isMouseDown]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Central circle (~32px / w-8 h-8) - 100% pure solid white, expands on click */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-transform duration-100 ease-out`}
      />

      {/* Large trailing outer circle (~96px / w-24 h-24) - gets much more opaque on click */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-24 h-24 rounded-full pointer-events-none z-40 mix-blend-difference transition-all duration-300 ease-out flex items-center justify-center text-center ${
          isMouseDown
            ? "opacity-90 border-2 border-white bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.6)]"
            : "opacity-40 border border-white/50 bg-white/20"
        }`}
      >
        {cursorText && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
