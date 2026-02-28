import { db } from './db';
import { sql } from 'drizzle-orm';

async function forceMigration() {
    try {
        console.log("Injecting Services & Projects Tables...");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "services" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar(255) NOT NULL,
                "slug" varchar(255) NOT NULL UNIQUE,
                "category" varchar(50) NOT NULL,
                "description" text NOT NULL,
                "min_price" integer NOT NULL,
                "max_price" integer NOT NULL,
                "min_timeline_weeks" integer NOT NULL,
                "max_timeline_weeks" integer NOT NULL,
                "image" text NOT NULL,
                "materials" text[],
                "featured" boolean DEFAULT false NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "service_gallery" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "service_id" uuid NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
                "url" text NOT NULL,
                "display_order" integer DEFAULT 0 NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "projects" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "title" varchar(255) NOT NULL,
                "client_name" varchar(255) NOT NULL,
                "client_email" varchar(255),
                "status" varchar(50) NOT NULL,
                "start_date" timestamp NOT NULL,
                "end_date" timestamp,
                "budget" integer,
                "content" text,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "project_services" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
                "service_id" uuid NOT NULL REFERENCES "services"("id") ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS "project_assignments" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
                "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS "project_milestones" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
                "title" varchar(255) NOT NULL,
                "due_date" timestamp NOT NULL,
                "completed" boolean DEFAULT false NOT NULL,
                "completed_at" timestamp
            );

            CREATE TABLE IF NOT EXISTS "project_photos" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
                "url" text NOT NULL,
                "caption" text,
                "uploaded_at" timestamp DEFAULT now() NOT NULL
            );
        `);

        console.log("All tables injected successfully!");
    } catch (error: any) {
        console.error("Migration error:", error.message);
    }
    process.exit(0);
}

forceMigration();
