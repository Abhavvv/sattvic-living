-- CreateEnum
CREATE TYPE "YogaClassStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "YogaSessionStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "profileImage" TEXT,
    "certifications" TEXT,
    "specialization" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YogaClass" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "featuredImage" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "status" "YogaClassStatus" NOT NULL DEFAULT 'DRAFT',
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YogaClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YogaSession" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "meetingLink" TEXT,
    "capacity" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "status" "YogaSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YogaSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_slug_key" ON "Instructor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "YogaClass_slug_key" ON "YogaClass"("slug");

-- AddForeignKey
ALTER TABLE "YogaClass" ADD CONSTRAINT "YogaClass_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YogaSession" ADD CONSTRAINT "YogaSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "YogaClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
