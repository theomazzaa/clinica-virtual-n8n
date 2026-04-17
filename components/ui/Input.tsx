"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 px-3 text-sm text-text-primary bg-surface border rounded-[var(--radius-sm)]",
              "placeholder:text-text-muted",
              "transition-all duration-150 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary",
              error
                ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
                : "border-border hover:border-border-strong",
              icon && "pl-9",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
