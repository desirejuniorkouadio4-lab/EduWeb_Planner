import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

/**
 * Proxy d'authentification (ex-"middleware", convention Next 16 — runtime edge).
 * Instance NextAuth construite UNIQUEMENT sur la config edge-safe (sans Prisma ni bcrypt).
 * Le contrôle fin par rôle/périmètre est réalisé côté serveur dans la mise en page de /app
 * et sur chaque page sensible.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Exécute le proxy partout sauf assets statiques, images Next et API auth.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
