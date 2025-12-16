import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) throw new Error("SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are missing in your .env.local");

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
