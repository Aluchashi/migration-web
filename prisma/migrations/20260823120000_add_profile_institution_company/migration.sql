-- Add institution (education) and company (workplace) to Profile

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "institution" TEXT;
ALTER TABLE "Profile" ADD COLUMN "company" TEXT;
