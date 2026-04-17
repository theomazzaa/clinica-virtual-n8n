export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AlertasList from "@/components/alertas/AlertasList";

async function getAlarmas(medicoId: string) {
  return prisma.consultas.findMany({
    where: { medico_id: medicoId, alarma: true },
    orderBy: { created_at: "desc" },
    include: {
      paciente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          celular: true,
          dni: true,
        },
      },
      informe: { select: { google_doc_url: true, estado: true } },
    },
  });
}

export default async function AlarmasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let alarmas: Awaited<ReturnType<typeof getAlarmas>> = [];
  try {
    alarmas = await getAlarmas(session.user.id);
  } catch (e) {
    console.error(e);
  }

  const noRevisadas = alarmas.filter(
    (a) => a.informe?.estado !== "revisado"
  ).length;

  const alertasSerialized = alarmas.map((a) => ({
    ...a,
    created_at: a.created_at ? a.created_at.toISOString() : null,
    finalizada_at: a.finalizada_at ? a.finalizada_at.toISOString() : null,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">
          Alertas
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {alarmas.length === 0
            ? "Sin alertas activas"
            : `${alarmas.length} consulta${alarmas.length !== 1 ? "s" : ""} con alarma${
                noRevisadas > 0 ? ` · ${noRevisadas} sin revisar` : ""
              }`}
        </p>
      </div>

      {/* List with tabs */}
      <AlertasList alertas={alertasSerialized} />
    </div>
  );
}
