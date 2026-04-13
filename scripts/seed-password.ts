/**
 * Seed: setear password para Dr. Blas Mazza
 * Correr con: npx ts-node --project tsconfig.json scripts/seed-password.ts
 * O directamente como API: POST /api/seed (solo en dev)
 */
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const MEDICO_ID = "48315179-21eb-406d-8c8b-e172d120bdcf";
  const password = "temporal123";

  const hash = await bcrypt.hash(password, 12);

  const result = await prisma.medicos.update({
    where: { id: MEDICO_ID },
    data: { password_hash: hash },
  });

  console.log(`Password seteado para: ${result.nombre} ${result.apellido} (${result.email})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
