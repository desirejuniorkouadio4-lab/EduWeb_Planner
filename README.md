# EduWeb Planner

Plateforme web nationale de gestion et de planification scolaire pour le système éducatif
ivoirien. Interface **unique adaptée dynamiquement au rôle** (13 rôles), avec un module phare de
**génération automatique d'emplois du temps** par solveur de contraintes.

> Contexte projet : voir [`CLAUDE.md`](CLAUDE.md) · Cahier des charges complet :
> [`docs/`](docs) · Avancement : [`ROADMAP.md`](ROADMAP.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 (driver adapter pg) ·
PostgreSQL (Neon) · Auth.js v5 · Resend · Stripe · Recharts · Motion · Vercel.

## Démarrage rapide

```bash
npm install
cp .env.example .env       # puis renseigner les variables
npm run dev                # http://localhost:3000
```

La **page d'accueil et les écrans publics** fonctionnent sans base de données. Les
fonctionnalités d'authentification et les pages `/app` nécessitent une base PostgreSQL branchée.

### Brancher la base (Neon)

1. Créer un projet sur [Neon](https://neon.tech) et récupérer les URL de connexion.
2. Dans `.env` : renseigner `DATABASE_URL` (endpoint *pooled*) et `DIRECT_URL` (endpoint direct).
3. Créer le schéma et le jeu de données initial :

```bash
npm run db:migrate   # crée les tables (migration Prisma)
npm run db:seed      # crée les 13 rôles + un compte administrateur
```

Compte admin par défaut (modifiable via `ADMIN_EMAIL` / `ADMIN_PASSWORD`) :
`admin@eduweb.ci` / `ChangeMoi!2026` — **à changer**.

### Variables d'environnement

Voir [`.env.example`](.env.example). Essentielles : `DATABASE_URL`, `DIRECT_URL`,
`AUTH_SECRET` (`npx auth secret`). Optionnelles selon les modules : `RESEND_API_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Sans `RESEND_API_KEY`, les e-mails sont
*simulés* et leur lien est affiché dans la console serveur (pratique en développement).

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm run start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migration Prisma (dev) |
| `npm run db:deploy` | Migrations en production |
| `npm run db:seed` | Rôles + compte admin |
| `npm run db:studio` | Prisma Studio |

## Architecture (repères)

```
src/
  app/                    Routes (App Router)
    page.tsx              Accueil public (animé)
    (auth)/               Inscription, connexion, mots de passe, vérification e-mail
    app/                  Espace authentifié (/app) — layout + dashboard + Système
    api/auth/             Route handler Auth.js
  lib/
    rbac/                 ⭐ Couche RBAC centralisée (rôles, périmètre, navigation, aperçu)
    auth/                 Config Auth.js (edge/node), session, jetons, mots de passe
    email/                Resend + gabarits
    prisma.ts             Client Prisma (singleton + adapter)
  components/             UI (ui/), marketing/, app/ (coquille authentifiée)
  proxy.ts                Proxy edge (ex-middleware) : protection des routes /app
prisma/schema.prisma      Schéma de données
```

**Principes non négociables** (cf. CLAUDE.md) : vérification des permissions **côté serveur**,
RBAC **centralisé** (jamais dupliqué), toute évolution du schéma via **migration Prisma**,
secrets **jamais exposés au client**.

## Déploiement (Vercel)

Importer le dépôt sur Vercel, reporter les variables d'environnement, et configurer la base Neon.
Le client Prisma est régénéré au build (`postinstall`).
