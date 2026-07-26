CREATE TABLE IF NOT EXISTS "entry_revision" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" text NOT NULL,
	"patch" text NOT NULL,
	"revision" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "entry_revision" ADD COLUMN "note_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_revision" ADD CONSTRAINT "entry_revision_note_id_dev_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."dev_note"("id") ON DELETE cascade ON UPDATE no action;