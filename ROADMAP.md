# EduWeb Planner — Feuille de route & suivi d'avancement

Document de pilotage du développement. Il reprend les **8 phases** du cahier des charges (§8)
et sert de tableau de bord unique pour mesurer la progression. Mettre à jour les cases à chaque
livraison. Légende : `[x]` fait · `[~]` en cours / partiel · `[ ]` à venir.

> Règle de passage de phase : chaque phase doit produire un livrable **fonctionnel et testable**
> avant de démarrer la suivante.

---

## Phase 0 — Fondations techniques ✅ (livrée)

- [x] Initialisation Next.js 16 (App Router) + TypeScript strict + Tailwind v4
- [x] Connexion Prisma 7 ↔ PostgreSQL via driver adapter `@prisma/adapter-pg` (compatible Neon)
- [x] Schéma initial : `Utilisateur`, `Role`, `DemandeRole`, `LienParentEleve`, `Jeton`,
      entités de périmètre (`Region`, `Etablissement`, `Cafop`, `Apfc`), `JournalActivite`
- [x] Auth.js v5 (NextAuth) — provider Credentials, découpage edge-safe (`proxy.ts`) / Node
- [x] Couche **RBAC centralisée** : 13 rôles, périmètres, navigation pilotée par rôle,
      matrice d'accès, mode Aperçu (filtrage par périmètre)
- [x] Design system institutionnel (vert forêt + or) + page d'accueil animée (Motion)
- [x] `.env.example` documenté · script de seed (rôles + admin)
- [ ] Déploiement initial sur Vercel _(à faire par le porteur de projet : push GitHub + import Vercel)_
- [ ] Brancher une vraie `DATABASE_URL` Neon puis `npm run db:migrate` + `npm run db:seed`

## Phase 1 — RBAC & authentification complets ✅ (livrée)

- [x] Inscription (e-mail + mot de passe + rôle souhaité + structure déclarée)
- [x] Rôle technique `eleve` par défaut + `DemandeRole` en_attente créée automatiquement
- [x] Confirmation d'e-mail via jeton (Resend, avec repli console en dev)
- [x] Connexion / déconnexion · réinitialisation de mot de passe
- [x] **Accès restreint** (Mon Identification + Mon Profil) tant que la demande est en attente,
      avec bandeau de statut permanent
- [x] Tableau de bord adaptatif au rôle · barre latérale filtrée par rôle
- [x] Pages : Mon Identification, Mon Profil, Niveaux d'accès, Comptes utilisateurs, **Approbations**
- [x] Workflow d'approbation/refus (admin) → bascule du rôle actif + notification + journal
- [x] **Gestion des habilitations** (changement de rôle par l'admin, filtré par périmètre)
- [x] **Mode Aperçu de rôle** (filtré par périmètre, lecture seule, bandeau permanent)
- [x] Rôle relu en base à chaque requête → changement de rôle effectif sans reconnexion
- [ ] _(report Phase 2)_ rattachement au périmètre réel à l'approbation (dépend des entités)

## Phase 2 — Établissements & structure 🟡 (en cours)

- [x] Modèles : Région, Établissement, Classe, Niveau, Salle, Discipline (+ AnneeScolaire,
      GrilleHoraire, Configuration) — schéma validé, client généré
- [x] Page Établissements (liste filtrée par périmètre + création) et **détail** (salles & classes)
- [x] Configuration générale (année scolaire, régime de notation, régions, **grille horaire nationale**)
- [x] Seed enrichi : régions ivoiriennes, niveaux, disciplines, grille nationale, année + config
- [ ] Résolution du périmètre déclaré → entité réelle à l'approbation de rôle
- [ ] Édition fine de la grille horaire par établissement (surcharge du modèle national)
- [ ] Design & thème (version basique)
- [ ] Migration Prisma à exécuter une fois Neon branché (`npm run db:migrate` + `db:seed`)

## Phase 3 — Vie scolaire : noyau ⬜

- [ ] Affectations enseignants · inscriptions élèves · liens parent-élève
- [ ] Registre d'appel · Cahier de texte · Notes & bulletins
- [ ] Notifications système (in-app) — socle commun

## Phase 4 — Emplois du temps (solveur) ⬜ — module phare

- [ ] Modélisation contraintes dures / souples
- [ ] Moteur de **backtracking + heuristiques** (TS natif, pas de glouton)
- [ ] Interface de génération + affichage explicite des points de blocage
- [ ] Ajustement par glisser-déposer avec re-vérification temps réel des contraintes dures

## Phase 5 — CAFOP & APFC ⬜ _(parallélisable avec 3–4, ne dépend que du RBAC)_

- [ ] Modules CAFOP (promotions, cohortes) & APFC
- [ ] Import CSV compatible Moodle + convertisseur
- [ ] Rôles cafop_admin / apfc_admin / chef_antenne / conseiller_pedagogique opérationnels
- [ ] Affinage du mode Aperçu pour ces périmètres

## Phase 6 — Inspection, Rapports, Statistiques ⬜

- [ ] Inspection (visites, grilles d'évaluation, rapports, suivi des recommandations)
- [ ] Rapports & Activités
- [ ] Statistiques + tableaux de bord **Recharts**

## Phase 7 — Facturation, communication & finitions ⬜

- [ ] Stripe (abonnements, webhooks, échecs de paiement, reçus)
- [ ] Communication interne · Alertes SMS · Académie Premium
- [ ] Journal d'activité complet · Assistant d'installation

---

## État technique actuel

| Élément | Statut |
|---|---|
| `npm run dev` (page d'accueil + écrans publics) | ✅ fonctionne sans base de données |
| `npm run build` | ✅ 18 routes, build vert |
| `npm run typecheck` | ✅ aucune erreur |
| Auth / demandes de rôle / pages /app | ⏳ nécessitent une `DATABASE_URL` Neon branchée |

## Prochaines étapes immédiates

1. Créer un projet **Neon**, copier l'URL dans `.env` (`DATABASE_URL`, `DIRECT_URL`).
2. `npm run db:migrate` (crée les tables) puis `npm run db:seed` (13 rôles + compte admin).
3. (Optionnel) Clé **Resend** + `AUTH_SECRET` de production.
4. Tester le cycle complet : inscription → e-mail → connexion → approbation admin.
5. Déployer sur **Vercel** (variables d'environnement à reporter).
