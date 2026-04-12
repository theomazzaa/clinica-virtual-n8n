"use client";

type Mensaje = {
  id: string;
  rol: string;
  contenido: string;
  orden: number;
  created_at: string | null;
};

function formatHora(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatConversacion({ mensajes }: { mensajes: Mensaje[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[calc(100vh-220px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="font-semibold text-[#1E293B]">
          Conversación{" "}
          <span className="text-[#64748B] font-normal text-sm">({mensajes.length} mensajes)</span>
        </h2>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensajes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#64748B] text-sm text-center px-4">
            Los mensajes de esta consulta no están disponibles aún
          </div>
        ) : (
          mensajes.map((m) => {
            const esAgente = m.rol === "agente";
            return (
              <div key={m.id} className={`flex ${esAgente ? "justify-start" : "justify-start"} gap-2`}>
                {!esAgente && (
                  <div className="w-7 h-7 rounded-full bg-[#E2E8F0] flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      esAgente
                        ? "bg-[#2563EB] text-white rounded-tl-sm"
                        : "bg-[#F1F5F9] text-[#1E293B] rounded-tl-sm"
                    }`}
                  >
                    {m.contenido}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1 px-1">{formatHora(m.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
