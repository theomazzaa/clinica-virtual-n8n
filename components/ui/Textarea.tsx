"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[11px] font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full min-h-[80px] px-3 py-2 text-sm text-text-primary bg-surface border rounded-[var(--radius-sm)] resize-y",
            "placeholder:text-text-muted",
            "transition-all duration-150 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary",
            error
              ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
              : "border-border hover:border-border-strong",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
