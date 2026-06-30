import type { NextAuthConfig } from "next-auth";

/**
 * Configuration Auth.js COMPATIBLE EDGE (sans accès base de données ni bcrypt).
 * Utilisée :
 *  - par le middleware (runtime edge) pour protéger les routes ;
 *  - comme base étendue par la config Node complète (src/lib/auth/index.ts) qui ajoute
 *    le provider Credentials.
 *
 * Découplage imposé par NextAuth v5 : le middleware ne doit importer ni Prisma ni bcrypt.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/connexion",
  },
  session: { strategy: "jwt" },
  providers: [], // Le provider Credentials est ajouté dans la config Node (hors edge).
  callbacks: {
    /** Protège tout ce qui est sous /app : connexion obligatoire. */
    authorized({ auth, request }) {
      const estConnecte = Boolean(auth?.user);
      const { pathname } = request.nextUrl;
      const routeProtegee = pathname.startsWith("/app");
      if (routeProtegee) return estConnecte;
      return true;
    },
    /** Le token ne porte que l'identité (sub) ; le reste est relu en base. */
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
