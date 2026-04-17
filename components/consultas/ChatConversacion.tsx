"use client";

import { useRef, useState, useEffect } from "react";
import { User, ArrowUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

type Mensaje = {
  id: string;
  rol: string;
  contenido: string;
  orden: number;
  created_at: string | null;
};

function formatHora(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Buenos_Aires",
  });
}

export default function ChatConversacion({
  mensajes,
  className,
}: {
  mensajes: Mensaje[];
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      setShowScrollTop((el?.scrollTop ?? 0) > 300);
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={cn("bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm flex flex-col h-[60vh] lg:h-[calc(100vh-280px)] relative", className)}>
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {mensajes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={MessageSquare}
              title="Sin mensajes"
              description="Los mensajes de esta consulta no estan disponibles aun"
            />
          </div>
        ) : (
          mensajes.map((m) => {
            const esAgente = m.rol === "agente";
            return (
              <div
                key={m.id}
                className={cn("flex gap-2", esAgente ? "justify-end" : "justify-start")}
              >
                {!esAgente && (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                      esAgente
                        ? "bg-primary-600 text-white rounded-tr-md"
                        : "bg-gray-100 text-text-primary rounded-tl-md"
                    )}
                  >
                    {m.contenido}
                  </div>
                  <p
                    className={cn(
                      "text-[11px] text-text-muted mt-1 px-1",
                      esAgente && "text-right"
                    )}
                  >
                    {formatHora(m.created_at)}
                  </p>
                </div>
                {esAgente && (
                  <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                    <img
                      src="/logo_docagent.png"
                      alt="IA"
                      className="w-5 h-5 object-contain mix-blend-multiply"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 w-8 h-8 bg-surface border border-border rounded-full shadow-md flex items-center justify-center text-text-muted hover:text-text-primary transition-all hover:shadow-lg focus-ring"
          aria-label="Ir al inicio"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
