ALTER TABLE "appointments" DROP CONSTRAINT "appointments_reserved_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "reserved_by";