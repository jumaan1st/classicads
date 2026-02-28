import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_NAME) {
    throw new Error("Missing database credentials in .env.local");
}

export default defineConfig({
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT as string),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false // Set to true for production if required
    },
    verbose: true,
    strict: true,
});
