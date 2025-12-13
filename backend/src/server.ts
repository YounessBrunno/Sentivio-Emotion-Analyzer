import './config/dotenv';
import app from "./app";
import db from "./db/database";


const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.connect();
    console.log("Connection pool established with Supabase Database");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
  }
})();

