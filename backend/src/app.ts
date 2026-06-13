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
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT'], 
}));
app.use(helmet());
app.use(express.json());


//routes
app.use("/api",uploadRouter);
app.use("/api",sessionRouter);

//Global Error Handling
app.use(handleError);

export default app;