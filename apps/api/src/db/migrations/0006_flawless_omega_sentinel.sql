ALTER TABLE "conversations" ADD COLUMN "type" text DEFAULT 'workspace';--> statement-breakpoint
ALTER TABLE "dev_note" ADD COLUMN "conversation_id" text;--> statement-breakpoint
ALTER TABLE "dev_note" ADD CONSTRAINT "dev_note_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;