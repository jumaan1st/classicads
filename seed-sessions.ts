import { db } from './db';
import { sessions, users } from './db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
    const allUsers = await db.select().from(users).limit(1);
    const admin = allUsers[0];
    if (!admin) {
        console.log('No admin found');
        process.exit(0);
    }

    // Clear existing to avoid infinite rows
    await db.delete(sessions).execute();

    await db.insert(sessions).values([
        { userId: admin.id, deviceInfo: 'Fake Mac Safari', ipAddress: '192.168.1.1' },
        { userId: admin.id, deviceInfo: 'Fake Windows Edge', ipAddress: '192.168.1.2' },
        { userId: admin.id, deviceInfo: 'Fake Linux Firefox', ipAddress: '192.168.1.3' },
    ]).execute();

    console.log('Seeded 3 sessions');
    process.exit(0);
}
seed();
