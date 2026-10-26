CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"token_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "content_work" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"title_fa" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_fa" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"title_fa" text DEFAULT '' NOT NULL,
	"institution_en" text DEFAULT '' NOT NULL,
	"institution_fa" text DEFAULT '' NOT NULL,
	"field_en" text DEFAULT '' NOT NULL,
	"field_fa" text DEFAULT '' NOT NULL,
	"start_date" text DEFAULT '' NOT NULL,
	"end_date" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_fa" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"caption_en" text DEFAULT '' NOT NULL,
	"caption_fa" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"name_fa" text DEFAULT '' NOT NULL,
	"native_en" text DEFAULT '' NOT NULL,
	"native_fa" text DEFAULT '' NOT NULL,
	"level" smallint DEFAULT 3 NOT NULL,
	"level_en" text DEFAULT '' NOT NULL,
	"level_fa" text DEFAULT '' NOT NULL,
	CONSTRAINT "languages_level" CHECK ("languages"."level" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_name_len" CHECK (char_length("messages"."name") between 1 and 120),
	CONSTRAINT "messages_email_len" CHECK (char_length("messages"."email") between 3 and 254),
	CONSTRAINT "messages_message_len" CHECK (char_length("messages"."message") between 1 and 5000)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"title_fa" text DEFAULT '' NOT NULL,
	"badge_en" text DEFAULT '' NOT NULL,
	"badge_fa" text DEFAULT '' NOT NULL,
	"coauthors_en" text DEFAULT '' NOT NULL,
	"coauthors_fa" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_fa" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"tags_en" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags_fa" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"authors" text DEFAULT '' NOT NULL,
	"venue_en" text DEFAULT '' NOT NULL,
	"venue_fa" text DEFAULT '' NOT NULL,
	"status_en" text DEFAULT '' NOT NULL,
	"status_fa" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"name_fa" text DEFAULT '' NOT NULL,
	"headline_en" text DEFAULT '' NOT NULL,
	"headline_fa" text DEFAULT '' NOT NULL,
	"tagline_en" text DEFAULT '' NOT NULL,
	"tagline_fa" text DEFAULT '' NOT NULL,
	"status_en" text DEFAULT '' NOT NULL,
	"status_fa" text DEFAULT '' NOT NULL,
	"bio_en" text DEFAULT '' NOT NULL,
	"bio_fa" text DEFAULT '' NOT NULL,
	"content_intro_en" text DEFAULT '' NOT NULL,
	"content_intro_fa" text DEFAULT '' NOT NULL,
	"goals_intro_en" text DEFAULT '' NOT NULL,
	"goals_intro_fa" text DEFAULT '' NOT NULL,
	"research_interests_en" text[] DEFAULT '{}'::text[] NOT NULL,
	"research_interests_fa" text[] DEFAULT '{}'::text[] NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"linkedin_url" text DEFAULT '' NOT NULL,
	"github_url" text DEFAULT '' NOT NULL,
	"instagram_url" text DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"cv_url" text DEFAULT '' NOT NULL,
	"seo_title_en" text DEFAULT '' NOT NULL,
	"seo_title_fa" text DEFAULT '' NOT NULL,
	"seo_description_en" text DEFAULT '' NOT NULL,
	"seo_description_fa" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton" CHECK ("site_settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"group_en" text DEFAULT '' NOT NULL,
	"group_fa" text DEFAULT '' NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"name_fa" text DEFAULT '' NOT NULL,
	"level" smallint,
	CONSTRAINT "skills_level" CHECK ("skills"."level" between 0 and 5)
);
--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at" DESC NULLS LAST);