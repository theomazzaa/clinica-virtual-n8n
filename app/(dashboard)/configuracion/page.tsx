export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfiguracionCliente from "@/components/configuracion/ConfiguracionCliente";

export default async function ConfiguracionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const medico = await prisma.medicos.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, nombre: true, apellido: true, email: true,
      telefono: true, especialidad: true, matricula_nacional: true,
      zonas_cobertura: true, system_prompt: true,
    },
  }).catch(() => null);

  if (!medico) redirect("/login");

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">Configuración</h1>
        <p className="text-sm md:text-base text-[#64748B] mt-1">Gestioná tu perfil y preferencias</p>
      </div>
      <ConfiguracionCliente
        medico={{
          ...medico,
          zonas_cobertura: medico.zonas_cobertura as string[],
        }}
      />
    </div>
  );
}
