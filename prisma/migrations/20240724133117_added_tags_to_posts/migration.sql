-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('Technology', 'Event', 'Lifestyle', 'Announcement', 'Research', 'Achievement', 'Career', 'Internship', 'News', 'Student_Life');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "tags" "Tag"[];
