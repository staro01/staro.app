-- AlterTable
ALTER TABLE "public"."Business" ADD COLUMN     "customerEmail" TEXT;

-- CreateIndex
CREATE INDEX "Business_customerEmail_idx" ON "public"."Business"("customerEmail");
