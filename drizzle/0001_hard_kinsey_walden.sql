ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PATIENT';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" timestamp;