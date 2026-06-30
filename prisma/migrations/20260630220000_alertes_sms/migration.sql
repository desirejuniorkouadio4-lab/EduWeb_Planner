-- CreateEnum
CREATE TYPE "TypeAlerteSMS" AS ENUM ('absence', 'note', 'convocation', 'info');

-- CreateEnum
CREATE TYPE "StatutSMS" AS ENUM ('simule', 'envoye', 'echec');

-- CreateTable
CREATE TABLE "alertes_sms" (
    "id" TEXT NOT NULL,
    "etablissementNom" TEXT,
    "telephone" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "type" "TypeAlerteSMS" NOT NULL DEFAULT 'info',
    "statut" "StatutSMS" NOT NULL DEFAULT 'simule',
    "envoyeParEmail" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_sms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertes_sms_creeLe_idx" ON "alertes_sms"("creeLe");
