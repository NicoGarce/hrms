/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `leave_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `recruitment_jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_key" ON "leave_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "positions_title_key" ON "positions"("title");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_jobs_title_key" ON "recruitment_jobs"("title");
