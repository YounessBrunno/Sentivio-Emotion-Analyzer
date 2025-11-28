import express from "express";
import cors from "cors";
import helmet from "helmet"

// app
const app = express();

// middlewares

app.use(cors());
app.use(helmet());
app.use(express.json());


export default app;