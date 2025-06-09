ALTER TABLE "chat" RENAME TO "messages";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "chat_thread_id_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "message";--> statement-breakpoint
ALTER TABLE "thread" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "thread" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "thread" DROP COLUMN "model";