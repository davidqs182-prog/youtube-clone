"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CursorContextType {
  isHovered: boolean;
  cursorText: string | null;
  cursorVariant: "default" | "hover" | "text" | "button";
  setCursorHover: (hovered: boolean, text?: string | null, variant?: "default" | "hover" | "text" | "button") => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType>({
  isHovered: false,
  cursorText: null,
  cursorVariant: "default",
  setCursorHover: () => {},
  resetCursor: () => {},
});

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [cursorVariant, setCursorVariant] = useState<"default" | "hover" | "text" | "button">("default");

  const setCursorHover = (
    hovered: boolean,
    text: string | null = null,
    variant: "default" | "hover" | "text" | "button" = "hover"
  ) => {
    setIsHovered(hovered);
    setCursorText(text);
    setCursorVariant(hovered ? variant : "default");
  };

  const resetCursor = () => {
    setIsHovered(false);
    setCursorText(null);
    setCursorVariant("default");
  };

  return (
    <CursorContext.Provider
      value={{
        isHovered,
        cursorText,
        cursorVariant,
        setCursorHover,
        resetCursor,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => useContext(CursorContext);
