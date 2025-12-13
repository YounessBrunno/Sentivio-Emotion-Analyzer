
import dotenv from "dotenv";
import path from "path";


const envPath = path.resolve(process.cwd(), "backend/.env.local"); 
dotenv.config({ path: envPath });

console.log("Loaded .env.local"); 
