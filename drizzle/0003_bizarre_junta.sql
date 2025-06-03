ALTER TABLE "doctors" DROP CONSTRAINT "doctors_license_number_unique";--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "specialization" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "license_number";