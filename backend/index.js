import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import https from "https";
import fs from "fs";
import cookieParser from 'cookie-parser';
import { sequelize } from './model/index.js';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/organization.routes.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config()

const privateKey = fs.readFileSync("cert/server.key", "utf8");
const certificate = fs.readFileSync("cert/server.cert", "utf8");
const credentials = { key: privateKey, cert: certificate };

const PORT = process.env.PORT
const __dirname = path.resolve();
const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://dutymanagement-3.onrender.com",
    // origin: "https://dutymanagement-2.onrender.com",
    credentials: true
}));

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/org",orgRoutes);
app.use("/api/tasks",taskRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

const httpsServer = https.createServer(credentials, app);
app.listen(PORT, () => {
    console.log("Server is listening in Port: ", PORT);
})