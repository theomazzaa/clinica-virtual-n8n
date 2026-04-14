import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rutas API de auth siempre públicas
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Rutas públicas (páginas y APIs sin autenticación)
  const publicPaths = ["/login", "/registro", "/api/registro", "/api/seed", "/api/reset-password"];
  const esPublica = publicPaths.some((p) => pathname.startsWith(p));

  const isLoggedIn = !!req.auth;

  if (esPublica) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Proteger todo lo demás
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
