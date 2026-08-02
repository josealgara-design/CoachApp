-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "yearsExperience" INTEGER,
    "careerGoal" TEXT,
    "careerGoalTargetDate" DATETIME,
    "resumeFileName" TEXT,
    "resumeStoredName" TEXT,
    "resumeMimeType" TEXT,
    "resumeSize" INTEGER,
    "resumeUploadedAt" DATETIME,
    "quizScores" JSONB,
    "quizCompletedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_clientId_key" ON "Profile"("clientId");
