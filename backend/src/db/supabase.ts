import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});


const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
})

pool.on("connect",() => {
  console.log("Connection pool established with Database")
});

export default pool;