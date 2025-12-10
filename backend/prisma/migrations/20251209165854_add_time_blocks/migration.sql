-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('LUNCH', 'BREAK', 'DAY_OFF', 'VACATION', 'CUSTOM');

-- CreateTable
CREATE TABLE "time_blocks" (
    "id" TEXT NOT NULL,
    "type" "BlockType" NOT NULL DEFAULT 'CUSTOM',
    "reason" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_blocks_startsAt_endsAt_idx" ON "time_blocks"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "time_blocks_active_idx" ON "time_blocks"("active");
