// src/socket/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:8443"
  : "https://dutymanagement-3.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

// ✅ Thêm log để debug
socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("disconnect", () => console.log("❌ Socket disconnected"));
socket.on("connect_error", (err) =>
  console.log("🔴 Connect error:", err.message),
);

export default socket;
