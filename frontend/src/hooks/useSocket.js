// src/hooks/useSocket.js
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast"; // ✅ sửa lại

export const useTaskNotification = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (task) => {
      console.log("Task mới nhận được:", task); // debug
      toast.success(task.message, {
        duration: 5000,
        icon: "📋",
      });
    };

    socket.on("new_task", handler);
    return () => socket.off("new_task", handler);
  }, [socket]);
};
