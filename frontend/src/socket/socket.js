// src/socket/socket.js
import { io } from "socket.io-client";

const socket = io("https://dutymanagement-3.onrender.com", {
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
