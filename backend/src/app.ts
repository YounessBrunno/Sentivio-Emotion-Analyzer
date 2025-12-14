import express from "express";
import cors from "cors";
import helmet from "helmet"
import handleError from "./middlewares/error.middleware";
// routers
import uploadRouter from "./api/uploads/uploads.routes"
import sessionRouter from "./api/sessions/sessions.routes"

// app
const app = express();

// middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

//Global Error Handling
app.use(handleError);

//routes
app.use("/api",uploadRouter);
app.use("/api",sessionRouter);

export default app;