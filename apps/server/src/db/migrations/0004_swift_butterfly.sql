CREATE TABLE "roadmap_upvote" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"roadmap_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL
);
--> statement-breakpoint
DROP TABLE "roadmap_likes" CASCADE;--> statement-breakpoint
ALTER TABLE "roadmap_upvote" ADD CONSTRAINT "roadmap_upvote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_upvote" ADD CONSTRAINT "roadmap_upvote_roadmap_id_roadmap_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap"("id") ON DELETE cascade ON UPDATE no action;