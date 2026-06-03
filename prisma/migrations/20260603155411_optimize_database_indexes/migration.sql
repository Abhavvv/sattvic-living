-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AyurvedaContent_categoryId_idx" ON "AyurvedaContent"("categoryId");

-- CreateIndex
CREATE INDEX "AyurvedaContent_status_idx" ON "AyurvedaContent"("status");

-- CreateIndex
CREATE INDEX "Instructor_isActive_idx" ON "Instructor"("isActive");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "YogaClass_instructorId_idx" ON "YogaClass"("instructorId");

-- CreateIndex
CREATE INDEX "YogaClass_status_idx" ON "YogaClass"("status");

-- CreateIndex
CREATE INDEX "YogaSession_classId_idx" ON "YogaSession"("classId");

-- CreateIndex
CREATE INDEX "YogaSession_startTime_idx" ON "YogaSession"("startTime");

-- CreateIndex
CREATE INDEX "YogaSession_status_idx" ON "YogaSession"("status");
