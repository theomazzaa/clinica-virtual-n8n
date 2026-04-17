"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700 shadow-xs hover:shadow-sm",
  secondary:
    "bg-white text-text-secondary border border-border hover:bg-surface-secondary hover:text-text-primary hover:border-border-strong",
  ghost:
    "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
  destructive:
    "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-xs hover:shadow-sm",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-9 px-4 text-sm gap-2 rounded-[var(--radius-sm)]",
  lg: "h-11 px-6 text-sm gap-2 rounded-[var(--radius-md)]",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out focus-ring",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          loading && "pointer-events-none",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
