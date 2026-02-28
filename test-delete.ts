import { db } from './db';
import { sessions } from './db/schema';
import { eq } from 'drizzle-orm';

async function testDelete() {
    try {
        const dummyId = '123e4567-e89b-12d3-a456-426614174000'; // Need a valid UUID format
        await db.delete(sessions)
            .where(eq(sessions.id, dummyId))
            .execute();
        console.log("Delete query composed and executed successfully");
    } catch (error: any) {
        console.log("Delete error:", error.message);
    }
    process.exit(0);
}

testDelete();
