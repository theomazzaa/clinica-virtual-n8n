import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rutas públicas
  const publicPaths = ["/login", "/registro"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (req.auth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Rutas API de auth siempre públicas
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Proteger todo lo demás
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
