-- CreateTable
CREATE TABLE "SkillGapReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetJob" TEXT NOT NULL,
    "targetCountry" TEXT NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillGapReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillGapReport_userId_createdAt_idx" ON "SkillGapReport"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "SkillGapReport" ADD CONSTRAINT "SkillGapReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep the server-owned report table private from Supabase's public Data API.
ALTER TABLE "public"."SkillGapReport" ENABLE ROW LEVEL SECURITY;
