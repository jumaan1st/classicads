import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        console.log('Adding is_deleted and deleted_at to services...');
        await db.execute(sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;`);
        await db.execute(sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;`);

        console.log('Adding is_deleted and deleted_at to projects...');
        await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;`);
        await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;`);

        console.log('Migrations applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    }
    process.exit(0);
}

main();
