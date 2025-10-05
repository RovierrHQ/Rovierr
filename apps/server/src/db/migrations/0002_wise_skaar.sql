-- Step 1: Add columns as nullable first
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint

-- Step 2: Update existing users to set username from email (remove @domain part)
UPDATE "user" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL;--> statement-breakpoint

-- Step 3: Make username NOT NULL and add unique constraint
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");--> statement-breakpoint