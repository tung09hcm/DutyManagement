import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import https from "https";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import fs from "fs";
import cookieParser from "cookie-parser";
import { sequelize } from "./model/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/organization.routes.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();
const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const FRONTEND_ORIGIN = "https://dutymanagement-3.onrender.com";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// server.js
const userSocketMap = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(String(userId), socket.id);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    // Xóa user khỏi map khi disconnect
    for (const [uid, sid] of userSocketMap.entries()) {
      if (sid === socket.id) {
        userSocketMap.delete(uid);
        console.log(`User ${uid} disconnected`);
        break;
      }
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.query("SELECT 1");
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("DB error");
  }
});

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});
export { userSocketMap, io };
// ✅ Dùng server.listen thay vì app.listen
server.listen(PORT, () => {
  console.log("Server is listening on port:", PORT);

  setInterval(
    async () => {
      try {
        await axios.get(`${FRONTEND_ORIGIN}/api/health`);
        console.log("Self ping success");
      } catch {
        console.log("Self ping failed");
      }
    },
    1000 * 60 * 5,
  );
});
