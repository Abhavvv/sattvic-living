-- CreateTable
CREATE TABLE "SattvicMeal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "ingredients" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "doshaVata" TEXT NOT NULL,
    "doshaPitta" TEXT NOT NULL,
    "doshaKapha" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SattvicMeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SattvicMeal_category_idx" ON "SattvicMeal"("category");

-- CreateIndex
CREATE INDEX "SattvicMeal_isActive_idx" ON "SattvicMeal"("isActive");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "VerificationToken_identifier_idx" ON "VerificationToken"("identifier");
