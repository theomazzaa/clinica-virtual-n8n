"use client";

import { useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
} as const;

export default function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(true), 200);
  }

  function handleLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-text-primary rounded-[var(--radius-sm)] whitespace-nowrap shadow-md pointer-events-none",
            "animate-in fade-in duration-100",
            positionClasses[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
