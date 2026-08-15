import { Pool } from "pg";

/**
 * The pg pool used for access to the application's database
 */
export const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
})