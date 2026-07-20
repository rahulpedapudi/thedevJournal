ALTER TABLE "dev_note" ALTER COLUMN "title" SET DEFAULT 'Untitled';--> statement-breakpoint
ALTER TABLE "dev_note" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "updated_at" DROP NOT NULL;