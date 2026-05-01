import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useTaskStore } from "../store/useTaskStore";
import toast from "react-hot-toast";

// ✅ Nhận orgId để chỉ xử lý task thuộc group đang xem
export const useTaskNotification = (currentOrgId) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (payload) => {
      console.log("📋 Task mới nhận được:", payload);

      // ✅ Thêm task vào store với flag isNew = true để highlight
      useTaskStore.setState((state) => {
        // Tránh duplicate
        const exists = state.tasks.some((t) => t.id === payload.taskId);
        if (exists) return state;

        const newTask = {
          id: payload.taskId,
          name: payload.taskName,
          deadline: payload.deadline,
          date: payload.deadline, // dùng để tính key trong tasksByDate
          organizationId: payload.orgId,
          color: "#f59e0b", // màu vàng mặc định cho task mới
          isNew: true, // ✅ flag highlight
          assignees: [],
        };

        return { tasks: [...state.tasks, newTask] };
      });

      // ✅ Toast với icon và duration dài hơn
      toast.success(`📋 Task mới: "${payload.taskName}"`, {
        duration: 6000,
        position: "top-right",
        style: {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #f59e0b",
          fontWeight: "600",
        },
        icon: "🆕",
      });

      // ✅ Tự động xóa flag isNew sau 30 giây
      setTimeout(() => {
        useTaskStore.setState((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === payload.taskId ? { ...t, isNew: false } : t,
          ),
        }));
      }, 30000);
    };

    socket.on("new_task", handler);
    return () => socket.off("new_task", handler);
  }, [socket]);
};
