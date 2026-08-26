-- Profile redesign: multi-entry work experience, education, and languages
-- Old flat career fields are removed (dev-stage data loss is acceptable)

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "employer" TEXT,
    "years" INTEGER,
    "currentlyWorking" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationEntry" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "field" TEXT,
    "institution" TEXT,
    "passingYear" INTEGER,
    "result" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EducationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageEntry" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LanguageEntry_pkey" PRIMARY KEY ("id")
);

-- AlterTable: remove old flat fields
ALTER TABLE "Profile" DROP COLUMN "age";
ALTER TABLE "Profile" DROP COLUMN "currentJob";
ALTER TABLE "Profile" DROP COLUMN "company";
ALTER TABLE "Profile" DROP COLUMN "yearsExperience";
ALTER TABLE "Profile" DROP COLUMN "education";
ALTER TABLE "Profile" DROP COLUMN "institution";
ALTER TABLE "Profile" DROP COLUMN "languages";
ALTER TABLE "Profile" DROP COLUMN "preferredRegion";

-- AlterTable: add new fields
ALTER TABLE "Profile" ADD COLUMN "phone" TEXT;
ALTER TABLE "Profile" ADD COLUMN "district" TEXT;
ALTER TABLE "Profile" ADD COLUMN "softSkills" TEXT[];
ALTER TABLE "Profile" ADD COLUMN "preferredRegions" TEXT[];
ALTER TABLE "Profile" ADD COLUMN "timeline" TEXT;
ALTER TABLE "Profile" ADD COLUMN "familyStatus" TEXT;

-- CreateIndex
CREATE INDEX "WorkExperience_profileId_idx" ON "WorkExperience"("profileId");
CREATE INDEX "EducationEntry_profileId_idx" ON "EducationEntry"("profileId");
CREATE INDEX "LanguageEntry_profileId_idx" ON "LanguageEntry"("profileId");

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LanguageEntry" ADD CONSTRAINT "LanguageEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable row-level security for new tables (same policy as other tables)
ALTER TABLE "public"."WorkExperience" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EducationEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."LanguageEntry" ENABLE ROW LEVEL SECURITY;
