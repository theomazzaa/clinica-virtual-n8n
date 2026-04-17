"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease-in-out]" />

      {/* Content */}
      <div
        className={cn(
          "relative bg-surface rounded-[var(--radius-lg)] shadow-overlay w-full max-w-md",
          "animate-[scaleIn_150ms_ease-in-out]",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  children,
  onClose,
  className,
}: {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between p-6 pb-0", className)}>
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 text-text-muted hover:text-text-primary rounded-[var(--radius-sm)] transition-colors focus-ring"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function DialogBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 border-t border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
