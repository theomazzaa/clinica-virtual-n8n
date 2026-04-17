"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
          fontSize: "14px",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
        },
      }}
      closeButton
    />
  );
}
