import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { sequelize } from './model/index.js';
import authRoutes from "./routes/auth.routes.js";

dotenv.config()
const PORT = process.env.PORT

const app = express();
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true
// }));

app.use("/api/auth",authRoutes);

app.listen(PORT, () => {
    console.log("Server is listening in Port: ", PORT);
})