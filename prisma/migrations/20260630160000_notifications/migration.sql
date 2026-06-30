-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('info', 'succes', 'alerte', 'role');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL DEFAULT 'info',
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lien" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "luLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_destinataireId_lu_idx" ON "notifications"("destinataireId", "lu");

-- CreateIndex
CREATE INDEX "notifications_creeLe_idx" ON "notifications"("creeLe");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
