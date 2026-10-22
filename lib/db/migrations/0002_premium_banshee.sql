CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"anahtar" varchar(255) NOT NULL,
	"zaman" timestamp with time zone DEFAULT now() NOT NULL
);
