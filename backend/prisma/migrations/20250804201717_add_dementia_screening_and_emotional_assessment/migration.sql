-- CreateTable
CREATE TABLE "dementia_screenings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "DementiaRiskLevel" NOT NULL DEFAULT 'low',
    "recommendations" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dementia_screenings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_stages" (
    "id" TEXT NOT NULL,
    "testType" "TestType" NOT NULL,
    "stage" INTEGER NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "configuration" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotional_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testResultId" TEXT,
    "responses" JSONB NOT NULL,
    "emotionalScore" INTEGER NOT NULL DEFAULT 0,
    "emotionalState" TEXT,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emotional_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_stages_testType_stage_key" ON "test_stages"("testType", "stage");

-- AddForeignKey
ALTER TABLE "dementia_screenings" ADD CONSTRAINT "dementia_screenings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotional_assessments" ADD CONSTRAINT "emotional_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotional_assessments" ADD CONSTRAINT "emotional_assessments_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "test_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
