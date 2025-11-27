import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { sequelize } from './model/index.js';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/organization.routes.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config()
const PORT = process.env.PORT
const __dirname = path.resolve();
const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    // origin: "https://dutymanagement-2.onrender.com",
    credentials: true
}));

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/org",orgRoutes);
app.use("/api/tasks",taskRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log("Server is listening in Port: ", PORT);
})