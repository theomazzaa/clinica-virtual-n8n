import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const medico = await prisma.medicos.findUnique({
          where: { email: credentials.email as string },
        });

        if (!medico || !medico.password_hash) return null;
        if (!medico.activo) return null;

        const ok = await bcrypt.compare(
          credentials.password as string,
          medico.password_hash
        );
        if (!ok) return null;

        return {
          id: medico.id,
          email: medico.email,
          name: `${medico.nombre} ${medico.apellido}`,
          nombre: medico.nombre,
          apellido: medico.apellido,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.nombre = token.nombre as string | undefined;
        session.user.apellido = token.apellido as string | undefined;
      }
      return session;
    },
  },
});
