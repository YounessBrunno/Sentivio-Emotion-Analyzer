import app from "./app.js"
import dotenv  from "dotenv";


dotenv.config({path: ".env.local"});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {

    console.error("Startup failed:", err);
  }
})();

