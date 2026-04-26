/**
 * Configuración temporal para desarrollo.
 *
 * TODO: cuando se integre NextAuth real, este archivo desaparece.
 * El medicoId debe leerse de la sesión del usuario logueado:
 *   const session = await getServerSession(authOptions);
 *   const medicoId = session?.user?.medicoId;
 *
 * Mientras tanto, todas las queries de la app web usan este UUID
 * para simular el médico logueado en entorno dev.
 */
export const MEDICO_ID_DEV = "2929611c-fd29-4b9f-a291-eafaf7959c64";
