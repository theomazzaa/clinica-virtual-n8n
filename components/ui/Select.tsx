"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, helperText, error, options, placeholder, id, ...props },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-9 px-3 pr-8 text-sm text-text-primary bg-surface border rounded-[var(--radius-sm)] appearance-none",
              "transition-all duration-150 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary",
              error
                ? "border-danger-500 focus:ring-danger-500"
                : "border-border hover:border-border-strong",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
