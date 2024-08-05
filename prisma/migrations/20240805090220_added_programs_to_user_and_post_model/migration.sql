-- CreateEnum
CREATE TYPE "Program" AS ENUM ('BGF', 'BBA', 'BGM', 'BDS', 'BMS', 'BSE', 'MGM', 'MSE', 'MTL');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "relatedPrograms" "Program"[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "program" "Program";
