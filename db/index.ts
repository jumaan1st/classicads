import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Required ENV:
 * DB_HOST
 * DB_PORT
 * DB_NAME
 * DB_USER
 * DB_PASSWORD
 * DB_POOL_MODE=transaction | direct (optional)
 */

const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_POOL_MODE,
} = process.env;

// Basic validation
if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error(" Missing required database environment variables");
}

// Detect environment
const isSupabase = DB_HOST.includes("supabase.com");
const isTransactionPool =
    DB_POOL_MODE === "transaction" || DB_PORT === "6543";

const client = postgres({
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,

    /**
     * Supabase Transaction Pooler (6543) requires prepare: false
     */
    prepare: isTransactionPool ? false : true,

    /**
     * SSL only required for Supabase / remote DB
     */
    ssl: isSupabase
        ? { rejectUnauthorized: false }
        : false,

    max: 10,
});

export const db = drizzle(client, { schema });