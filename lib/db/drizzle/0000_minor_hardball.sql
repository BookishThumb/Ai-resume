CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"status" text NOT NULL,
	"match_score" integer,
	"resume_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"password" text,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"skills" jsonb NOT NULL,
	"experience" integer NOT NULL,
	"education" text,
	"university" text,
	"resume_score" integer NOT NULL,
	"interview_score" integer NOT NULL,
	"final_score" integer NOT NULL,
	"recommendation" text,
	"status" text NOT NULL,
	"summary" text,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"status" text NOT NULL,
	"scheduled_at" timestamp,
	"transcript" text,
	"technical_score" integer,
	"communication_score" integer,
	"relevance_score" integer,
	"confidence_score" integer,
	"problem_solving_score" integer,
	"overall_score" integer,
	"ai_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"required_skills" jsonb NOT NULL,
	"experience" text NOT NULL,
	"salary_min" integer NOT NULL,
	"salary_max" integer NOT NULL,
	"location" text NOT NULL,
	"employment_type" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"status" text NOT NULL,
	"offer_accepted" boolean DEFAULT false NOT NULL,
	"documents_uploaded" boolean DEFAULT false NOT NULL,
	"verification_complete" boolean DEFAULT false NOT NULL,
	"training_assigned" boolean DEFAULT false NOT NULL,
	"joining_date" timestamp,
	"salary" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
