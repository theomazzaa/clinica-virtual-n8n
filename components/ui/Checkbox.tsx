"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ─── Checkbox ─── */

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <label
        htmlFor={checkId}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none",
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkId}
          className="w-4 h-4 rounded border-border text-primary-600 focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
          {...props}
        />
        {label && <span className="text-sm text-text-primary">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

/* ─── Switch ─── */

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 ease-in-out focus-ring",
          checked ? "bg-primary-600" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform duration-150 ease-in-out",
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}
