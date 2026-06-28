-- AlterTable
ALTER TABLE "Application" ADD COLUMN "type" TEXT,
                          ADD COLUMN "priority" TEXT,
                          ADD COLUMN "amount" DECIMAL(65,30),
                          ADD COLUMN "justification" TEXT,
                          ADD COLUMN "submittedAt" TIMESTAMP(3);
