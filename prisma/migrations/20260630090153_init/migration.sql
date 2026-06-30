-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('en_attente_verification', 'actif', 'suspendu');

-- CreateEnum
CREATE TYPE "StatutDemandeRole" AS ENUM ('en_attente', 'approuvee', 'refusee');

-- CreateEnum
CREATE TYPE "TypeJeton" AS ENUM ('verification_email', 'reinitialisation_mot_de_passe');

-- CreateEnum
CREATE TYPE "TypeEtablissement" AS ENUM ('prescolaire', 'primaire', 'college', 'lycee', 'groupe_scolaire', 'autre');

-- CreateEnum
CREATE TYPE "StatutEtablissement" AS ENUM ('public', 'prive', 'confessionnel', 'autre');

-- CreateEnum
CREATE TYPE "TypeSalle" AS ENUM ('ordinaire', 'laboratoire', 'salle_informatique', 'atelier', 'salle_eps', 'autre');

-- CreateEnum
CREATE TYPE "CycleNiveau" AS ENUM ('prescolaire', 'primaire', 'college', 'lycee');

-- CreateEnum
CREATE TYPE "RegimeVacation" AS ENUM ('simple', 'double');

-- CreateEnum
CREATE TYPE "RegimeNotation" AS ENUM ('trimestre', 'semestre');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nomTechnique" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "rang" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "nom" TEXT,
    "prenoms" TEXT,
    "telephone" TEXT,
    "photoUrl" TEXT,
    "statutCompte" "StatutCompte" NOT NULL DEFAULT 'en_attente_verification',
    "emailVerifieLe" TIMESTAMP(3),
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "roleActifId" TEXT NOT NULL,
    "etablissementId" TEXT,
    "cafopId" TEXT,
    "apfcId" TEXT,
    "regionId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_role" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "roleDemandeId" TEXT NOT NULL,
    "statut" "StatutDemandeRole" NOT NULL DEFAULT 'en_attente',
    "structureDeclaree" TEXT,
    "etablissementDeclareId" TEXT,
    "cafopDeclareId" TEXT,
    "apfcDeclareId" TEXT,
    "regionDeclareeId" TEXT,
    "motif" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traiteLe" TIMESTAMP(3),
    "traiteParId" TEXT,

    CONSTRAINT "demandes_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liens_parent_eleve" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "lien" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liens_parent_eleve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jetons" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TypeJeton" NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "utiliseLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jetons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etablissements" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "type" "TypeEtablissement" NOT NULL DEFAULT 'college',
    "statut" "StatutEtablissement" NOT NULL DEFAULT 'public',
    "ville" TEXT,
    "adresse" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "regimeVacation" "RegimeVacation" NOT NULL DEFAULT 'simple',
    "regionId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etablissements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveaux" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "cycle" "CycleNiveau" NOT NULL DEFAULT 'college',

    CONSTRAINT "niveaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "couleur" TEXT,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "effectif" INTEGER NOT NULL DEFAULT 0,
    "etablissementId" TEXT NOT NULL,
    "niveauId" TEXT NOT NULL,
    "anneeScolaireId" TEXT,
    "regimeVacation" "RegimeVacation" NOT NULL DEFAULT 'simple',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salles" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL DEFAULT 0,
    "type" "TypeSalle" NOT NULL DEFAULT 'ordinaire',
    "etablissementId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annees_scolaires" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "debut" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "annees_scolaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grilles_horaires" (
    "id" TEXT NOT NULL,
    "niveauId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "etablissementId" TEXT,
    "heuresHebdo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbSeances" INTEGER,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "grilles_horaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "anneeScolaireCourante" TEXT,
    "regimeNotation" "RegimeNotation" NOT NULL DEFAULT 'trimestre',
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cafops" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "regionId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cafops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apfc" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "regionId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apfc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_activite" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "acteurEmail" TEXT,
    "action" TEXT NOT NULL,
    "cible" TEXT,
    "details" JSONB,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_activite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nomTechnique_key" ON "roles"("nomTechnique");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_roleActifId_idx" ON "utilisateurs"("roleActifId");

-- CreateIndex
CREATE INDEX "utilisateurs_etablissementId_idx" ON "utilisateurs"("etablissementId");

-- CreateIndex
CREATE INDEX "utilisateurs_cafopId_idx" ON "utilisateurs"("cafopId");

-- CreateIndex
CREATE INDEX "utilisateurs_apfcId_idx" ON "utilisateurs"("apfcId");

-- CreateIndex
CREATE INDEX "utilisateurs_regionId_idx" ON "utilisateurs"("regionId");

-- CreateIndex
CREATE INDEX "demandes_role_statut_idx" ON "demandes_role"("statut");

-- CreateIndex
CREATE INDEX "demandes_role_utilisateurId_idx" ON "demandes_role"("utilisateurId");

-- CreateIndex
CREATE INDEX "liens_parent_eleve_parentId_idx" ON "liens_parent_eleve"("parentId");

-- CreateIndex
CREATE INDEX "liens_parent_eleve_eleveId_idx" ON "liens_parent_eleve"("eleveId");

-- CreateIndex
CREATE UNIQUE INDEX "liens_parent_eleve_parentId_eleveId_key" ON "liens_parent_eleve"("parentId", "eleveId");

-- CreateIndex
CREATE UNIQUE INDEX "jetons_token_key" ON "jetons"("token");

-- CreateIndex
CREATE INDEX "jetons_utilisateurId_idx" ON "jetons"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "regions_nom_key" ON "regions"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "etablissements_code_key" ON "etablissements"("code");

-- CreateIndex
CREATE INDEX "etablissements_regionId_idx" ON "etablissements"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "niveaux_nom_key" ON "niveaux"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "niveaux_code_key" ON "niveaux"("code");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_nom_key" ON "disciplines"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_code_key" ON "disciplines"("code");

-- CreateIndex
CREATE INDEX "classes_etablissementId_idx" ON "classes"("etablissementId");

-- CreateIndex
CREATE INDEX "classes_niveauId_idx" ON "classes"("niveauId");

-- CreateIndex
CREATE INDEX "salles_etablissementId_idx" ON "salles"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "annees_scolaires_libelle_key" ON "annees_scolaires"("libelle");

-- CreateIndex
CREATE INDEX "grilles_horaires_niveauId_idx" ON "grilles_horaires"("niveauId");

-- CreateIndex
CREATE INDEX "grilles_horaires_etablissementId_idx" ON "grilles_horaires"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "grilles_horaires_niveauId_disciplineId_etablissementId_key" ON "grilles_horaires"("niveauId", "disciplineId", "etablissementId");

-- CreateIndex
CREATE INDEX "cafops_regionId_idx" ON "cafops"("regionId");

-- CreateIndex
CREATE INDEX "apfc_regionId_idx" ON "apfc"("regionId");

-- CreateIndex
CREATE INDEX "journal_activite_utilisateurId_idx" ON "journal_activite"("utilisateurId");

-- CreateIndex
CREATE INDEX "journal_activite_action_idx" ON "journal_activite"("action");

-- CreateIndex
CREATE INDEX "journal_activite_creeLe_idx" ON "journal_activite"("creeLe");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_roleActifId_fkey" FOREIGN KEY ("roleActifId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_cafopId_fkey" FOREIGN KEY ("cafopId") REFERENCES "cafops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_apfcId_fkey" FOREIGN KEY ("apfcId") REFERENCES "apfc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_role" ADD CONSTRAINT "demandes_role_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_role" ADD CONSTRAINT "demandes_role_roleDemandeId_fkey" FOREIGN KEY ("roleDemandeId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_role" ADD CONSTRAINT "demandes_role_traiteParId_fkey" FOREIGN KEY ("traiteParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liens_parent_eleve" ADD CONSTRAINT "liens_parent_eleve_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liens_parent_eleve" ADD CONSTRAINT "liens_parent_eleve_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jetons" ADD CONSTRAINT "jetons_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etablissements" ADD CONSTRAINT "etablissements_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "niveaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_anneeScolaireId_fkey" FOREIGN KEY ("anneeScolaireId") REFERENCES "annees_scolaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salles" ADD CONSTRAINT "salles_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grilles_horaires" ADD CONSTRAINT "grilles_horaires_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "niveaux"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grilles_horaires" ADD CONSTRAINT "grilles_horaires_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grilles_horaires" ADD CONSTRAINT "grilles_horaires_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cafops" ADD CONSTRAINT "cafops_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apfc" ADD CONSTRAINT "apfc_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
