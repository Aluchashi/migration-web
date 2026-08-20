-- CreateTable
CREATE TABLE "CareerMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suggestedCountries" JSONB NOT NULL,
    "suggestedJobs" JSONB NOT NULL,
    "missingRequirements" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerMatch_userId_createdAt_idx" ON "CareerMatch"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "CareerMatch" ADD CONSTRAINT "CareerMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep the server-owned table private from Supabase's public Data API.
ALTER TABLE "public"."CareerMatch" ENABLE ROW LEVEL SECURITY;
