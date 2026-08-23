-- Add identity fields for register/login redesign:
-- User: unique required username, optional phone, email becomes optional
-- Profile: optional NID and date of birth

-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "Profile" ADD COLUMN "nid" TEXT;
ALTER TABLE "Profile" ADD COLUMN "dateOfBirth" TIMESTAMP(3);

-- BackfillData: generate usernames for existing users from their id
UPDATE "User"
SET "username" = 'user_' || lower(substring(replace("id", '-', ''), 1, 12))
WHERE "username" IS NULL;

-- AlterColumn
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "Profile_nid_key" ON "Profile"("nid");
