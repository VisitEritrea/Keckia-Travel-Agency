CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text DEFAULT '' NOT NULL,
	"actor_role" text DEFAULT '' NOT NULL,
	"action" text NOT NULL,
	"collection" text DEFAULT '' NOT NULL,
	"record_id" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "records" (
	"id" text NOT NULL,
	"collection" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"updated_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"full_name" text NOT NULL,
	"role" text NOT NULL,
	"password_hash" text NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"must_change_password" integer DEFAULT 0 NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "records_collection_idx" ON "records" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "records_collection_created_by_idx" ON "records" USING btree ("collection","created_by");