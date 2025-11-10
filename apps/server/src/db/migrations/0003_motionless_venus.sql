ALTER TABLE "roadmap" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('feature-request', 'bug-report', 'improvement');--> statement-breakpoint
ALTER TABLE "roadmap" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "roadmap_comment_upvote" ADD COLUMN "roadmap_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "roadmap_comment" ADD COLUMN "roadmap_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "roadmap_comment_upvote" ADD CONSTRAINT "roadmap_comment_upvote_roadmap_id_roadmap_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_comment" ADD CONSTRAINT "roadmap_comment_roadmap_id_roadmap_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap"("id") ON DELETE cascade ON UPDATE no action;