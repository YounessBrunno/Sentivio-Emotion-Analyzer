import dotenv from "dotenv";
import path from "path";


const envPath = path.resolve(process.cwd(), ".env.local");

dotenv.config({ path: envPath });

console.log("ENV LOADED:", {
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});
