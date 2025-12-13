import { Pool } from "pg";


const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DB_URL is missing in your .env.local");
}

const db = new Pool({ connectionString })


export default db;