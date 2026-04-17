"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex border-b border-border gap-0",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-ring",
              isActive
                ? "text-primary-600"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "bg-surface-secondary text-text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {/* Underline indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
