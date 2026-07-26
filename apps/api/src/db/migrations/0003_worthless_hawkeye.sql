ALTER TABLE "dev_note" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "dev_note" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "deleted_at" timestamp;