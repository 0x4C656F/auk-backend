-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followerIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
