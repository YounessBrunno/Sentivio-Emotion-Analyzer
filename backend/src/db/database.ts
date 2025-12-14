import { Pool } from "pg";


const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DB_URL is missing in your .env.local");
}

const db = new Pool({ 
  connectionString,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})


export default db;