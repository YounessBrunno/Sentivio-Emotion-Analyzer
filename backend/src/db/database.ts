import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});


const db = new Pool({
    connectionString: process.env.SUPABASE_DB_URL
})


export default db;