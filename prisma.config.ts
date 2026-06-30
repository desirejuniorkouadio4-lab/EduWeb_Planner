import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Configuration Prisma (Prisma 7).
 * - `schema` : emplacement du schéma.
 * - `datasource.url` : URL utilisée par les commandes Migrate / Introspect (URL directe Neon de préférence).
 * - `migrations.seed` : commande de peuplement (`npm run db:seed` l'utilise aussi).
 *
 * Au runtime applicatif, la connexion passe par le driver adapter (src/lib/prisma.ts),
 * conformément au nouveau modèle Prisma 7.
 */

// Prisma 7 ne charge plus automatiquement le .env : on le charge nous-mêmes (API native Node ≥ 20.6).
try {
  process.loadEnvFile();
} catch {
  // .env absent (ex : CI où les variables sont déjà injectées) — on ignore silencieusement.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // URL directe (sans pooler) recommandée pour les migrations ; fallback sur DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
