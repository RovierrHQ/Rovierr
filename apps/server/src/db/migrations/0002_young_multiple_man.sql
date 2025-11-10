CREATE TYPE "public"."category" AS ENUM('Feature Request', 'Bug Report', 'Improvement');--> statement-breakpoint
CREATE TYPE "public"."roadmap_status_enum" AS ENUM('publish', 'preview');--> statement-breakpoint
CREATE TABLE "roadmap" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"title" text NOT NULL,
	"status" "roadmap_status_enum" NOT NULL,
	"category" "category" NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_comment_upvote" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"roadmap_comment_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"roadmap_comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"roadmap_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_comment_upvote" ADD CONSTRAINT "roadmap_comment_upvote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_comment_upvote" ADD CONSTRAINT "roadmap_comment_upvote_roadmap_comment_id_roadmap_comment_id_fk" FOREIGN KEY ("roadmap_comment_id") REFERENCES "public"."roadmap_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_comment" ADD CONSTRAINT "roadmap_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_likes" ADD CONSTRAINT "roadmap_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_likes" ADD CONSTRAINT "roadmap_likes_roadmap_id_roadmap_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap"("id") ON DELETE cascade ON UPDATE no action;