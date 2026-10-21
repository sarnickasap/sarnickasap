CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"old_price" numeric(10, 2) DEFAULT 0 NOT NULL,
	"new_price" numeric(10, 2) DEFAULT 0 NOT NULL,
	"until" varchar(64) DEFAULT '' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"caption" varchar(128) DEFAULT '' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hours" (
	"day_index" integer PRIMARY KEY NOT NULL,
	"day" varchar(16) NOT NULL,
	"open" varchar(5) NOT NULL,
	"close" varchar(5) NOT NULL,
	"closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"category_id" integer NOT NULL,
	"price" numeric(10, 2) DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"stock" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) DEFAULT '' NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"visible" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_info" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"phone" varchar(32) NOT NULL,
	"whatsapp" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"hero_title" text NOT NULL,
	"hero_sub" text NOT NULL,
	"about" text NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"og_image_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;